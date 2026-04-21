(function registerVideoBlock() {
    BlockPluginRegistry.register({
        id: "video",
        order: 220,
        group: "media",
        label: "Video",
        hint: "Video player block",
        icon: "videoBlock",
        aliases: ["movie", "clip"],
        insert: () => '<figure><video controls src=""></video><figcaption>Video source</figcaption></figure><p><br></p>'
    });
})();
