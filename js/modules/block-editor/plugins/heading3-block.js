(function registerHeading3Block() {
    BlockPluginRegistry.register({
        id: "heading3",
        order: 40,
        group: "basic",
        label: "Heading 3",
        hint: "Tiêu đề cấp ba",
        icon: "heading3",
        aliases: ["h3"],
        insert: () => "<h3>Tiêu đề cấp ba</h3>"
    });
})();
