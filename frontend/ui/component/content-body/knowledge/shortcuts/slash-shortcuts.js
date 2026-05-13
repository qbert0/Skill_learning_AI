window.KnowledgeSlashShortcuts = (() => {
    function handleKeyup(event, options = {}) {
        const {
            closeMenu = () => {},
            syncMenu = () => {}
        } = options;

        if (event.key === "Escape") {
            closeMenu();
            return true;
        }

        if (event.ctrlKey || event.metaKey || event.altKey) return false;
        syncMenu();
        return false;
    }

    return {
        handleKeyup
    };
})();
