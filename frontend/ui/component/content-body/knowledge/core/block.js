window.KnowledgeBlockCore = (() => {
    const defaults = {
        order: 0,
        group: "basic",
        icon: "file",
        aliases: [],
        transform: {}
    };

    function define(block) {
        if (!block?.id) throw new Error("Knowledge block requires an id.");
        const definition = {
            ...defaults,
            ...block
        };
        definition.transform = {
            ...(definition.transform || {}),
            matches: definition.transform?.matches || definition.matches || null,
            toMarkdown: definition.transform?.toMarkdown || definition.toMarkdown || null,
            fromMarkdown: definition.transform?.fromMarkdown || null,
            priority: definition.transform?.priority ?? definition.order ?? 0
        };
        return definition;
    }

    function describe(block) {
        const definition = define(block);
        return {
            id: definition.id,
            label: definition.label || definition.id,
            hint: definition.hint || "",
            group: definition.group,
            icon: definition.icon
        };
    }

    return {
        define,
        describe
    };
})();
