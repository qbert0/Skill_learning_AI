(function registerHorizontalBarChartBlock() {
    BlockPluginRegistry.register({
        id: "horizontal-bar-chart",
        order: 410,
        group: "view",
        label: "Horizontal bar chart",
        hint: "Bar chart",
        icon: "barChartHorizontal",
        aliases: ["bar chart", "horizontal chart"],
        insert: () => '<div><strong>Horizontal bar chart</strong><p>Vocabulary: 54 | Writing: 47</p></div><p><br></p>'
    });
})();
