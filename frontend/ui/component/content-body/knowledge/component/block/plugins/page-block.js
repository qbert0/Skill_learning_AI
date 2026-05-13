(function registerPageBlock() {
    BlockPluginRegistry.register({
        id: "page",
        order: 115,
        group: "basic",
        label: "Page",
        hint: "Nested page card",
        icon: "pageBlock",
        aliases: ["subpage", "doc"],
        insert: () => '<div class="page-block-card"><strong>New page</strong><p>Open or connect this page later.</p></div><p><br></p>',
        markdownInsert: () => [":::page New page", "Open or connect this page later.", ":::"].join("\n"),
        transform: {
            matches: element => element.tagName?.toUpperCase() === "DIV" && element.classList.contains("page-block-card"),
            toMarkdown: element => {
                const title = element.querySelector(":scope > strong")?.textContent?.trim() || "New page";
                const body = [...element.querySelectorAll(":scope > p")].map(node => node.textContent?.trim()).filter(Boolean).join("\n");
                return [`:::page ${title}`, body, ":::"].filter(Boolean).join("\n");
            },
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith(":::page")) return null;
                const title = trimmed.replace(":::page", "").trim() || "New page";
                const bodyLines = [];
                let cursor = index + 1;
                while (cursor < lines.length && lines[cursor].trim() !== ":::") {
                    bodyLines.push(lines[cursor]);
                    cursor += 1;
                }
                return {
                    matched: true,
                    nextIndex: cursor,
                    html: `<div class="page-block-card"><strong>${api.escapeHtml(title)}</strong>${bodyLines.length ? bodyLines.map(line => `<p>${api.renderInlineMarkdown(line)}</p>`).join("") : "<p>Open or connect this page later.</p>"}</div>`
                };
            }
        }
    });
})();
