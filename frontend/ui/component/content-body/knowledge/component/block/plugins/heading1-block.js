(function registerHeading1Block() {
    BlockPluginRegistry.register({
        id: "heading",
        order: 20,
        group: "basic",
        label: "Heading 1",
        hint: "Tiêu đề lớn",
        icon: "heading1",
        aliases: ["h1", "title"],
        insert: () => "<h1>Tiêu đề mới</h1>",
        transform: {
            matches: element => element.tagName?.toUpperCase() === "H1",
            toMarkdown: (element, api) => `# ${api.normalizeInlineText(api.inlineHtmlToMarkdown(element))}`,
            fromMarkdown: ({ trimmed, api }) => {
                if (!trimmed.startsWith("# ") || trimmed.startsWith("## ")) return null;
                return { matched: true, html: `<h1>${api.renderInlineMarkdown(trimmed.slice(2))}</h1>` };
            }
        }
    });
})();
