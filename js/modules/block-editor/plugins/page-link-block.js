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
        }
    });
})();
