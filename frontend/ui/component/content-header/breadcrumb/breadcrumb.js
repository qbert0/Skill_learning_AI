window.BreadcrumbModule = (() => {
    function render(target, parts) {
        if (!target) return;
        target.innerHTML = (parts || []).map((part, index) => `
            ${index ? '<span class="breadcrumb-separator">/</span>' : ""}
            <button type="button" class="breadcrumb-link" data-breadcrumb-view="${escapeHtml(part.view)}"
                ${part.skill ? `data-breadcrumb-skill="${escapeHtml(part.skill)}"` : ""}
                ${part.exerciseId ? `data-breadcrumb-exercise="${escapeHtml(part.exerciseId)}"` : ""}
                ${part.pageId ? `data-breadcrumb-page="${escapeHtml(part.pageId)}"` : ""}>
                ${escapeHtml(part.label)}
            </button>
        `).join("");
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

    return { render };
})();
