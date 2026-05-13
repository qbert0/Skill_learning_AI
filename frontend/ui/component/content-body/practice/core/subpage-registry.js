window.PracticeInterfaceRegistry = (() => {
    const subpages = new Map();

    function registerSubpage(definition) {
        if (!definition?.id) return;
        subpages.set(definition.id, {
            id: definition.id,
            breadcrumb: typeof definition.breadcrumb === "function" ? definition.breadcrumb : (() => []),
            route: typeof definition.route === "function" ? definition.route : (() => "#/practice"),
            title: typeof definition.title === "function" ? definition.title : (() => "")
        });
    }

    function resolve(id = "list") {
        return subpages.get(id) || subpages.get("list") || null;
    }

    function breadcrumb(id, context = {}) {
        return resolve(id)?.breadcrumb(context) || [];
    }

    function route(id, context = {}) {
        return resolve(id)?.route(context) || "#/practice";
    }

    function title(id, context = {}) {
        return resolve(id)?.title(context) || "";
    }

    return {
        registerSubpage,
        resolve,
        breadcrumb,
        route,
        title
    };
})();
