(function registerCalendarViewBlock() {
    BlockPluginRegistry.register({
        id: "calendar-view",
        order: 370,
        group: "view",
        label: "Calendar view",
        hint: "Calendar layout",
        icon: "calendarView",
        aliases: ["calendarview", "schedule"],
        insert: () => '<div><strong>Calendar view</strong><table><tbody><tr><th>Mon</th><th>Tue</th><th>Wed</th></tr><tr><td>Review</td><td></td><td>Practice</td></tr></tbody></table></div><p><br></p>',
        transform: {
            matches: element => element.tagName?.toUpperCase() === "DIV" && /calendar view/i.test(element.textContent || ""),
            toMarkdown: element => {
                const rows = [...element.querySelectorAll("tr")].map(row => [...row.cells].map(cell => cell.textContent?.trim() || ""));
                if (!rows.length) return ":::calendar-view\n:::";
                const markdownRows = rows.map(row => `| ${row.join(" | ")} |`);
                return [":::calendar-view", ...markdownRows, ":::"].join("\n");
            },
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith(":::calendar-view")) return null;
                const bodyLines = [];
                let cursor = index + 1;
                while (cursor < lines.length && lines[cursor].trim() !== ":::") {
                    bodyLines.push(lines[cursor]);
                    cursor += 1;
                }
                const rows = bodyLines
                    .map(line => line.trim())
                    .filter(Boolean)
                    .filter(line => api.isMarkdownTableRow(line))
                    .map(line => line.replace(/^\||\|$/g, "").split("|").map(cell => cell.trim()));
                const [header = ["Mon", "Tue", "Wed"], ...body] = rows.length ? rows : [["Mon", "Tue", "Wed"], ["Review", "", "Practice"]];
                return {
                    matched: true,
                    nextIndex: cursor,
                    html: `<div><strong>Calendar view</strong><table><thead><tr>${header.map(cell => `<th>${api.renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${body.map(row => `<tr>${row.map(cell => `<td>${api.renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
                };
            }
        }
    });
})();
