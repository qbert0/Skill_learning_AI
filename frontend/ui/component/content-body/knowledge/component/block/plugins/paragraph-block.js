(function registerParagraphBlock() {
    BlockPluginRegistry.register({
        id: "text",
        order: 10,
        group: "basic",
        label: "Text",
        hint: "Khối văn bản cơ bản",
        icon: "paragraph",
        aliases: ["text", "para", "paragraph"],
        insert: () => "<p>Đoạn văn mới</p>",
        markdownInsert: () => "Đoạn văn mới",
        transform: {
            priority: 999,
            matches: element => element.tagName?.toUpperCase() === "P",
            toMarkdown: (element, api) => api.normalizeInlineText(api.inlineHtmlToMarkdown(element)),
            fromMarkdown: ({ line, lines, index, trimmed, api }) => {
                if (!trimmed) return null;
                if (
                    trimmed.startsWith("# ") ||
                    trimmed.startsWith("## ") ||
                    trimmed.startsWith("### ") ||
                    trimmed.startsWith("#### ") ||
                    trimmed.startsWith("- ") ||
                    /^\d+\.\s/.test(trimmed) ||
                    trimmed === "---" ||
                    trimmed.startsWith("```") ||
                    trimmed.startsWith(":::") ||
                    trimmed.match(/^!\[(.*?)\]\((.*?)\)$/) ||
                    trimmed.match(/^\[(audio|video)\]\((.*?)\)$/i) ||
                    (api.isMarkdownTableRow(trimmed) && api.isMarkdownTableSeparator(lines[index + 1]?.trim() || ""))
                ) return null;
                return {
                    matched: true,
                    html: `<p>${api.renderInlineMarkdown(line)}</p>`
                };
            }
        }
    });
})();
