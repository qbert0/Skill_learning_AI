(function registerNumberedListBlock() {
    BlockPluginRegistry.register({
        id: "numbered-list",
        order: 70,
        group: "basic",
        label: "Numbered list",
        hint: "Danh sách số",
        icon: "numberedList",
        aliases: ["ordered list", "number list", "ol"],
        insert: () => "<ol><li>Mục danh sách</li></ol>",
        transform: {
            matches: element => element.tagName?.toUpperCase() === "OL",
            toMarkdown: (element, api) => [...element.querySelectorAll(":scope > li")].map((item, index) => `${index + 1}. ${api.normalizeInlineText(api.inlineHtmlToMarkdown(item))}`).join("\n"),
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!/^\d+\.\s/.test(trimmed)) return null;
                const result = api.consumeSequential(lines, index, line => line.match(/^\d+\.\s(.+)$/), match => match[1]);
                return {
                    matched: true,
                    nextIndex: result.nextIndex,
                    html: `<ol>${result.items.map(item => `<li>${api.renderInlineMarkdown(item)}</li>`).join("")}</ol>`
                };
            }
        }
    });
})();
