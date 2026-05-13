(function registerImageBlock() {
    BlockPluginRegistry.register({
        id: "image",
        order: 210,
        group: "media",
        label: "Image",
        hint: "Image placeholder",
        icon: "imageBlock",
        aliases: ["photo", "picture"],
        insert: () => '<figure><img src="https://placehold.co/960x540?text=Image" alt="Image"><figcaption>Image caption</figcaption></figure><p><br></p>',
        transform: {
            matches: element => element.tagName?.toUpperCase() === "FIGURE" && Boolean(element.querySelector("img")),
            toMarkdown: element => {
                const image = element.querySelector("img");
                return `![${image?.getAttribute("alt") || ""}](${image?.getAttribute("src") || ""})`;
            },
            fromMarkdown: ({ trimmed, api }) => {
                const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
                if (!match) return null;
                return {
                    matched: true,
                    html: `<figure><img src="${api.escapeHtml(match[2])}" alt="${api.escapeHtml(match[1])}"></figure>`
                };
            }
        }
    });
})();
