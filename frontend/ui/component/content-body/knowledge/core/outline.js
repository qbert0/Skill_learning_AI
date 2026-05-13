window.KnowledgeOutlineModule = (() => {
    function collectHeadings(source) {
        if (!source) return [];
        return [...source.querySelectorAll("h1, h2, h3")].filter(item => item.textContent.trim());
    }

    function ensureHeadingIds(headings, activePageId) {
        headings.forEach((heading, index) => {
            if (!heading.id) heading.id = `heading-${activePageId || "page"}-${index}`;
        });
        return headings;
    }

    function render(target, source, activePageId, escapeHtml) {
        if (!target || !source) return;
        const headings = ensureHeadingIds(collectHeadings(source), activePageId);
        target.innerHTML = headings.length
            ? headings.map(heading => `
                <button type="button" data-outline-target="${heading.id}" class="outline-level-${heading.tagName.slice(1)}">
                    ${escapeHtml(heading.textContent.trim())}
                </button>
            `).join("")
            : '<div class="empty-outline">Chưa có heading.</div>';
    }

    function toggle(panel, button, label) {
        if (!panel || !button || !label) return false;
        const isOpen = panel.classList.toggle("open");
        button.setAttribute("aria-expanded", String(isOpen));
        label.textContent = isOpen ? "Ẩn" : "Hiện";
        return isOpen;
    }

    return {
        collectHeadings,
        ensureHeadingIds,
        render,
        toggle
    };
})();
