window.AccordionComponent = (() => {
    function render({ id = "", title, meta = "", body = "", open = false, className = "", action = "data-accordion" }) {
        const actionAttr = action.includes("=") ? action : `${action}="${id}"`;
        return `
            <section class="accordion-group ${className} ${open ? "open" : ""}">
                <button class="accordion-header" type="button" ${actionAttr}>
                    <span>${title}</span>
                    <span>${meta}</span>
                </button>
                <div class="accordion-body">${body}</div>
            </section>`;
    }

    function toggleFromEvent(event, selector = "[data-accordion]") {
        const target = event.target.closest(selector);
        if (!target) return false;
        target.closest(".accordion-group")?.classList.toggle("open");
        return true;
    }

    return { render, toggleFromEvent };
})();
