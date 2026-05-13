window.PracticeSkillRegistry = (() => {
    const skills = new Map();
    const legacySkillMap = new Map();

    function registerSkill(skill) {
        if (!skill?.id) return;
        const normalized = {
            id: skill.id,
            label: skill.label || skill.id,
            icon: skill.icon || "practice",
            exerciseTypes: [],
            legacyIds: Array.isArray(skill.legacyIds) ? skill.legacyIds : []
        };
        skills.set(normalized.id, normalized);
        normalized.legacyIds.forEach(id => legacySkillMap.set(id, normalized.id));
    }

    function registerExerciseType(skillId, exerciseType) {
        const skill = skills.get(skillId);
        if (!skill) return;
        const resolved = typeof exerciseType === "string"
            ? PracticeExerciseTypeDefinitionRegistry.get(exerciseType)
            : exerciseType;
        if (!resolved?.id) return;
        skill.exerciseTypes.push({
            id: resolved.id,
            label: resolved.label || resolved.id,
            prompt: resolved.prompt || "",
            answerMode: resolved.answerMode || "text",
            choices: Boolean(resolved.choices || resolved.builder?.choiceCount),
            explanation: resolved.explanation || "",
            itemSchema: Array.isArray(resolved.itemSchema) ? resolved.itemSchema : [],
            builder: resolved.builder || {}
        });
    }

    function allSkills() {
        return [...skills.values()];
    }

    function skillIds() {
        return allSkills().map(skill => skill.id);
    }

    function skillLabels() {
        return Object.fromEntries(allSkills().map(skill => [skill.id, skill.label]));
    }

    function normalizeSkill(skillId) {
        if (legacySkillMap.has(skillId)) return legacySkillMap.get(skillId);
        return skills.has(skillId) ? skillId : (skillIds()[0] || "Foundation");
    }

    function canCreateExercise(skillId) {
        const skill = skills.get(normalizeSkill(skillId));
        return Boolean(skill?.exerciseTypes?.length);
    }

    function exerciseTypesForSkill(skillId) {
        return skills.get(normalizeSkill(skillId))?.exerciseTypes || [];
    }

    function renderSkillButtons({ attribute, className = "", activeSkill = "" } = {}) {
        return allSkills().map(skill => `
            <button class="${className}" type="button" ${attribute}="${skill.id}">
                ${window.IconRegistry ? IconRegistry.svg(skill.icon) : ""}
                <span>${escapeHtml(skill.label)}</span>
            </button>
        `).join("");
    }

    function populateSkillSelect(select, { includeEmpty = true } = {}) {
        if (!select) return;
        select.innerHTML = `
            ${includeEmpty ? '<option value="">-- Chọn kỹ năng --</option>' : ""}
            ${allSkills().map(skill => `<option value="${escapeHtml(skill.id)}">${escapeHtml(skill.label)}</option>`).join("")}
        `;
    }

    function hydrateNavigation({ practiceSkillSelector, practiceSubnav } = {}) {
        if (practiceSkillSelector) {
            practiceSkillSelector.innerHTML = renderSkillButtons({ attribute: "data-select-practice-skill", className: "skill-selector-btn" });
        }
        if (practiceSubnav && !practiceSubnav.querySelector("[data-practice-skill]")) {
            practiceSubnav.innerHTML = renderSkillButtons({ attribute: "data-practice-skill" });
        }
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char]));
    }

    return {
        registerSkill,
        registerExerciseType,
        allSkills,
        skillIds,
        skillLabels,
        normalizeSkill,
        canCreateExercise,
        exerciseTypesForSkill,
        populateSkillSelect,
        hydrateNavigation
    };
})();
