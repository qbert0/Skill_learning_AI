(function registerBulletedListBlock() {
    BlockPluginRegistry.register({
        id: "bulleted-list",
        order: 60,
        group: "basic",
        label: "Bulleted list",
        hint: "Danh sách chấm",
        icon: "bulletedList",
        aliases: ["list", "bullet", "ul"],
        insert: () => "<ul><li>Mục danh sách</li></ul>",
        transform: {
            matches: element => element.tagName?.toUpperCase() === "UL" && !element.classList.contains("checklist-block"),
            toMarkdown: (element, api) => [...element.querySelectorAll(":scope > li")].map(item => `- ${api.normalizeInlineText(api.inlineHtmlToMarkdown(item))}`).join("\n"),
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith("- ") || trimmed.startsWith("- [")) return null;
                const result = api.consumeSequential(lines, index, line => line.startsWith("- ") && !line.startsWith("- ["), (_, currentLine) => currentLine.slice(2));
                return {
                    matched: true,
                    nextIndex: result.nextIndex,
                    html: `<ul>${result.items.map(item => `<li>${api.renderInlineMarkdown(item)}</li>`).join("")}</ul>`
                };
            }
        }
    });
})();
