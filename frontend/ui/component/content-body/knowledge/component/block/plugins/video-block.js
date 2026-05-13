(function registerVideoBlock() {
    BlockPluginRegistry.register({
        id: "video",
        order: 220,
        group: "media",
        label: "Video",
        hint: "Video player block",
        icon: "videoBlock",
        aliases: ["movie", "clip"],
        insert: () => '<figure><video controls src=""></video><figcaption>Video source</figcaption></figure><p><br></p>',
        transform: {
            matches: element => element.tagName?.toUpperCase() === "FIGURE" && Boolean(element.querySelector("video")),
            toMarkdown: element => {
                const video = element.querySelector("video");
                return `[video](${video?.getAttribute("src") || ""})`;
            },
            fromMarkdown: ({ trimmed, api }) => {
                const match = trimmed.match(/^\[video\]\((.*?)\)$/i);
                if (!match) return null;
                return {
                    matched: true,
                    html: `<figure><video controls src="${api.escapeHtml(match[1])}"></video><figcaption>Video source</figcaption></figure>`
                };
            }
        }
    });
})();
