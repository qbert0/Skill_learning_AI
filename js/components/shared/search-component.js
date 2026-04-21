window.SearchComponent = (() => {
    function init(input, onSearch) {
        const element = typeof input === "string" ? document.getElementById(input) : input;
        if (!element) return;
        element.addEventListener("input", () => onSearch(element.value.trim().toLowerCase()));
    }

    function filter(items, query, fields) {
        if (!query) return items;
        return items.filter(item => fields(item).join(" ").toLowerCase().includes(query));
    }

    return { init, filter };
})();
