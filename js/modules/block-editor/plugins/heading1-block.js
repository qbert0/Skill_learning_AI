(function registerHeading1Block() {
    BlockPluginRegistry.register({
        id: "heading",
        order: 20,
        group: "basic",
        label: "Heading 1",
        hint: "Tiêu đề lớn",
        icon: "heading1",
        aliases: ["h1", "title"],
        insert: () => "<h1>Tiêu đề mới</h1>"
    });
})();
