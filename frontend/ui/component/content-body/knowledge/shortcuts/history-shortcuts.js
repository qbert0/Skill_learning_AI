window.KnowledgeHistoryShortcuts = (() => {
    function handleKeydown(event, options = {}) {
        const {
            insideEditor = false,
            undo = () => false,
            redo = () => false
        } = options;

        if (!insideEditor) return false;

        const isUndo = (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z";
        if (isUndo) return Boolean(undo());

        const isRedo = ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y")
            || ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z");
        if (isRedo) return Boolean(redo());

        return false;
    }

    return {
        handleKeydown
    };
})();
