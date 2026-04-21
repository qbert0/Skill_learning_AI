(function registerLineChartBlock() {
    BlockPluginRegistry.register({
        id: "line-chart",
        order: 420,
        group: "view",
        label: "Line chart",
        hint: "Trend chart",
        icon: "lineChart",
        aliases: ["trend", "linechart"],
        insert: () => '<div><strong>Line chart</strong><p>Session trend goes here.</p></div><p><br></p>'
    });
})();
