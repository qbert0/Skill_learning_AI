(function registerCodeBlock() {
    BlockPluginRegistry.register({
        id: "code",
        order: 240,
        group: "media",
        label: "Code",
        hint: "Code snippet",
        icon: "codeBlock",
        aliases: ["snippet", "pre"],
        insert: () => "<pre><code>// code</code></pre><p><br></p>"
    });
})();
