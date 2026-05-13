(function registerListViewBlock() {
    BlockPluginRegistry.register({
        id: "list-view",
        order: 340,
        group: "view",
        label: "List view",
        hint: "Simple list database",
        icon: "listView",
        aliases: ["listview"],
        insert: () => '<ul class="list-view-block"><li>List row 1</li><li>List row 2</li></ul><p><br></p>',
        markdownInsert: () => [":::list-view", "List row 1", "List row 2", ":::"].join("\n"),
        transform: {
            matches: element => element.tagName?.toUpperCase() === "UL" && element.classList.contains("list-view-block"),
            toMarkdown: element => {
                const items = [...element.querySelectorAll(":scope > li")].map(node => node.textContent?.trim()).filter(Boolean);
                return [":::list-view", ...items, ":::"].join("\n");
            },
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith(":::list-view")) return null;
                const items = [];
                let cursor = index + 1;
                while (cursor < lines.length && lines[cursor].trim() !== ":::") {
                    if (lines[cursor].trim()) items.push(lines[cursor].trim());
                    cursor += 1;
                }
                return {
                    matched: true,
                    nextIndex: cursor,
                    html: `<ul class="list-view-block">${(items.length ? items : ["List row"]).map(item => `<li>${api.renderInlineMarkdown(item)}</li>`).join("")}</ul>`
                };
            }
        }
    });
})();
