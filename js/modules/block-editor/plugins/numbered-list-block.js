(function registerNumberedListBlock() {
    BlockPluginRegistry.register({
        id: "numbered-list",
        order: 70,
        group: "basic",
        label: "Numbered list",
        hint: "Danh sách số",
        icon: "numberedList",
        aliases: ["ordered list", "number list", "ol"],
        insert: () => "<ol><li>Mục danh sách</li></ol>"
    });
})();
