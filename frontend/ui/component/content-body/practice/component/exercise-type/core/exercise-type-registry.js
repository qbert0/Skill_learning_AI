window.PracticeExerciseTypeRegistry = (() => {
    const types = new Map();

    function register(typeInstance) {
        if (!(typeInstance instanceof PracticeExerciseType)) {
            throw new Error("Exercise type registry expects an instance of PracticeExerciseType.");
        }
        types.set(typeInstance.id, typeInstance);
        return typeInstance;
    }

    function get(id) {
        return types.get(id) || null;
    }

    function requireType(id) {
        const type = get(id);
        if (!type) throw new Error(`Exercise type "${id}" is not registered.`);
        return type;
    }

    function label(id) {
        return get(id)?.label || id || "Dạng bài";
    }

    function prompt(id) {
        return get(id)?.prompt || label(id);
    }

    function explanation(id) {
        return get(id)?.explanation || "";
    }

    function renderRunnerQuestion(question, index) {
        return requireType(question.type).renderRunner(question, index);
    }

    function renderBuilderItem(typeId, scope, index = 0, item = {}) {
        return requireType(typeId).renderBuilderItem({ scope, index, item });
    }

    function renderBuilderItems(typeId, scope, count = 1, items = []) {
        return Array.from({ length: count }, (_, index) => renderBuilderItem(typeId, scope, index, items[index] || {})).join("");
    }

    function collectBuilderItems(typeId, root, scope, options = {}) {
        return requireType(typeId).collectBuilderItems(root, scope, options);
    }

    function gradeQuestion(question, answers) {
        return requireType(question.type).grade(question, answers);
    }

    function all() {
        return [...types.values()];
    }

    return {
        register,
        get,
        require: requireType,
        label,
        prompt,
        explanation,
        renderRunnerQuestion,
        renderBuilderItem,
        renderBuilderItems,
        collectBuilderItems,
        gradeQuestion,
        all
    };
})();
