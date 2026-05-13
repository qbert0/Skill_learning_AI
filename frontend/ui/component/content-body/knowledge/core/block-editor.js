window.BlockEditorModule = (() => {
    let selectedTable = null;
    let slashQuery = "";
    let draggedBlock = null;
    let dropTarget = null;
    let dropPosition = "after";
    let hoveredBlock = null;
    let menuBlock = null;

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

    function shell() {
        return document.querySelector("[data-block-editor-shell]") || document.querySelector(".markdown-workspace");
    }

    function markdownRoot() {
        return document.getElementById("markdownRoot");
    }

    function visualEditor() {
        return document.getElementById("markdownEditor");
    }

    function codeEditor() {
        return document.getElementById("markdownCodeEditor");
    }

    function slashMenu() {
        return document.getElementById("slashMenu");
    }

    function blockMenu() {
        return document.getElementById("blockMenu");
    }

    function currentMode() {
        return markdownRoot()?.dataset.markdownMode || "visual";
    }

    function isVisualMode() {
        return currentMode() === "visual";
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

    function setMode(mode = "visual", options = {}) {
        const root = markdownRoot();
        const visualPane = document.getElementById("markdownVisualPane");
        const codePane = document.getElementById("markdownCodePane");
        if (!root || !visualPane || !codePane) return;

        const nextMode = mode === "code" ? "code" : "visual";
        const previousMode = currentMode();

        if (previousMode === "visual" && nextMode === "code") {
            syncCodeFromVisual();
        }
        if (previousMode === "code" && nextMode === "visual") {
            syncVisualFromCode();
        }

        root.dataset.markdownMode = nextMode;
        visualPane.classList.toggle("hidden", nextMode !== "visual");
        visualPane.classList.toggle("active", nextMode === "visual");
        codePane.classList.toggle("hidden", nextMode !== "code");
        codePane.classList.toggle("active", nextMode === "code");

        if (nextMode !== "visual") {
            hideTableTools();
            cleanupDragState();
            hideBlockControls();
        } else {
            syncBlocks();
        }

        if (options.focus !== false) {
            focusActiveEditor();
        }
    }

    function focusActiveEditor() {
        if (isVisualMode()) {
            visualEditor()?.focus();
            return;
        }
        codeEditor()?.focus();
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
        // TODO: migrate to Selection/Range API because execCommand is deprecated.
        document.execCommand("insertHTML", false, html);
    }

    function currentEditorRange() {
        const editor = visualEditor();
        const selection = window.getSelection();
        if (!editor || !selection?.rangeCount) return null;
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.startContainer)) return null;
        return range;
    }

    function isEffectivelyEmptyBlock(element) {
        if (!element) return false;
        const text = (element.textContent || "").replace(/\u200b/g, "").trim();
        if (text) return false;
        return !element.querySelector?.("img,video,audio,table,details,ul,ol,hr,pre,figure,blockquote");
    }

    function insertBlockHtmlAtCaret(html) {
        const editor = visualEditor();
        if (!editor) return false;

        const template = document.createElement("template");
        template.innerHTML = String(html || "").trim();
        const nodes = [...template.content.childNodes];
        if (!nodes.length) return false;

        const range = currentEditorRange();
        const anchorNode = range?.startContainer || document.activeElement;
        const anchorElement = anchorNode?.nodeType === Node.ELEMENT_NODE
            ? anchorNode
            : anchorNode?.parentElement || null;
        const anchorBlock = anchorElement?.closest?.(".knowledge-block");

        if (anchorBlock && editor.contains(anchorBlock)) {
            const semantic = KnowledgeBlockFeature.semanticRoot(anchorBlock);
            if (isEffectivelyEmptyBlock(semantic)) {
                anchorBlock.replaceWith(...nodes);
            } else {
                anchorBlock.after(...nodes);
            }
        } else {
            editor.append(...nodes);
        }

        const lastNode = nodes[nodes.length - 1];
        const caretTarget = lastNode?.nodeType === Node.ELEMENT_NODE
            ? lastNode
            : lastNode?.parentElement || null;

        syncBlocks();
        if (caretTarget?.isConnected) {
            placeCaretAtEnd(caretTarget);
        } else {
            visualEditor()?.focus();
        }
        return true;
    }

    function insertPlainTextAtCaret(text) {
        const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
        const html = lines.map(line => line.trim() ? `<p>${escapeHtml(line)}</p>` : "<p><br></p>").join("");
        insertHtmlAtCaret(html);
    }

    function insertTextAtSelection(text) {
        const target = codeEditor();
        if (!target) return false;
        const start = target.selectionStart ?? target.value.length;
        const end = target.selectionEnd ?? target.value.length;
        target.value = `${target.value.slice(0, start)}${text}${target.value.slice(end)}`;
        const caret = start + text.length;
        target.setSelectionRange(caret, caret);
        target.focus();
        return true;
    }

    function pluginMarkdown(plugin, context = {}) {
        if (!plugin) return "";
        if (typeof plugin.markdownInsert === "function") return String(plugin.markdownInsert(context) || "");
        if (typeof plugin.insert === "function") {
            return KnowledgeBlockRegistry.htmlToMarkdown(plugin.insert(context));
        }
        return "";
    }

    function handlePaste(event) {
        if (!isVisualMode()) return false;
        const targetEditor = visualEditor();
        if (!targetEditor || !event.target.closest("#markdownEditor")) return false;
        event.preventDefault();
        const html = event.clipboardData?.getData("text/html") || "";
        const text = event.clipboardData?.getData("text/plain") || "";
        if (html) {
            const sanitized = sanitizePastedHtml(html);
            insertHtmlAtCaret(sanitized || `<p>${escapeHtml(text)}</p>`);
        } else {
            insertHtmlAtCaret(KnowledgeBlockRegistry.markdownToHtml(text));
        }
        return true;
    }

    function getPlugins() {
        return KnowledgeBlockRegistry.getAll();
    }

    function syncCodeFromVisual() {
        const target = codeEditor();
        if (!target) return;
        target.value = getMarkdown();
    }

    function syncVisualFromCode() {
        const target = visualEditor();
        const source = codeEditor();
        if (!target || !source) return;
        target.innerHTML = KnowledgeBlockRegistry.markdownToHtml(source.value);
        syncBlocks();
    }

    function setContent(content) {
        const code = codeEditor();
        const visual = visualEditor();
        if (!code || !visual) return;

        const hasHtml = /^\s*</.test(String(content || "")) && /<\/?[a-z]/i.test(String(content || ""));
        const markdown = hasHtml ? KnowledgeBlockRegistry.htmlToMarkdown(String(content || "")) : String(content || "");
        code.value = markdown;
        visual.innerHTML = hasHtml ? String(content || "") : KnowledgeBlockRegistry.markdownToHtml(markdown);
        syncBlocks();
        if (!isVisualMode()) hideTableTools();
    }

    function getVisualHtml() {
        const target = visualEditor();
        if (!target) return "";
        cleanupDragState();
        const clone = target.cloneNode(true);
        return [...clone.childNodes].map(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return node.textContent || "";
            const isWrappedBlock = node.classList?.contains?.("knowledge-block")
                || !!KnowledgeBlockFeature.contentRoot(node);

            if (!isWrappedBlock) return node.outerHTML;

            const semanticHtml = KnowledgeBlockFeature.unwrapClone(node);
            node.classList.remove("knowledge-block", "block-dragging", "block-drop-before", "block-drop-after", "block-menu-open");
            delete node.dataset.blockIndex;
            delete node.dataset.blockType;
            delete node.dataset.blockColor;
            return semanticHtml;
        }).join("") || "";
    }

    function getContent() {
        if (isVisualMode()) {
            const markdown = getMarkdown();
            const code = codeEditor();
            if (code) code.value = markdown;
            return markdown;
        }
        return codeEditor()?.value || "";
    }

    function getSupportedBlocks() {
        return KnowledgeBlockRegistry.supportedBlocks();
    }

    function getMarkdown() {
        if (!isVisualMode()) return codeEditor()?.value || "";
        return KnowledgeBlockRegistry.htmlToMarkdown(getVisualHtml());
    }

    function markdownToHtml(markdown) {
        const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
        const html = [];

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            const trimmed = line.trim();

            if (trimmed.startsWith(":::toggle")) {
                const summary = trimmed.replace(":::toggle", "").trim() || "Toggle";
                const bodyLines = [];
                index += 1;
                while (index < lines.length && lines[index].trim() !== ":::") {
                    bodyLines.push(lines[index]);
                    index += 1;
                }
                const bodyHtml = markdownToHtml(bodyLines.join("\n")) || "<p><br></p>";
                html.push(`<details open><summary>${escapeHtml(summary)}</summary>${bodyHtml}</details>`);
                continue;
            }

            if (trimmed.startsWith(":::board-view")) {
                const bodyLines = [];
                index += 1;
                while (index < lines.length && lines[index].trim() !== ":::") {
                    bodyLines.push(lines[index]);
                    index += 1;
                }
                html.push(boardMarkdownToHtml(bodyLines));
                continue;
            }

            if (trimmed.startsWith(":::calendar-view")) {
                const bodyLines = [];
                index += 1;
                while (index < lines.length && lines[index].trim() !== ":::") {
                    bodyLines.push(lines[index]);
                    index += 1;
                }
                html.push(calendarMarkdownToHtml(bodyLines));
                continue;
            }

            if (trimmed.startsWith("```")) {
                const codeLines = [];
                index += 1;
                while (index < lines.length && !lines[index].trim().startsWith("```")) {
                    codeLines.push(lines[index]);
                    index += 1;
                }
                html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
                continue;
            }

            const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imageMatch) {
                html.push(`<figure><img src="${escapeHtml(imageMatch[2])}" alt="${escapeHtml(imageMatch[1])}"></figure>`);
                continue;
            }

            const audioMatch = trimmed.match(/^\[audio\]\((.*?)\)$/i);
            if (audioMatch) {
                html.push(`<figure><audio controls src="${escapeHtml(audioMatch[1])}"></audio><figcaption>Audio source</figcaption></figure>`);
                continue;
            }

            const videoMatch = trimmed.match(/^\[video\]\((.*?)\)$/i);
            if (videoMatch) {
                html.push(`<figure><video controls src="${escapeHtml(videoMatch[1])}"></video><figcaption>Video source</figcaption></figure>`);
                continue;
            }

            if (isMarkdownTableRow(trimmed) && isMarkdownTableSeparator(lines[index + 1]?.trim() || "")) {
                const tableLines = [trimmed];
                while (index + 1 < lines.length && isMarkdownTableRow(lines[index + 1].trim())) {
                    index += 1;
                    tableLines.push(lines[index].trim());
                }
                html.push(tableMarkdownToHtml(tableLines));
                continue;
            }

            if (trimmed === "---") {
                html.push("<hr>");
                continue;
            }
            if (trimmed.startsWith("#### ")) {
                html.push(`<h4>${escapeHtml(trimmed.slice(5))}</h4>`);
                continue;
            }
            if (trimmed.startsWith("### ")) {
                html.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
                continue;
            }
            if (trimmed.startsWith("## ")) {
                html.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
                continue;
            }
            if (trimmed.startsWith("# ")) {
                html.push(`<h1>${renderInlineMarkdown(trimmed.slice(2))}</h1>`);
                continue;
            }
            if (trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] ") || trimmed.startsWith("- [X] ")) {
                const items = [];
                while (index < lines.length) {
                    const current = lines[index].trim();
                    const match = current.match(/^- \[([ xX])\] (.+)$/);
                    if (!match) break;
                    items.push({
                        checked: match[1].toLowerCase() === "x",
                        text: match[2]
                    });
                    index += 1;
                }
                index -= 1;
                html.push(`
                    <ul class="checklist-block">
                        ${items.map(item => `<li><label><input type="checkbox" ${item.checked ? "checked" : ""}> <span>${renderInlineMarkdown(item.text)}</span></label></li>`).join("")}
                    </ul>
                `);
                continue;
            }
            if (trimmed.startsWith("- ")) {
                const items = [];
                while (index < lines.length) {
                    const current = lines[index].trim();
                    if (!current.startsWith("- ") || current.startsWith("- [")) break;
                    items.push(current.slice(2));
                    index += 1;
                }
                index -= 1;
                html.push(`<ul>${items.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
                continue;
            }
            if (/^\d+\.\s/.test(trimmed)) {
                const items = [];
                while (index < lines.length) {
                    const current = lines[index].trim();
                    if (!/^\d+\.\s/.test(current)) break;
                    items.push(current.replace(/^\d+\.\s/, ""));
                    index += 1;
                }
                index -= 1;
                html.push(`<ol>${items.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`);
                continue;
            }
            if (!trimmed) {
                html.push("<p><br></p>");
                continue;
            }
            html.push(`<p>${renderInlineMarkdown(line)}</p>`);
        }

        return html.join("");
    }

    function renderInlineMarkdown(value) {
        let html = escapeHtml(value);
        html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
        html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        html = html.replace(/~~([^~]+)~~/g, "<del>$1</del>");
        html = html.replace(/\[\[(.*?)\]\]/g, '<span class="page-link-token">[[$1]]</span>');
        return html;
    }

    function boardMarkdownToHtml(lines = []) {
        const columns = lines
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => {
                const [title, ...items] = line.split("|").map(part => part.trim()).filter(Boolean);
                return { title: title || "Cột", items };
            });
        if (!columns.length) {
            return '<div class="gallery-grid"><article><strong>Todo</strong><p>Task</p></article></div>';
        }
        return `
            <div class="gallery-grid">
                ${columns.map(column => `
                    <article>
                        <strong>${escapeHtml(column.title)}</strong>
                        ${column.items.length ? column.items.map(item => `<p>${renderInlineMarkdown(item)}</p>`).join("") : "<p>Task</p>"}
                    </article>
                `).join("")}
            </div>
        `;
    }

    function calendarMarkdownToHtml(lines = []) {
        const rows = lines
            .map(line => line.trim())
            .filter(Boolean)
            .filter(line => isMarkdownTableRow(line))
            .map(line => line.replace(/^\||\|$/g, "").split("|").map(cell => cell.trim()));
        if (rows.length < 2) {
            return '<div><strong>Calendar view</strong><table><tbody><tr><th>Mon</th><th>Tue</th><th>Wed</th></tr><tr><td>Review</td><td></td><td>Practice</td></tr></tbody></table></div>';
        }
        const [header, ...body] = rows;
        return `
            <div>
                <strong>Calendar view</strong>
                <table>
                    <thead><tr>${header.map(cell => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead>
                    <tbody>${body.map(row => `<tr>${row.map(cell => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
                </table>
            </div>
        `;
    }

    function isMarkdownTableRow(line) {
        const value = String(line || "").trim();
        if (!value || !value.includes("|")) return false;
        const cells = value.replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
        return cells.length >= 2 && cells.some(Boolean);
    }

    function isMarkdownTableSeparator(line) {
        const cells = String(line || "")
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map(cell => cell.trim());
        if (cells.length < 2) return false;
        return cells.every(cell => /^:?-{3,}:?$/.test(cell));
    }

    function tableMarkdownToHtml(lines) {
        const rows = lines
            .map(line => line.replace(/^\||\|$/g, "").split("|").map(cell => escapeHtml(cell.trim())))
            .filter(row => row.length);
        if (rows.length < 2) return `<p>${escapeHtml(lines.join("\n"))}</p>`;
        const [header, separator, ...body] = rows;
        const isSeparator = separator.every(cell => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
        if (!isSeparator) return `<p>${escapeHtml(lines.join("\n"))}</p>`;
        return `
            <table>
                <thead><tr>${header.map(cell => `<th>${cell}</th>`).join("")}</tr></thead>
                <tbody>${body.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
        `;
    }

    function renderOutline(activePageId) {
        const target = document.getElementById("pageOutline");
        if (isVisualMode()) {
            KnowledgeOutlineModule.render(target, visualEditor(), activePageId, escapeHtml);
            return;
        }
        const lines = String(codeEditor()?.value || "").split("\n");
        const headings = lines
            .map((line, index) => ({ line, index }))
            .filter(item => /^(#{1,4})\s+/.test(item.line.trim()))
            .map(item => {
                const match = item.line.trim().match(/^(#{1,4})\s+(.+)$/);
                return {
                    level: match[1].length,
                    text: match[2].trim(),
                    target: `code-line-${item.index}`
                };
            });
        target.innerHTML = headings.length
            ? headings.map(heading => `
                <button type="button" data-outline-target="${heading.target}" class="outline-level-${heading.level}">
                    ${escapeHtml(heading.text)}
                </button>
            `).join("")
            : '<div class="empty-outline">Chưa có heading.</div>';
    }

    function scrollToOutlineHeading(id) {
        if (!isVisualMode() && id.startsWith("code-line-")) {
            const lineIndex = Number.parseInt(id.replace("code-line-", ""), 10);
            const editor = codeEditor();
            if (!editor || Number.isNaN(lineIndex)) return;
            const lines = editor.value.split("\n");
            const start = lines.slice(0, lineIndex).join("\n").length + (lineIndex > 0 ? 1 : 0);
            editor.focus();
            editor.setSelectionRange(start, start);
            return;
        }
        const heading = document.getElementById(id);
        if (!heading) return;
        heading.scrollIntoView({ behavior: "smooth", block: "start" });
        if (!isVisualMode()) return;
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
        KnowledgeOutlineModule.toggle(panel, button, label);
    }

    function getSlashContext() {
        if (!isVisualMode()) {
            const target = codeEditor();
            if (!target) return null;
            const caret = target.selectionStart ?? 0;
            const before = target.value.slice(0, caret);
            const match = before.match(/(?:^|\s)\/([^\s/]*)$/);
            if (!match) return null;
            return {
                type: "code",
                query: match[1] || "",
                slashIndex: before.lastIndexOf("/"),
                caret
            };
        }

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
            type: "visual",
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
                <strong>Chèn block</strong>
                <span>${query ? `/${escapeHtml(query)}` : "Tất cả block"}</span>
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
                `).join("") : '<div class="slash-menu-empty">Không tìm thấy block phù hợp.</div>'}
            </div>
        `;
        return plugins.length;
    }

    function getCaretRect() {
        if (!isVisualMode()) {
            return codeEditor()?.getBoundingClientRect() || shell().getBoundingClientRect();
        }
        const selection = window.getSelection();
        if (!selection.rangeCount) return visualEditor().getBoundingClientRect();
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(false);
        const marker = document.createElement("span");
        marker.textContent = "\u200b";
        range.insertNode(marker);
        const rect = marker.getBoundingClientRect();
        marker.remove();
        return rect;
    }

    function positionSlashMenu() {
        const menu = slashMenu();
        if (!menu) return;
        const rect = getCaretRect();
        const shellRect = shell().getBoundingClientRect();
        const gap = 8;
        const menuWidth = menu.offsetWidth || 380;
        const menuHeight = menu.offsetHeight || 360;
        const viewportPadding = 8;
        const openUp = rect.top > window.innerHeight / 2;

        const viewportLeft = Math.min(
            window.innerWidth - menuWidth - viewportPadding,
            Math.max(viewportPadding, rect.left)
        );
        const viewportTop = openUp
            ? Math.max(viewportPadding, rect.top - menuHeight - gap)
            : Math.min(window.innerHeight - menuHeight - viewportPadding, rect.bottom + gap);

        menu.style.left = `${Math.max(0, viewportLeft - shellRect.left)}px`;
        menu.style.top = `${Math.max(0, viewportTop - shellRect.top)}px`;
    }

    function openSlashMenu(query = "") {
        const menu = slashMenu();
        if (!menu) return;
        renderSlashMenu(query);
        menu.classList.remove("hidden");
        positionSlashMenu();
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

        if (context.type === "code") {
            const target = codeEditor();
            if (!target) return;
            const start = context.slashIndex;
            target.value = target.value.slice(0, start) + target.value.slice(context.caret);
            target.setSelectionRange(start, start);
            target.focus();
            return;
        }

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

        if (isVisualMode()) {
            const html = typeof plugin.insert === "function" ? plugin.insert(context) : "";
            if (!insertBlockHtmlAtCaret(html)) return false;
            closeSlashMenu();
            return true;
        }

        const markdown = pluginMarkdown(plugin, context);
        if (!markdown) return false;
        insertTextAtSelection(markdown);
        closeSlashMenu();
        return true;
    }

    function hideTableTools() {
        document.getElementById("tableTools")?.classList.add("hidden");
    }

    function positionFloatingElement(element, block, xOffset = 0, yOffset = 0) {
        if (!element || !block) return;
        const blockRect = block.getBoundingClientRect();
        const shellRect = shell().getBoundingClientRect();
        element.style.left = `${Math.max(6, blockRect.left - shellRect.left + xOffset)}px`;
        element.style.top = `${Math.max(0, blockRect.top - shellRect.top + yOffset)}px`;
    }

    function showBlockMenu(block) {
        const menu = blockMenu();
        if (!menu || !block || !isVisualMode()) return;
        menuBlock = block;
        positionFloatingElement(menu, block, 8, 42);
        menu.classList.remove("hidden");
        block.classList.add("block-menu-open");
    }

    function hideBlockMenu() {
        const menu = blockMenu();
        if (!menu) return;
        menu.classList.add("hidden");
        menuBlock?.classList.remove("block-menu-open");
        menuBlock = null;
    }

    function hideBlockControls() {
        hideBlockMenu();
        hoveredBlock = null;
    }

    function activeBlockTarget() {
        return menuBlock || hoveredBlock || draggedBlock;
    }

    function trackHoveredBlock(target) {
        if (!isVisualMode()) return;
        if (target?.closest?.(".block-feature-button, #blockMenu")) return;
        const block = resolveDragBlock(target);
        if (!block || !visualEditor()?.contains(block)) {
            if (!menuBlock) hoveredBlock = null;
            return;
        }
        hoveredBlock = block;
    }

    function clearHoveredBlock() {
        if (!menuBlock) hoveredBlock = null;
    }

    function toggleBlockMenu() {
        const block = activeBlockTarget();
        if (!block) return false;
        if (menuBlock === block) {
            hideBlockMenu();
            return true;
        }
        showBlockMenu(block);
        return true;
    }

    function deleteActiveBlock() {
        const block = activeBlockTarget();
        if (!block || !visualEditor()?.contains(block)) return false;
        const nextFocus = block.nextElementSibling || block.previousElementSibling;
        block.remove();
        hideBlockControls();
        syncBlocks();
        if (nextFocus) placeCaretAtEnd(nextFocus);
        else visualEditor()?.focus();
        return true;
    }

    function applyBlockColor(color = "default") {
        const block = activeBlockTarget();
        if (!block || !visualEditor()?.contains(block)) return false;
        const normalized = ["default", "sand", "mint", "rose"].includes(color) ? color : "default";
        if (normalized === "default") delete block.dataset.blockColor;
        else block.dataset.blockColor = normalized;
        hideBlockMenu();
        return true;
    }

    function updateTableTools(target = document.activeElement) {
        if (!isVisualMode()) {
            hideTableTools();
            return;
        }
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
        if (!isVisualMode() || !selectedTable) return false;
        const rows = [...selectedTable.rows];
        if (!rows.length) return false;
        if (action === "add-column") {
            rows.forEach((row, rowIndex) => {
                const cell = document.createElement(rowIndex === 0 ? "th" : "td");
                cell.textContent = rowIndex === 0 ? `Cột ${row.cells.length + 1}` : "Nội dung";
                row.appendChild(cell);
            });
        }
        if (action === "remove-column" && rows[0].cells.length > 1) rows.forEach(row => row.deleteCell(row.cells.length - 1));
        if (action === "add-row") {
            const row = selectedTable.insertRow(-1);
            [...rows[0].cells].forEach(() => {
                const cell = row.insertCell(-1);
                cell.textContent = "Nội dung";
            });
        }
        if (action === "remove-row" && rows.length > 1) selectedTable.deleteRow(rows.length - 1);
        syncBlocks();
        return true;
    }

    function applyLiveMarkdownShortcuts() {
        if (!isVisualMode()) return;
        const targetEditor = visualEditor();
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
        syncBlocks();
    }

    function placeCaretAtEnd(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function isBlockElement(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
        const tagName = element.tagName.toUpperCase();
        return [
            "P", "H1", "H2", "H3", "H4", "UL", "OL", "HR", "BLOCKQUOTE", "DETAILS",
            "PRE", "TABLE", "FIGURE", "DIV"
        ].includes(tagName);
    }

    function topLevelBlocks() {
        const editor = visualEditor();
        if (!editor) return [];
        [...editor.children].forEach(node => {
            if (node.classList?.contains("knowledge-block")) {
                KnowledgeBlockFeature.ensureStructure(node);
                return;
            }
            if (isBlockElement(node)) KnowledgeBlockFeature.ensureStructure(node);
        });
        return [...editor.children].filter(node => node.classList?.contains("knowledge-block"));
    }

    function syncBlocks() {
        if (!isVisualMode()) return;
        topLevelBlocks().forEach((block, index) => {
            block.draggable = false;
            block.dataset.blockIndex = String(index);
            block.dataset.blockType = KnowledgeBlockRegistry.detectType(block) || "text";
            block.title = `Block: ${block.dataset.blockType}`;
        });
    }

    function cleanupDragState() {
        topLevelBlocks().forEach(block => {
            block.classList.remove("block-dragging", "block-drop-before", "block-drop-after");
        });
        dropTarget = null;
        dropPosition = "after";
    }

    function resolveDragBlock(target) {
        return target?.closest?.(".knowledge-block") || null;
    }

    function handleDragStart(event) {
        if (!isVisualMode()) return false;
        if (!event.target.closest?.(".block-feature-button")) return false;
        const block = event.target.closest(".knowledge-block") || activeBlockTarget();
        if (!block || !visualEditor()?.contains(block)) return false;
        draggedBlock = block;
        menuBlock = null;
        cleanupDragState();
        hideBlockMenu();
        block.classList.add("block-dragging");
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", block.dataset.blockIndex || "");
        }
        return true;
    }

    function handleDragOver(event) {
        if (!isVisualMode() || !draggedBlock) return false;
        const block = resolveDragBlock(event.target);
        if (!block || block === draggedBlock || !visualEditor()?.contains(block)) return false;
        event.preventDefault();
        const rect = block.getBoundingClientRect();
        const nextPosition = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
        cleanupDragState();
        dropTarget = block;
        dropPosition = nextPosition;
        block.classList.add(nextPosition === "before" ? "block-drop-before" : "block-drop-after");
        draggedBlock.classList.add("block-dragging");
        return true;
    }

    function handleDrop(event) {
        if (!isVisualMode() || !draggedBlock || !dropTarget) return false;
        event.preventDefault();
        if (dropPosition === "before") {
            dropTarget.before(draggedBlock);
        } else {
            dropTarget.after(draggedBlock);
        }
        cleanupDragState();
        draggedBlock = null;
        syncBlocks();
        return true;
    }

    function handleDragEnd() {
        draggedBlock = null;
        cleanupDragState();
    }

    return {
        setContent,
        getContent,
        getSupportedBlocks,
        getMarkdown,
        markdownToHtml: KnowledgeBlockRegistry.markdownToHtml,
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
        applyLiveMarkdownShortcuts,
        syncBlocks,
        trackHoveredBlock,
        clearHoveredBlock,
        toggleBlockMenu,
        hideBlockMenu,
        hideBlockControls,
        deleteActiveBlock,
        applyBlockColor,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        currentMode,
        setMode,
        focusActiveEditor,
        __test: {
            markdownToHtml: KnowledgeBlockRegistry.markdownToHtml,
            renderInlineMarkdown: KnowledgeBlockTransform.renderInlineMarkdown,
            isMarkdownTableRow: KnowledgeBlockTransform.isMarkdownTableRow,
            isMarkdownTableSeparator: KnowledgeBlockTransform.isMarkdownTableSeparator
        }
    };
})();
