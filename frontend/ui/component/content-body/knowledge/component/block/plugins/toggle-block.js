(function registerToggleBlock() {
    BlockPluginRegistry.register({
        id: "toggle",
        order: 80,
        group: "basic",
        label: "Toggle list",
        hint: "Nội dung thu gọn",
        icon: "toggleBlock",
        aliases: ["collapse", "details", "toggle"],
        insert: () => '<details open><summary>Tiêu đề toggle</summary><p>Nội dung bên trong</p></details>',
        markdownInsert: () => [
            ":::toggle Tiêu đề toggle",
            "Nội dung bên trong",
            ":::"
        ].join("\n"),
        transform: {
            matches: element => element.tagName?.toUpperCase() === "DETAILS",
            toMarkdown: (element, api) => {
                const summaryNode = element.querySelector("summary");
                const summary = api.normalizeInlineText(summaryNode ? api.inlineHtmlToMarkdown(summaryNode) : "Toggle");
                const body = [...element.childNodes]
                    .filter(node => !(node.nodeType === Node.ELEMENT_NODE && node.tagName.toUpperCase() === "SUMMARY"))
                    .map(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            return api.normalizeMarkdown(node.outerHTML || "");
                        }
                        return api.normalizeInlineText(node.textContent || "");
                    })
                    .filter(Boolean)
                    .join("\n");
                return [`:::toggle ${summary}`, body, ":::"].filter(Boolean).join("\n").trim();
            },
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith(":::toggle")) return null;
                const summary = trimmed.replace(":::toggle", "").trim() || "Toggle";
                const bodyLines = [];
                let cursor = index + 1;
                while (cursor < lines.length && lines[cursor].trim() !== ":::") {
                    bodyLines.push(lines[cursor]);
                    cursor += 1;
                }
                return {
                    matched: true,
                    nextIndex: cursor,
                    html: `<details open><summary>${api.escapeHtml(summary)}</summary>${api.markdownToHtml(bodyLines.join("\n")) || "<p><br></p>"}</details>`
                };
            }
        }
    });
})();
