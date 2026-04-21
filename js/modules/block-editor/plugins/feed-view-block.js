(function registerFeedViewBlock() {
    BlockPluginRegistry.register({
        id: "feed-view",
        order: 350,
        group: "view",
        label: "Feed view",
        hint: "Chronological feed",
        icon: "feedView",
        aliases: ["feedview", "stream"],
        insert: () => '<div><strong>Feed</strong><p>Newest item</p><p>Older item</p></div><p><br></p>'
    });
})();
