(function registerFileBlock() {
    BlockPluginRegistry.register({
        id: "file",
        order: 250,
        group: "media",
        label: "File",
        hint: "File attachment placeholder",
        icon: "fileBlock",
        aliases: ["attachment", "document"],
        insert: () => '<p><a href="#">Attached file</a></p><p><br></p>'
    });
})();
