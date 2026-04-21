window.BlockPluginRegistry = (() => {
    const plugins = new Map();

    function register(plugin) {
        if (!plugin?.id) throw new Error("Block plugin requires an id.");
        plugins.set(plugin.id, plugin);
        return plugin;
    }

    function get(id) {
        return plugins.get(id) || null;
    }

    function getAll() {
        return [...plugins.values()].sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    function clear() {
        plugins.clear();
    }

    return { register, get, getAll, clear };
})();
