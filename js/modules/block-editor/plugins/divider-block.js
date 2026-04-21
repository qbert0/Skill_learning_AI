(function registerDividerBlock() {
    BlockPluginRegistry.register({
        id: "divider",
        order: 110,
        group: "basic",
        label: "Divider",
        hint: "Đường kẻ ngang",
        icon: "dividerBlock",
        aliases: ["rule", "line", "separator"],
        insert: () => "<hr>"
    });
})();
