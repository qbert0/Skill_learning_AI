(function registerAudioBlock() {
    BlockPluginRegistry.register({
        id: "audio",
        order: 230,
        group: "media",
        label: "Audio",
        hint: "Audio player block",
        icon: "audioBlock",
        aliases: ["sound", "voice"],
        insert: () => '<figure><audio controls src=""></audio><figcaption>Audio source</figcaption></figure><p><br></p>'
    });
})();
