(function registerListViewBlock() {
    BlockPluginRegistry.register({
        id: "list-view",
        order: 340,
        group: "view",
        label: "List view",
        hint: "Simple list database",
        icon: "listView",
        aliases: ["listview"],
        insert: () => "<ul><li>List row 1</li><li>List row 2</li></ul><p><br></p>"
    });
})();
