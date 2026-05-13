window.KnowledgeBlockRegistry = (() => {
    const blocks = new Map();
    const rawHtmlFallbackTags = new Set(["BLOCKQUOTE", "FIGURE", "DETAILS"]);

    function shouldPreserveHtml(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
        if (rawHtmlFallbackTags.has(element.tagName?.toUpperCase?.())) return true;
        if (element.className) return true;
        if ([...(element.attributes || [])].some(attribute => attribute.name !== "contenteditable")) return true;
        return Boolean(element.querySelector?.("a, code, img, video, audio, table, .page-link-token"));
    }

    function register(block) {
        const definition = KnowledgeBlockCore.define(block);
        blocks.set(definition.id, definition);
        return definition;
    }

    function get(id) {
        return blocks.get(id) || null;
    }

    function getAll() {
        return [...blocks.values()].sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    function supportedBlocks() {
        return getAll().map(block => KnowledgeBlockCore.describe(block));
    }

    function clear() {
        blocks.clear();
    }

    function semanticElement(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;
        if (element.classList.contains("knowledge-block")) {
            return KnowledgeBlockFeature.semanticRoot(element);
        }
        return element;
    }

    function detectType(element) {
        const semantic = semanticElement(element);
        if (!semantic) return null;

        const matched = getAll().find(block => typeof block.transform?.matches === "function" && block.transform.matches(semantic));
        return matched?.id || null;
    }

    function elementToMarkdown(element) {
        const semantic = semanticElement(element);
        if (!semantic) return "";

        const block = get(detectType(semantic));
        if (typeof block?.transform?.toMarkdown === "function") {
            return KnowledgeBlockTransform.normalizeMarkdown(block.transform.toMarkdown(semantic, KnowledgeBlockTransform));
        }
        if (semantic.tagName?.toUpperCase() === "DIV") {
            return KnowledgeBlockTransform.normalizeMarkdown([...semantic.childNodes]
                .map(node => node.nodeType === Node.ELEMENT_NODE ? elementToMarkdown(node) : String(node.textContent || "").trim())
                .join("\n"));
        }
        if (shouldPreserveHtml(semantic)) {
            return KnowledgeBlockTransform.normalizeMarkdown(semantic.outerHTML || semantic.textContent || "");
        }
        return KnowledgeBlockTransform.normalizeMarkdown(semantic.textContent || "");
    }

    function htmlToMarkdown(html) {
        const template = document.createElement("template");
        template.innerHTML = String(html || "");
        return KnowledgeBlockTransform.normalizeMarkdown([...template.content.childNodes]
            .map(node => node.nodeType === Node.ELEMENT_NODE ? elementToMarkdown(node) : String(node.textContent || "").trim())
            .join("\n"));
    }

    function markdownToHtml(markdown) {
        return KnowledgeBlockTransform.markdownToHtml(markdown, getAll());
    }

    return {
        register,
        get,
        getAll,
        supportedBlocks,
        clear,
        semanticElement,
        detectType,
        elementToMarkdown,
        htmlToMarkdown,
        markdownToHtml
    };
})();

window.BlockPluginRegistry = window.KnowledgeBlockRegistry;
