(function registerQuoteBlock() {
    BlockPluginRegistry.register({
        id: "quote",
        order: 118,
        group: "basic",
        label: "Quote",
        hint: "Quoted text",
        icon: "quoteBlock",
        aliases: ["blockquote", "citation"],
        insert: () => "<blockquote>Quoted text</blockquote><p><br></p>"
    });
})();
