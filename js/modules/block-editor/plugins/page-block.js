(function registerPageBlock() {
    BlockPluginRegistry.register({
        id: "page",
        order: 115,
        group: "basic",
        label: "Page",
        hint: "Nested page card",
        icon: "pageBlock",
        aliases: ["subpage", "doc"],
        insert: () => '<div><strong>New page</strong><p>Open or connect this page later.</p></div><p><br></p>'
    });
})();
