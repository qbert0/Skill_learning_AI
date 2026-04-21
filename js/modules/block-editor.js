window.BlockEditorModule = (() => {
    let selectedTable = null;
    let slashQuery = "";

    const allowedTags = new Set([
        "A", "AUDIO", "B", "BLOCKQUOTE", "BR", "CODE", "DEL", "DETAILS", "DIV", "EM", "FIGCAPTION",
        "FIGURE", "H1", "H2", "H3", "H4", "HR", "I", "IMG", "LI", "OL", "P", "PRE", "SOURCE",
        "STRONG", "SUB", "SUMMARY", "SUP", "TABLE", "TBODY", "TD", "TH", "THEAD", "TR", "U", "UL",
        "VIDEO"
    ]);

    const unwrapTags = new Set(["SECTION", "ARTICLE", "MAIN", "HEADER", "FOOTER", "SPAN"]);
    const groupLabels = {
        basic: "Basic",
        media: "Media",
        view: "View",
        inline: "Inline"
    };

    function editor() {
        return document.getElementById("markdownEditor");
    }

    function shell() {
        return document.querySelector("[data-block-editor-shell]") || document.querySelector(".markdown-workspace");
    }

    function slashMenu() {
        return document.getElementById("slashMenu");
    }

    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#039;"
        }[char]));
    }

    function sanitizePastedHtml(html) {
        const template = document.createElement("template");
        template.innerHTML = String(html || "");
        sanitizeNodeTree(template.content);
        return template.innerHTML;
    }

    function sanitizeNodeTree(root) {
        [...root.childNodes].forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) return;
            if (node.nodeType !== Node.ELEMENT_NODE) {
                node.remove();
                return;
            }

            const tagName = node.tagName.toUpperCase();
            if (!allowedTags.has(tagName)) {
                if (unwrapTags.has(tagName)) {
                    const fragment = document.createDocumentFragment();
                    while (node.firstChild) fragment.appendChild(node.firstChild);
                    node.replaceWith(fragment);
                    sanitizeNodeTree(root);
                    return;
                }
                node.replaceWith(document.createTextNode(node.textContent || ""));
                return;
            }

            const keptAttributes = {};
            if (tagName === "A") keptAttributes.href = node.getAttribute("href");
            if (tagName === "IMG") {
                keptAttributes.src = node.getAttribute("src");
                keptAttributes.alt = node.getAttribute("alt");
            }
            if (tagName === "SOURCE") keptAttributes.src = node.getAttribute("src");

            [...node.attributes].forEach(attribute => node.removeAttribute(attribute.name));

            if (tagName === "A") {
                const href = keptAttributes.href;
                if (!href || !/^(https?:|mailto:|#)/i.test(href)) {
                    node.replaceWith(document.createTextNode(node.textContent || ""));
                    return;
                }
                node.setAttribute("href", href);
                node.setAttribute("target", "_blank");
                node.setAttribute("rel", "noreferrer noopener");
            }

            if (tagName === "IMG") {
                const src = keptAttributes.src;
                if (!src || !/^(https?:|data:image\/|blob:|\/)/i.test(src)) {
                    node.remove();
                    return;
                }
                node.setAttribute("src", src);
                node.setAttribute("alt", keptAttributes.alt || "Image");
            }

            if (tagName === "SOURCE") {
                const src = keptAttributes.src;
                if (!src || !/^(https?:|blob:|\/)/i.test(src)) {
                    node.remove();
                    return;
                }
                node.setAttribute("src", src);
            }

            if (tagName === "VIDEO" || tagName === "AUDIO") {
                node.setAttribute("controls", "");
            }

            if (tagName === "DIV") {
                if (!node.textContent.trim() && !node.querySelector("br,img,video,audio,table")) {
                    node.remove();
                    return;
                }
                if (![...node.children].length) {
                    const paragraph = document.createElement("p");
                    paragraph.textContent = node.textContent;
                    node.replaceWith(paragraph);
                    return;
                }
            }

            sanitizeNodeTree(node);
        });
    }

    function insertHtmlAtCaret(html) {
        document.execCommand("insertHTML", false, html);
    }

    function insertPlainTextAtCaret(text) {
        const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
        const html = lines.map(line => line.trim() ? `<p>${escapeHtml(line)}</p>` : "<p><br></p>").join("");
        insertHtmlAtCaret(html);
    }

    function handlePaste(event) {
        const targetEditor = editor();
        if (!targetEditor || !event.target.closest("#markdownEditor")) return false;
        event.preventDefault();
        const html = event.clipboardData?.getData("text/html") || "";
        const text = event.clipboardData?.getData("text/plain") || "";
        if (html) {
            const sanitized = sanitizePastedHtml(html);
            insertHtmlAtCaret(sanitized || `<p>${escapeHtml(text)}</p>`);
        } else {
            insertPlainTextAtCaret(text);
        }
        return true;
    }

    function getPlugins() {
        return BlockPluginRegistry.getAll();
    }

    function setContent(content) {
        const target = editor();
        if (!target) return;
        target.innerHTML = /<[a-z][\s\S]*>/i.test(content) ? content : markdownToHtml(content);
    }

    function getContent() {
        return editor()?.innerHTML || "";
    }

    function markdownToHtml(markdown) {
        return String(markdown || "").split("\n").map(line => {
            const trimmed = line.trim();
            if (trimmed === "---") return "<hr>";
            if (trimmed.startsWith("#### ")) return `<h4>${escapeHtml(trimmed.slice(5))}</h4>`;
            if (trimmed.startsWith("### ")) return `<h3>${escapeHtml(trimmed.slice(4))}</h3>`;
            if (trimmed.startsWith("## ")) return `<h2>${escapeHtml(trimmed.slice(3))}</h2>`;
            if (trimmed.startsWith("# ")) return `<h1>${escapeHtml(trimmed.slice(2))}</h1>`;
            if (trimmed.startsWith("- [ ] ")) return `<p><input type="checkbox"> ${escapeHtml(trimmed.slice(6))}</p>`;
            if (!trimmed) return "<p><br></p>";
            return `<p>${escapeHtml(line).replace(/\[\[(.*?)\]\]/g, '<span class="page-link-token">[[$1]]</span>')}</p>`;
        }).join("");
    }

    function renderOutline(activePageId) {
        const source = editor();
        const target = document.getElementById("pageOutline");
        if (!source || !target) return;
        const headings = [...source.querySelectorAll("h1, h2, h3")].filter(item => item.textContent.trim());
        headings.forEach((heading, index) => {
            if (!heading.id) heading.id = `heading-${activePageId || "page"}-${index}`;
        });
        target.innerHTML = headings.length
            ? headings.map(heading => `
                <button type="button" data-outline-target="${heading.id}" class="outline-level-${heading.tagName.slice(1)}">
                    ${escapeHtml(heading.textContent.trim())}
                </button>
            `).join("")
            : '<div class="empty-outline">Chua co heading.</div>';
    }

    function scrollToOutlineHeading(id) {
        const heading = document.getElementById(id);
        if (!heading) return;
        heading.scrollIntoView({ behavior: "smooth", block: "start" });
        const range = document.createRange();
        range.selectNodeContents(heading);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function toggleOutline() {
        const panel = document.getElementById("pageOutlinePanel");
        const button = document.getElementById("pageOutlineToggle");
        const label = document.getElementById("pageOutlineToggleText");
        if (!panel || !button || !label) return;
        const isOpen = panel.classList.toggle("open");
        button.setAttribute("aria-expanded", String(isOpen));
        label.textContent = isOpen ? "An" : "Hien";
    }

    function getSlashContext() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;
        const range = selection.getRangeAt(0);
        if (!range.collapsed) return null;
        const node = range.startContainer;
        if (node.nodeType !== Node.TEXT_NODE) return null;
        const text = node.nodeValue || "";
        const before = text.slice(0, range.startOffset);
        const match = before.match(/(?:^|\s)\/([^\s/]*)$/);
        if (!match) return null;
        return {
            node,
            range,
            query: match[1] || "",
            slashIndex: before.lastIndexOf("/")
        };
    }

    function filterPlugins(query) {
        const normalizedQuery = normalizeText(query).trim();
        const plugins = getPlugins();
        if (!normalizedQuery) return plugins;
        return plugins
            .map(plugin => {
                const searchTerms = [plugin.label, ...(plugin.aliases || []), plugin.hint || ""].map(normalizeText);
                const prefixScore = searchTerms.some(term => term.startsWith(normalizedQuery)) ? 0 : 1;
                const includeMatch = searchTerms.some(term => term.includes(normalizedQuery));
                return includeMatch ? { plugin, prefixScore } : null;
            })
            .filter(Boolean)
            .sort((a, b) => a.prefixScore - b.prefixScore || (a.plugin.order || 0) - (b.plugin.order || 0))
            .map(item => item.plugin);
    }

    function renderSlashMenu(query = "") {
        const menu = slashMenu();
        if (!menu) return 0;
        slashQuery = query;
        const plugins = filterPlugins(query);
        const groups = plugins.reduce((accumulator, plugin) => {
            const key = plugin.group || "basic";
            if (!accumulator[key]) accumulator[key] = [];
            accumulator[key].push(plugin);
            return accumulator;
        }, {});

        menu.innerHTML = `
            <div class="slash-menu-header">
                <strong>Chen block</strong>
                <span>${query ? `/${escapeHtml(query)}` : "Tat ca block"}</span>
            </div>
            <div class="slash-menu-scroll">
                ${plugins.length ? Object.entries(groups).map(([groupName, groupPlugins]) => `
                    <div class="slash-menu-group">
                        <span class="slash-menu-group-label">${escapeHtml(groupLabels[groupName] || groupName)}</span>
                        ${groupPlugins.map(plugin => `
                            <button type="button" class="slash-menu-item" data-slash-command="${plugin.id}">
                                <span class="slash-menu-icon">${IconRegistry.svg(plugin.icon || "file")}</span>
                                <span class="slash-menu-copy">
                                    <strong>${escapeHtml(plugin.label)}</strong>
                                    <span>${escapeHtml(plugin.hint || "")}</span>
                                </span>
                            </button>
                        `).join("")}
                    </div>
                `).join("") : '<div class="slash-menu-empty">Khong tim thay block phu hop.</div>'}
            </div>
        `;
        return plugins.length;
    }

    function positionSlashMenu() {
        const menu = slashMenu();
        if (!menu) return;
        const rect = getCaretRect();
        const shellRect = shell().getBoundingClientRect();
        menu.style.left = `${Math.max(0, rect.left - shellRect.left)}px`;
        menu.style.top = `${Math.max(36, rect.bottom - shellRect.top + 8)}px`;
    }

    function openSlashMenu(query = "") {
        const menu = slashMenu();
        if (!menu) return;
        renderSlashMenu(query);
        positionSlashMenu();
        menu.classList.remove("hidden");
    }

    function closeSlashMenu() {
        slashQuery = "";
        slashMenu()?.classList.add("hidden");
    }

    function syncSlashMenu() {
        const context = getSlashContext();
        if (!context) {
            closeSlashMenu();
            return;
        }
        openSlashMenu(context.query);
    }

    function removeSlashTrigger() {
        const context = getSlashContext();
        if (!context) return;
        const text = context.node.nodeValue || "";
        context.node.nodeValue = text.slice(0, context.slashIndex) + text.slice(context.range.startOffset);
        const nextRange = document.createRange();
        nextRange.setStart(context.node, context.slashIndex);
        nextRange.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(nextRange);
    }

    function insertBlock(kind, context = {}) {
        const plugin = BlockPluginRegistry.get(kind);
        if (!plugin) return false;
        const html = typeof plugin.insert === "function" ? plugin.insert(context) : "";
        insertHtmlAtCaret(html);
        closeSlashMenu();
        return true;
    }

    function updateTableTools(target = document.activeElement) {
        const table = target?.closest?.("table") || window.getSelection()?.anchorNode?.parentElement?.closest?.("table");
        selectedTable = table || null;
        const tools = document.getElementById("tableTools");
        if (!tools) return;
        if (!selectedTable) {
            tools.classList.add("hidden");
            return;
        }
        const tableRect = selectedTable.getBoundingClientRect();
        const shellRect = shell().getBoundingClientRect();
        tools.style.left = `${Math.max(0, tableRect.left - shellRect.left)}px`;
        tools.style.top = `${Math.max(0, tableRect.top - shellRect.top - 42)}px`;
        tools.classList.remove("hidden");
    }

    function applyTableAction(action) {
        if (!selectedTable) return false;
        const rows = [...selectedTable.rows];
        if (!rows.length) return false;
        if (action === "add-column") {
            rows.forEach((row, rowIndex) => {
                const cell = document.createElement(rowIndex === 0 ? "th" : "td");
                cell.textContent = rowIndex === 0 ? `Cot ${row.cells.length + 1}` : "Noi dung";
                row.appendChild(cell);
            });
        }
        if (action === "remove-column" && rows[0].cells.length > 1) rows.forEach(row => row.deleteCell(row.cells.length - 1));
        if (action === "add-row") {
            const row = selectedTable.insertRow(-1);
            [...rows[0].cells].forEach(() => {
                const cell = row.insertCell(-1);
                cell.textContent = "Noi dung";
            });
        }
        if (action === "remove-row" && rows.length > 1) selectedTable.deleteRow(rows.length - 1);
        return true;
    }

    function applyLiveMarkdownShortcuts() {
        const targetEditor = editor();
        if (!targetEditor) return;
        const walker = document.createTreeWalker(targetEditor, NodeFilter.SHOW_TEXT);
        let target = null;
        while (walker.nextNode()) {
            if (walker.currentNode.nodeValue.trimEnd().endsWith("---")) target = walker.currentNode;
        }
        if (!target) return;
        target.nodeValue = target.nodeValue.replace(/---\s*$/, "");
        const block = target.parentElement?.closest("p, div, h1, h2, h3, h4, li") || target.parentElement;
        const hr = document.createElement("hr");
        const nextLine = document.createElement("p");
        nextLine.appendChild(document.createElement("br"));
        if (block && block !== targetEditor && !block.textContent.trim()) {
            block.replaceWith(hr, nextLine);
        } else if (block && block !== targetEditor) {
            block.after(hr, nextLine);
        } else {
            targetEditor.append(hr, nextLine);
        }
        placeCaretAtEnd(nextLine);
    }

    function getCaretRect() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return editor().getBoundingClientRect();
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(false);
        const marker = document.createElement("span");
        marker.textContent = "\u200b";
        range.insertNode(marker);
        const rect = marker.getBoundingClientRect();
        marker.remove();
        return rect;
    }

    function placeCaretAtEnd(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    return {
        setContent,
        getContent,
        markdownToHtml,
        renderOutline,
        scrollToOutlineHeading,
        toggleOutline,
        renderSlashMenu,
        openSlashMenu,
        closeSlashMenu,
        syncSlashMenu,
        handlePaste,
        removeSlashTrigger,
        insertBlock,
        updateTableTools,
        applyTableAction,
        applyLiveMarkdownShortcuts
    };
})();
