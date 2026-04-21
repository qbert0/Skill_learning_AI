(function registerBoardViewBlock() {
    BlockPluginRegistry.register({
        id: "board-view",
        order: 320,
        group: "view",
        label: "Board view",
        hint: "Kanban columns",
        icon: "boardView",
        aliases: ["kanban", "boardview"],
        insert: () => '<div class="gallery-grid"><article><strong>Todo</strong><p>Task</p></article><article><strong>Doing</strong><p>Task</p></article><article><strong>Done</strong><p>Task</p></article></div><p><br></p>'
    });
})();
