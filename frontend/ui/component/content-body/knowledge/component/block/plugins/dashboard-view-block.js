(function registerDashboardViewBlock() {
    BlockPluginRegistry.register({
        id: "dashboard-view",
        order: 360,
        group: "view",
        label: "Dashboard view",
        hint: "Mixed summary cards",
        icon: "dashboardView",
        aliases: ["dashboardview", "summary"],
        insert: () => '<div class="gallery-grid"><article><strong>Progress</strong><p>82%</p></article><article><strong>Focus</strong><p>Grammar</p></article></div><p><br></p>'
    });
})();
