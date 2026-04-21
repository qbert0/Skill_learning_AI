(function registerHeading4Block() {
    BlockPluginRegistry.register({
        id: "heading4",
        order: 45,
        group: "basic",
        label: "Heading 4",
        hint: "Smaller heading",
        icon: "heading4",
        aliases: ["h4"],
        insert: () => "<h4>Heading 4</h4>"
    });
})();
