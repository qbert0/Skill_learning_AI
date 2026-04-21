(function registerHeading2Block() {
    BlockPluginRegistry.register({
        id: "heading2",
        order: 30,
        group: "basic",
        label: "Heading 2",
        hint: "Tiêu đề phụ",
        icon: "heading2",
        aliases: ["h2", "subtitle"],
        insert: () => "<h2>Tiêu đề phụ</h2>"
    });
})();
