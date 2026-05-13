window.PracticeExerciseTypeDefinitionRegistry = (() => {
    const definitions = new Map();

    function register(definition = {}) {
        if (!definition.id) {
            throw new Error("Exercise type definition requires an id.");
        }

        const normalized = {
            id: definition.id,
            label: definition.label || definition.id,
            prompt: definition.prompt || definition.label || definition.id,
            explanation: definition.explanation || "",
            answerMode: definition.answerMode || "text",
            gradingMode: definition.gradingMode || "auto",
            itemSchema: Array.isArray(definition.itemSchema) ? definition.itemSchema : [],
            builder: definition.builder && typeof definition.builder === "object" ? definition.builder : {},
            runner: definition.runner && typeof definition.runner === "object" ? definition.runner : {},
            ai: definition.ai && typeof definition.ai === "object" ? definition.ai : {},
            tags: Array.isArray(definition.tags) ? definition.tags : []
        };

        definitions.set(normalized.id, normalized);
        return normalized;
    }

    function get(id) {
        return definitions.get(id) || null;
    }

    function requireDefinition(id) {
        const definition = get(id);
        if (!definition) {
            throw new Error(`Exercise type definition "${id}" is not registered.`);
        }
        return definition;
    }

    function all() {
        return [...definitions.values()];
    }

    return {
        register,
        get,
        require: requireDefinition,
        all
    };
})();
