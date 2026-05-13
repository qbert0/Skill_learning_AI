(function registerBoardViewBlock() {
    BlockPluginRegistry.register({
        id: "board-view",
        order: 320,
        group: "view",
        label: "Board view",
        hint: "Kanban columns",
        icon: "boardView",
        aliases: ["kanban", "boardview"],
        insert: () => '<div class="gallery-grid"><article><strong>Todo</strong><p>Task</p></article><article><strong>Doing</strong><p>Task</p></article><article><strong>Done</strong><p>Task</p></article></div><p><br></p>',
        transform: {
            matches: element => element.tagName?.toUpperCase() === "DIV" && element.classList.contains("gallery-grid"),
            toMarkdown: element => {
                const columns = [...element.querySelectorAll(":scope > article")].map(article => {
                    const title = article.querySelector("strong")?.textContent?.trim() || "Cột";
                    const items = [...article.querySelectorAll("p")].map(item => item.textContent?.trim()).filter(Boolean);
                    return [title, ...items].join(" | ");
                });
                return [":::board-view", ...columns, ":::"].join("\n");
            },
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith(":::board-view")) return null;
                const bodyLines = [];
                let cursor = index + 1;
                while (cursor < lines.length && lines[cursor].trim() !== ":::") {
                    bodyLines.push(lines[cursor]);
                    cursor += 1;
                }
                const columns = bodyLines
                    .map(line => line.trim())
                    .filter(Boolean)
                    .map(line => {
                        const [title, ...items] = line.split("|").map(part => part.trim()).filter(Boolean);
                        return { title: title || "Cột", items };
                    });
                return {
                    matched: true,
                    nextIndex: cursor,
                    html: `<div class="gallery-grid">${columns.map(column => `<article><strong>${api.escapeHtml(column.title)}</strong>${column.items.length ? column.items.map(item => `<p>${api.renderInlineMarkdown(item)}</p>`).join("") : "<p>Task</p>"}</article>`).join("")}</div>`
                };
            }
        }
    });
})();
