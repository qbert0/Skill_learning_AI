(function registerPageLinkBlock() {
    BlockPluginRegistry.register({
        id: "page-link",
        order: 120,
        group: "basic",
        label: "Page link",
        hint: "Liên kết tới trang học khác",
        icon: "pageLink",
        aliases: ["link", "page"],
        insert: context => {
            const pages = (context.pages || []).filter(page => page.id !== context.activePageId);
            if (!pages.length) return '<span class="page-link-token">[[Tên trang học]]</span>';
            return `<span class="page-link-token">[[${String(pages[0].title || "Tên trang học").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]))}]]</span>`;
        },
        markdownInsert: () => "[[Tên trang học]]",
        transform: {
            matches: element => element.tagName?.toUpperCase() === "SPAN" && element.classList.contains("page-link-token"),
            toMarkdown: (element, api) => api.normalizeInlineText(element.textContent || "[[Tên trang học]]"),
            fromMarkdown: ({ trimmed, api }) => {
                if (!/^\[\[(.*?)\]\]$/.test(trimmed)) return null;
                return {
                    matched: true,
                    html: `<span class="page-link-token">${api.escapeHtml(trimmed)}</span>`
                };
            }
        }
    });
})();
