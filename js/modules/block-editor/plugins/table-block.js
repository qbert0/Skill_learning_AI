(function registerTableBlock() {
    BlockPluginRegistry.register({
        id: "table",
        order: 90,
        group: "basic",
        label: "Table",
        hint: "Bảng có thể thêm/xóa dòng cột",
        icon: "tableBlock",
        aliases: ["grid", "sheet"],
        insert: () => '<table><tbody><tr><th>Cột 1</th><th>Cột 2</th><th>Ghi chú</th></tr><tr><td>Nội dung</td><td>Nội dung</td><td>Nội dung</td></tr><tr><td>Nội dung</td><td>Nội dung</td><td>Nội dung</td></tr></tbody></table><p><br></p>'
    });
})();
