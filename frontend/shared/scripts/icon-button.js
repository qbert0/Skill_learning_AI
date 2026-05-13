window.IconButton = (() => {
    function render(action, attrs = {}) {
        const config = IconButtonConfig.actions[action] || {};
        const icon = attrs.icon || config.icon || "plus";
        const size = attrs.size || config.size || "md";
        const title = attrs.title || config.title || "";
        const className = [IconButtonConfig.baseClass, `${IconButtonConfig.baseClass}--${size}`, attrs.className || ""].filter(Boolean).join(" ");
        const dataAttrs = Object.entries(attrs.data || {})
            .map(([key, value]) => `data-${escapeHtml(key)}="${escapeHtml(value)}"`)
            .join(" ");
        const id = attrs.id ? `id="${escapeHtml(attrs.id)}"` : "";
        return `<button ${id} class="${className}" type="button" title="${escapeHtml(title)}" ${dataAttrs}>${IconRegistry.svg(icon)}</button>`;
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
