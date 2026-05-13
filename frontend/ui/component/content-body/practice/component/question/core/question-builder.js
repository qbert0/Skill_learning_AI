window.PracticeQuestionComponent = (() => {
    function renderExerciseTypeOptions(skill, selected = "") {
        const types = PracticeSkillRegistry.exerciseTypesForSkill(skill);
        if (!types.length) return '<option value="">Chưa có dạng bài tập</option>';
        return types.map(type => `
            <option value="${escapeHtml(type.id)}" ${type.id === selected ? "selected" : ""}>${escapeHtml(type.label)}</option>
        `).join("");
    }

    function defaultExerciseTypeForSkill(skill) {
        return PracticeSkillRegistry.exerciseTypesForSkill(skill)[0]?.id || "";
    }

    function renderManualQuestionEditorRow(index, skill, question = {}) {
        const selectedType = question.type || defaultExerciseTypeForSkill(skill) || "multiple_choice_blank";
        const items = Array.isArray(question.items) && question.items.length ? question.items : [{}];
        return `
            <section class="manual-question-card practice-card" data-manual-question>
                <div class="manual-question-header">
                    <div>
                        <div class="manual-question-eyebrow">Câu ${index + 1}</div>
                        <div class="manual-question-title">${escapeHtml(PracticeExerciseTypeRegistry.label(selectedType))}</div>
                    </div>
                    <button class="btn btn-secondary question-delete-btn" type="button" data-delete-manual-question>Xóa câu</button>
                </div>

                <div class="manual-question-toolbar">
                    <label>Dạng bài
                        <select data-manual-type>
                            ${renderExerciseTypeOptions(skill, selectedType)}
                        </select>
                    </label>
                </div>

                <label class="manual-question-prompt-field">
                    <span>Đề bài</span>
                    <textarea rows="2" data-manual-question-prompt placeholder="Đề bài chung">${escapeHtml(question.prompt || PracticeExerciseTypeRegistry.prompt(selectedType))}</textarea>
                </label>

                <div class="question-item-builder" data-manual-item-list>
                    ${renderQuestionItemRows(selectedType, "manual", items.length || 1, items)}
                </div>

                <div class="manual-question-actions">
                    <button class="btn btn-secondary" type="button" data-add-manual-item>Thêm ý</button>
                </div>
            </section>
        `;
    }

    function renderQuestionItemRows(type, scope, count = 1, items = []) {
        return PracticeExerciseTypeRegistry.renderBuilderItems(type, scope, count, items);
    }

    function appendQuestionItemRow(root, scope, fallbackSkill) {
        const type = root?.querySelector(`[data-${scope}-type]`)?.value || defaultExerciseTypeForSkill(fallbackSkill) || "multiple_choice_blank";
        const list = root?.querySelector(`[data-${scope}-item-list]`);
        if (!list) return;
        const count = list.querySelectorAll(`[data-${scope}-item]`).length;
        list.insertAdjacentHTML("beforeend", PracticeExerciseTypeRegistry.renderBuilderItem(type, scope, count));
    }

    function refreshQuestionItemEditors(root, scope, fallbackSkill) {
        const type = root?.querySelector(`[data-${scope}-type]`)?.value || defaultExerciseTypeForSkill(fallbackSkill) || "multiple_choice_blank";
        const list = root?.querySelector(`[data-${scope}-item-list]`);
        if (!list) return;
        const existingItems = collectQuestionItems(root, scope, { allowPartial: true }, fallbackSkill);
        list.innerHTML = renderQuestionItemRows(type, scope, Math.max(1, existingItems.length), existingItems);
        const title = root?.querySelector(".manual-question-title");
        if (title && scope === "manual") title.textContent = PracticeExerciseTypeRegistry.label(type);
    }

    function collectQuestionItems(root, scope, options = {}, fallbackSkill) {
        const type = root?.querySelector(`[data-${scope}-type]`)?.value || defaultExerciseTypeForSkill(fallbackSkill) || "multiple_choice_blank";
        return PracticeExerciseTypeRegistry.collectBuilderItems(type, root, scope, options);
    }

    function buildQuestionFromForm(form, scope, skill, index = 0) {
        const type = form.querySelector(`[data-${scope}-type]`)?.value || defaultExerciseTypeForSkill(skill) || "multiple_choice_blank";
        const items = collectQuestionItems(form, scope, {}, skill);
        const prompt = form.querySelector(`[data-${scope}-question-prompt]`)?.value.trim() || PracticeExerciseTypeRegistry.prompt(type);
        const explanation = questionExplanation(type, items);
        const gradingMode = questionGradingMode(items);
        if (!type || !items.length) return null;
        return {
            id: makeId(`q${index}`),
            skill: PracticeSkillRegistry.normalizeSkill(skill),
            type,
            prompt,
            gradingMode,
            items,
            explanation
        };
    }

    function questionExplanation(type, items) {
        const firstItemExplanation = items.find(item => item.explanation)?.explanation || "";
        return firstItemExplanation || PracticeExerciseTypeRegistry.explanation(type);
    }

    function questionGradingMode(items) {
        return items.every(item => String(item.expected || "").trim()) ? "expected" : "ai";
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

    function makeId(prefix) {
        return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }

    return {
        renderExerciseTypeOptions,
        defaultExerciseTypeForSkill,
        renderManualQuestionEditorRow,
        renderQuestionItemRows,
        appendQuestionItemRow,
        refreshQuestionItemEditors,
        collectQuestionItems,
        buildQuestionFromForm
    };
})();
