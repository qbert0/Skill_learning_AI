(function registerTimelineViewBlock() {
    BlockPluginRegistry.register({
        id: "timeline-view",
        order: 380,
        group: "view",
        label: "Timeline view",
        hint: "Timeline milestones",
        icon: "timelineView",
        aliases: ["timelineview", "roadmap"],
        insert: () => "<ul><li>Week 1 - Basics</li><li>Week 2 - Review</li><li>Week 3 - Practice</li></ul><p><br></p>"
    });
})();
