window.KnowledgeBlockFeature = (() => {
    function createFeatureButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "block-feature-button";
        button.setAttribute("aria-label", "Tùy chọn block");
        button.setAttribute("draggable", "true");
        button.innerHTML = IconRegistry.svg("grip");
        return button;
    }

    function createFeature() {
        const feature = document.createElement("div");
        feature.className = "knowledge-block__feature";
        feature.appendChild(createFeatureButton());
        return feature;
    }

    function createContent() {
        const content = document.createElement("div");
        content.className = "knowledge-block__content";
        return content;
    }

    function contentRoot(block) {
        return block?.querySelector?.(":scope > .knowledge-block__content") || null;
    }

    function featureRoot(block) {
        return block?.querySelector?.(":scope > .knowledge-block__feature") || null;
    }

    function ensureStructure(node) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return node;
        if (node.classList.contains("knowledge-block")) {
            if (!featureRoot(node)) node.prepend(createFeature());
            if (!contentRoot(node)) {
                const content = createContent();
                const movableChildren = [...node.childNodes].filter(child => child !== featureRoot(node));
                movableChildren.forEach(child => content.appendChild(child));
                node.appendChild(content);
            }
            return node;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "knowledge-block";
        const feature = createFeature();
        const content = createContent();
        node.replaceWith(wrapper);
        content.appendChild(node);
        wrapper.append(feature, content);
        return wrapper;
    }

    function unwrapClone(wrapper) {
        if (!wrapper?.classList?.contains("knowledge-block")) return wrapper?.outerHTML || "";
        const content = contentRoot(wrapper);
        if (!content) return "";
        return [...content.childNodes].map(node => {
            if (node.nodeType === Node.ELEMENT_NODE) return node.outerHTML;
            return node.textContent || "";
        }).join("");
    }

    function semanticRoot(block) {
        const content = contentRoot(block);
        return content?.firstElementChild || null;
    }

    return {
        ensureStructure,
        contentRoot,
        featureRoot,
        semanticRoot,
        unwrapClone
    };
})();
