(function registerToggleBlock() {
    BlockPluginRegistry.register({
        id: "toggle",
        order: 80,
        group: "basic",
        label: "Toggle list",
        hint: "Nội dung thu gọn",
        icon: "toggleBlock",
        aliases: ["collapse", "details", "toggle"],
        insert: () => '<details open><summary>Tiêu đề toggle</summary><p>Nội dung bên trong</p></details>'
    });
})();
