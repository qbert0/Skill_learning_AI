(function registerParagraphBlock() {
    BlockPluginRegistry.register({
        id: "paragraph",
        order: 10,
        group: "basic",
        label: "Paragraph",
        hint: "Đoạn văn thường",
        icon: "paragraph",
        aliases: ["text", "para", "paragraph"],
        insert: () => "<p>Đoạn văn mới</p>"
    });
})();
