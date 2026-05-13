(function registerFeedViewBlock() {
    BlockPluginRegistry.register({
        id: "feed-view",
        order: 350,
        group: "view",
        label: "Feed view",
        hint: "Chronological feed",
        icon: "feedView",
        aliases: ["feedview", "stream"],
        insert: () => '<div class="feed-view-block"><strong>Feed</strong><p>Newest item</p><p>Older item</p></div><p><br></p>',
        markdownInsert: () => [":::feed-view Feed", "Newest item", "Older item", ":::"].join("\n"),
        transform: {
            matches: element => element.tagName?.toUpperCase() === "DIV" && element.classList.contains("feed-view-block"),
            toMarkdown: element => {
                const title = element.querySelector(":scope > strong")?.textContent?.trim() || "Feed";
                const items = [...element.querySelectorAll(":scope > p")].map(node => node.textContent?.trim()).filter(Boolean);
                return [`:::feed-view ${title}`, ...items, ":::"].join("\n");
            },
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith(":::feed-view")) return null;
                const title = trimmed.replace(":::feed-view", "").trim() || "Feed";
                const items = [];
                let cursor = index + 1;
                while (cursor < lines.length && lines[cursor].trim() !== ":::") {
                    if (lines[cursor].trim()) items.push(lines[cursor].trim());
                    cursor += 1;
                }
                return {
                    matched: true,
                    nextIndex: cursor,
                    html: `<div class="feed-view-block"><strong>${api.escapeHtml(title)}</strong>${(items.length ? items : ["Newest item"]).map(item => `<p>${api.renderInlineMarkdown(item)}</p>`).join("")}</div>`
                };
            }
        }
    });
})();
