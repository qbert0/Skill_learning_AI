(function registerQuoteBlock() {
    BlockPluginRegistry.register({
        id: "quote",
        order: 118,
        group: "basic",
        label: "Quote",
        hint: "Quoted text",
        icon: "quoteBlock",
        aliases: ["blockquote", "citation"],
        insert: () => "<blockquote>Quoted text</blockquote><p><br></p>",
        markdownInsert: () => "> Quoted text",
        transform: {
            matches: element => element.tagName?.toUpperCase() === "BLOCKQUOTE",
            toMarkdown: (element, api) => [...element.querySelectorAll("p")]
                .map(node => node.textContent?.trim())
                .filter(Boolean)
                .map(line => `> ${line}`)
                .join("\n") || `> ${api.normalizeInlineText(api.inlineHtmlToMarkdown(element))}`,
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith(">")) return null;
                const body = [];
                let cursor = index;
                while (cursor < lines.length) {
                    const current = lines[cursor].trim();
                    if (!current.startsWith(">")) break;
                    body.push(current.replace(/^>\s?/, ""));
                    cursor += 1;
                }
                return {
                    matched: true,
                    nextIndex: cursor - 1,
                    html: `<blockquote>${body.map(line => `<p>${api.renderInlineMarkdown(line)}</p>`).join("")}</blockquote>`
                };
            }
        }
    });
})();
