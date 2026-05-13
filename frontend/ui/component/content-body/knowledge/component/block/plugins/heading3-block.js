(function registerHeading3Block() {
    BlockPluginRegistry.register({
        id: "heading3",
        order: 40,
        group: "basic",
        label: "Heading 3",
        hint: "Tiêu đề cấp ba",
        icon: "heading3",
        aliases: ["h3"],
        insert: () => "<h3>Tiêu đề cấp ba</h3>",
        transform: {
            matches: element => element.tagName?.toUpperCase() === "H3",
            toMarkdown: (element, api) => `### ${api.normalizeInlineText(api.inlineHtmlToMarkdown(element))}`,
            fromMarkdown: ({ trimmed, api }) => {
                if (!trimmed.startsWith("### ") || trimmed.startsWith("#### ")) return null;
                return { matched: true, html: `<h3>${api.renderInlineMarkdown(trimmed.slice(4))}</h3>` };
            }
        }
    });
})();
