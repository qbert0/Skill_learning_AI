(function registerHeading4Block() {
    BlockPluginRegistry.register({
        id: "heading4",
        order: 45,
        group: "basic",
        label: "Heading 4",
        hint: "Smaller heading",
        icon: "heading4",
        aliases: ["h4"],
        insert: () => "<h4>Heading 4</h4>",
        transform: {
            matches: element => element.tagName?.toUpperCase() === "H4",
            toMarkdown: (element, api) => `#### ${api.normalizeInlineText(api.inlineHtmlToMarkdown(element))}`,
            fromMarkdown: ({ trimmed, api }) => {
                if (!trimmed.startsWith("#### ")) return null;
                return { matched: true, html: `<h4>${api.renderInlineMarkdown(trimmed.slice(5))}</h4>` };
            }
        }
    });
})();
