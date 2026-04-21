(function registerCalendarViewBlock() {
    BlockPluginRegistry.register({
        id: "calendar-view",
        order: 370,
        group: "view",
        label: "Calendar view",
        hint: "Calendar layout",
        icon: "calendarView",
        aliases: ["calendarview", "schedule"],
        insert: () => '<div><strong>Calendar view</strong><table><tbody><tr><th>Mon</th><th>Tue</th><th>Wed</th></tr><tr><td>Review</td><td></td><td>Practice</td></tr></tbody></table></div><p><br></p>'
    });
})();
