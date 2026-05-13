(function registerGalleryViewBlock() {
    BlockPluginRegistry.register({
        id: "gallery-view",
        order: 330,
        group: "view",
        label: "Gallery view",
        hint: "Card gallery layout",
        icon: "galleryBlock",
        aliases: ["galleryview", "cards view"],
        insert: () => '<div class="gallery-grid"><article><strong>Card 1</strong><p>Preview</p></article><article><strong>Card 2</strong><p>Preview</p></article></div><p><br></p>',
        markdownInsert: () => [":::gallery-view", "Card 1 | Preview", "Card 2 | Preview", ":::"].join("\n"),
        transform: {
            matches: element => element.tagName?.toUpperCase() === "DIV" && element.classList.contains("gallery-grid"),
            toMarkdown: element => {
                const rows = [...element.querySelectorAll(":scope > article")].map(article => {
                    const title = article.querySelector("strong")?.textContent?.trim() || "Card";
                    const preview = article.querySelector("p")?.textContent?.trim() || "Preview";
                    return `${title} | ${preview}`;
                });
                return [":::gallery-view", ...rows, ":::"].join("\n");
            },
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith(":::gallery-view")) return null;
                const rows = [];
                let cursor = index + 1;
                while (cursor < lines.length && lines[cursor].trim() !== ":::") {
                    const [title, preview] = lines[cursor].split("|").map(part => part.trim());
                    if (title || preview) rows.push({ title: title || "Card", preview: preview || "Preview" });
                    cursor += 1;
                }
                return {
                    matched: true,
                    nextIndex: cursor,
                    html: `<div class="gallery-grid">${rows.map(row => `<article><strong>${api.escapeHtml(row.title)}</strong><p>${api.renderInlineMarkdown(row.preview)}</p></article>`).join("")}</div>`
                };
            }
        }
    });
})();
