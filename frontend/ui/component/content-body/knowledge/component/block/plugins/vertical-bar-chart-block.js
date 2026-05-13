(function registerVerticalBarChartBlock() {
    BlockPluginRegistry.register({
        id: "vertical-bar-chart",
        order: 400,
        group: "view",
        label: "Vertical bar chart",
        hint: "Column chart",
        icon: "barChartVertical",
        aliases: ["column chart", "vertical chart"],
        insert: () => '<div><strong>Vertical bar chart</strong><p>Grammar: 80 | Reading: 65 | Listening: 72</p></div><p><br></p>'
    });
})();
