(function registerNumberChartBlock() {
    BlockPluginRegistry.register({
        id: "number-chart",
        order: 430,
        group: "view",
        label: "Number chart",
        hint: "Single KPI block",
        icon: "numberChart",
        aliases: ["kpi", "metric"],
        insert: () => '<div><strong>Total reviewed</strong><p>128</p></div><p><br></p>'
    });
})();
