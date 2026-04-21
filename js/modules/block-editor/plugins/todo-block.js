(function registerTodoBlock() {
    BlockPluginRegistry.register({
        id: "todo",
        order: 50,
        group: "basic",
        label: "To-do list",
        hint: "Checkbox",
        icon: "todoList",
        aliases: ["checklist", "task", "todo"],
        insert: () => '<p><input type="checkbox"> Việc cần làm</p>'
    });
})();
