(function registerMapViewBlock() {
    BlockPluginRegistry.register({
        id: "map-view",
        order: 390,
        group: "view",
        label: "Map view",
        hint: "Location-based view",
        icon: "mapView",
        aliases: ["mapview", "location"],
        insert: () => '<div><strong>Map view</strong><p>Add locations here.</p></div><p><br></p>'
    });
})();
