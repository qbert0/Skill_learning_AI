(function registerEmojiBlock() {
    BlockPluginRegistry.register({
        id: "emoji",
        order: 520,
        group: "inline",
        label: "Emoji",
        hint: "Inline emoji block",
        icon: "emojiBlock",
        aliases: ["icon", "smile"],
        insert: () => "<p>🙂 Emoji</p>"
    });
})();
