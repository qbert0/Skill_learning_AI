window.PageTreeItemComponent = (() => {
    function render({ page, hasChildren, isCollapsed, isActive, level, childrenHtml }) {
        return `
            <div class="page-node" data-page-id-node="${page.id}" style="--tree-level:${level}">
                <div class="page-item ${isActive ? "active" : ""}" draggable="true" data-page-drag="${page.id}" data-page-drop="${page.id}">
                    ${hasChildren
                        ? IconButton.render(isCollapsed ? "toggleClosed" : "toggleOpen", { className: "page-item-toggle", data: { "page-toggle": page.id }, title: "Mở/thu trang con" })
                        : '<span class="page-item-toggle-placeholder"></span>'}
                    <div class="page-item-main" data-page-id="${page.id}">
                        <span class="page-file-icon">${IconRegistry.svg(hasChildren ? "folder" : "file")}</span>
                        <input class="page-title-inline" type="text" value="${escapeHtml(page.title)}" data-page-title-input="${page.id}" readonly aria-label="Tên trang học">
                        <span>${escapeHtml(page.tags.join(", ") || "không có tag")} · ${formatDate(page.updatedAt)}</span>
                    </div>
                    ${IconButton.render("add", { className: "page-item-add", data: { "page-add-child": page.id }, title: "Thêm trang con" })}
                    ${IconButton.render("more", { className: "page-item-more", data: { "page-more": page.id }, title: "Tùy chọn trang" })}
                </div>
                ${hasChildren && !isCollapsed ? `<div class="page-children">${childrenHtml}</div>` : ""}
            </div>`;
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char]));
    }

    function formatDate(value) {
        return value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value)) : "chưa rõ";
    }

    return { render };
})();
