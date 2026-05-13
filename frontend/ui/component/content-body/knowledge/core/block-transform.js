window.KnowledgeBlockTransform = (() => {
    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#039;"
        }[char]));
    }

    function normalizeInlineText(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function stripBlockFeatureArtifacts(value) {
        return String(value || "")
            .replace(/\r\n/g, "\n")
            .split("\n")
            .map(line => {
                const trimmed = line.trim();
                if (/^:{4,}$/.test(trimmed)) return "";
                if (/^:{4,}\s*/.test(line)) return line.replace(/^:{4,}\s*/, "");
                return line;
            })
            .join("\n");
    }

    function normalizeMarkdown(value) {
        return stripBlockFeatureArtifacts(value)
            .replace(/\n{3,}/g, "\n\n")
            .trim();
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

    function inlineHtmlToMarkdown(root) {
        if (!root) return "";
        const nodes = Array.isArray(root) ? root : (root.childNodes ? [...root.childNodes] : []);
        return nodes.map(nodeToInlineMarkdown).join("");
    }

    function nodeToInlineMarkdown(node) {
        if (!node) return "";
        if (node.nodeType === 3) return node.textContent || "";
        if (node.nodeType !== 1) return "";

        const tagName = node.tagName?.toUpperCase?.() || "";
        const content = inlineHtmlToMarkdown(node);

        if (tagName === "STRONG" || tagName === "B") return `**${content}**`;
        if (tagName === "EM" || tagName === "I") return `*${content}*`;
        if (tagName === "CODE") return `\`${content}\``;
        if (tagName === "DEL" || tagName === "S") return `~~${content}~~`;
        if (tagName === "A") {
            const href = node.getAttribute("href") || "#";
            return `[${content || href}](${href})`;
        }
        if (tagName === "BR") return "\n";
        if (tagName === "SPAN" && node.classList?.contains?.("page-link-token")) return content;

        return content;
    }

    function isMarkdownTableRow(line) {
        const value = String(line || "").trim();
        if (!value || !value.includes("|")) return false;
        const cells = splitMarkdownTableRow(value);
        return cells.length >= 2 && cells.some(Boolean);
    }

    function isMarkdownTableSeparator(line) {
        const cells = splitMarkdownTableRow(line);
        if (cells.length < 2) return false;
        return cells.every(cell => /^:?-{3,}:?$/.test(cell));
    }

    function isMarkdownTableDeclaration(line) {
        const value = String(line || "").trim();
        if (!/^\|(?:\s*\|)+$/.test(value)) return false;
        return value.replace(/\s/g, "").length >= 3;
    }

    function splitMarkdownTableRow(line) {
        return String(line || "")
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map(cell => cell.trim());
    }

    function isRawHtmlBlockLine(line) {
        const value = String(line || "").trim();
        if (!value) return false;
        return /^<([a-z][\w-]*)(\s[^>]*)?>.*<\/\1>$/i.test(value) || /^<hr\b[^>]*\/?>$/i.test(value);
    }

    function rawHtmlContainerTag(line) {
        const value = String(line || "").trim();
        if (!value || /^<hr\b[^>]*\/?>$/i.test(value)) return null;
        const match = value.match(/^<([a-z][\w-]*)(\s[^>]*)?>/i);
        if (!match) return null;
        const tagName = match[1].toLowerCase();
        if (value.includes(`</${tagName}>`)) return null;
        if (value.endsWith("/>")) return null;
        if (![
            "blockquote",
            "details",
            "figure",
            "ol",
            "p",
            "pre",
            "table",
            "ul"
        ].includes(tagName)) return null;
        return tagName;
    }

    function consumeRawHtmlBlock(lines, startIndex) {
        const firstLine = String(lines[startIndex] || "");
        const trimmed = firstLine.trim();
        if (isRawHtmlBlockLine(trimmed)) {
            return {
                matched: true,
                html: trimmed,
                nextIndex: startIndex
            };
        }

        const tagName = rawHtmlContainerTag(trimmed);
        if (!tagName) return null;

        const openTagPattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, "gi");
        const closeTagPattern = new RegExp(`</${tagName}>`, "gi");
        let balance = 0;
        const collected = [];

        for (let cursor = startIndex; cursor < lines.length; cursor += 1) {
            const line = String(lines[cursor] || "");
            collected.push(line);
            const openCount = [...line.matchAll(openTagPattern)]
                .filter(match => !match[0].endsWith("/>"))
                .length;
            const closeCount = [...line.matchAll(closeTagPattern)].length;
            balance += openCount - closeCount;

            if (balance <= 0 && cursor > startIndex) {
                return {
                    matched: true,
                    html: collected.join("\n"),
                    nextIndex: cursor
                };
            }
        }

        return {
            matched: true,
            html: collected.join("\n"),
            nextIndex: lines.length - 1
        };
    }

    function consumeSequential(lines, startIndex, predicate, mapper) {
        const items = [];
        let index = startIndex;
        while (index < lines.length) {
            const line = lines[index].trim();
            const match = predicate(line);
            if (!match) break;
            items.push(mapper(match, line, index));
            index += 1;
        }
        return {
            items,
            nextIndex: index - 1
        };
    }

    function markdownToHtml(markdown, blocks = []) {
        const lines = normalizeMarkdown(markdown).split("\n");
        const html = [];
        const orderedBlocks = [...blocks].sort((a, b) => (a.transform?.priority ?? a.order ?? 0) - (b.transform?.priority ?? b.order ?? 0));

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index];
            const trimmed = line.trim();

            const rawHtmlBlock = consumeRawHtmlBlock(lines, index);
            if (rawHtmlBlock?.matched) {
                html.push(rawHtmlBlock.html);
                index = rawHtmlBlock.nextIndex;
                continue;
            }

            const matchedBlock = orderedBlocks.find(block => typeof block.transform?.fromMarkdown === "function" && block.transform.fromMarkdown({
                lines,
                index,
                line,
                trimmed,
                api
            })?.matched);

            if (matchedBlock) {
                const result = matchedBlock.transform.fromMarkdown({
                    lines,
                    index,
                    line,
                    trimmed,
                    api
                });
                html.push(result.html);
                index = Number.isInteger(result.nextIndex) ? result.nextIndex : index;
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

    const api = {
        escapeHtml,
        normalizeInlineText,
        stripBlockFeatureArtifacts,
        normalizeMarkdown,
        renderInlineMarkdown,
        inlineHtmlToMarkdown,
        isMarkdownTableRow,
        isMarkdownTableSeparator,
        isMarkdownTableDeclaration,
        splitMarkdownTableRow,
        isRawHtmlBlockLine,
        consumeRawHtmlBlock,
        consumeSequential,
        markdownToHtml
    };

    return api;
})();
