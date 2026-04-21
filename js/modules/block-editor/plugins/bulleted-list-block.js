(function registerBulletedListBlock() {
    BlockPluginRegistry.register({
        id: "bulleted-list",
        order: 60,
        group: "basic",
        label: "Bulleted list",
        hint: "Danh sách chấm",
        icon: "bulletedList",
        aliases: ["list", "bullet", "ul"],
        insert: () => "<ul><li>Mục danh sách</li></ul>"
    });
})();
