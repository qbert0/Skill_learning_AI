(function registerAudioBlock() {
    BlockPluginRegistry.register({
        id: "audio",
        order: 230,
        group: "media",
        label: "Audio",
        hint: "Audio player block",
        icon: "audioBlock",
        aliases: ["sound", "voice"],
        insert: () => '<figure><audio controls src=""></audio><figcaption>Audio source</figcaption></figure><p><br></p>',
        transform: {
            matches: element => element.tagName?.toUpperCase() === "FIGURE" && Boolean(element.querySelector("audio")),
            toMarkdown: element => {
                const audio = element.querySelector("audio");
                const src = audio?.getAttribute("src") || "";
                return `[audio](${src})`;
            },
            fromMarkdown: ({ trimmed, api }) => {
                const match = trimmed.match(/^\[audio\]\((.*?)\)$/i);
                if (!match) return null;
                return {
                    matched: true,
                    html: `<figure><audio controls src="${api.escapeHtml(match[1])}"></audio><figcaption>Audio source</figcaption></figure>`
                };
            }
        }
    });
})();
