(function registerHeading2Block() {
    BlockPluginRegistry.register({
        id: "heading2",
        order: 30,
        group: "basic",
        label: "Heading 2",
        hint: "Tiêu đề phụ",
        icon: "heading2",
        aliases: ["h2", "subtitle"],
        insert: () => "<h2>Tiêu đề phụ</h2>",
        transform: {
            matches: element => element.tagName?.toUpperCase() === "H2",
            toMarkdown: (element, api) => `## ${api.normalizeInlineText(api.inlineHtmlToMarkdown(element))}`,
            fromMarkdown: ({ trimmed, api }) => {
                if (!trimmed.startsWith("## ") || trimmed.startsWith("### ")) return null;
                return { matched: true, html: `<h2>${api.renderInlineMarkdown(trimmed.slice(3))}</h2>` };
            }
        }
    });
})();
