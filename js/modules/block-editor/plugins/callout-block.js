(function registerCalloutBlock() {
    BlockPluginRegistry.register({
        id: "callout",
        order: 117,
        group: "basic",
        label: "Callout",
        hint: "Highlighted note",
        icon: "calloutBlock",
        aliases: ["note", "warning", "info"],
        insert: () => '<blockquote><strong>Callout</strong><p>Important note.</p></blockquote><p><br></p>'
    });
})();
