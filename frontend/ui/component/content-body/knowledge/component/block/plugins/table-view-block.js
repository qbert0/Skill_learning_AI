(function registerTableViewBlock() {
    BlockPluginRegistry.register({
        id: "table-view",
        order: 310,
        group: "view",
        label: "Table view",
        hint: "Database table layout",
        icon: "tableBlock",
        aliases: ["database table", "tableview"],
        insert: () => '<div><strong>Table view</strong><table><tbody><tr><th>Name</th><th>Status</th></tr><tr><td>Row 1</td><td>Active</td></tr></tbody></table></div><p><br></p>'
    });
})();
