(function registerMultipleChoiceBlankExerciseType() {
    class MultipleChoiceBlankExerciseType extends PracticeExerciseType {
        constructor() {
            super(PracticeExerciseTypeDefinitionRegistry.require("multiple_choice_blank"));
        }

        renderRunner(question, index) {
            return `
                <section class="runner-question runner-question-card" data-question="${escapeHtml(question.id)}">
                    <div class="runner-question-heading">
                        <span class="runner-question-order">Câu ${index + 1}</span>
                        <strong>${escapeHtml(this.label)}</strong>
                    </div>
                    <p class="runner-question-prompt">${escapeHtml(question.prompt || this.prompt)}</p>
                    <div class="runner-question-items">
                        ${this.items(question).map((item, itemIndex) => {
                            const inputName = `answer-${question.id}-${item.id || itemIndex}`;
                            const answerKey = `${question.id}::${item.id || itemIndex}`;
                            const choices = (item.choices || []).slice(0, 4);
                            return `
                                <article class="runner-question-item runner-item-card">
                                    <div class="runner-item-head">
                                        <div class="runner-item-label">Ý ${String.fromCharCode(97 + itemIndex)}</div>
                                        <p class="runner-item-prompt">${escapeHtml(item.prompt || "")}</p>
                                    </div>
                                    <div class="choice-button-grid" role="radiogroup" aria-label="Đáp án cho ý ${itemIndex + 1}">
                                        ${choices.map((choice, choiceIndex) => `
                                            <label class="choice-button">
                                                <input type="radio" name="${escapeHtml(inputName)}" value="${escapeHtml(choice)}" data-question-id="${escapeHtml(answerKey)}">
                                                <span>${String.fromCharCode(65 + choiceIndex)}</span>
                                                <strong>${escapeHtml(choice)}</strong>
                                            </label>
                                        `).join("")}
                                    </div>
                                </article>
                            `;
                        }).join("")}
                    </div>
                </section>
            `;
        }

        renderBuilderItem({ scope, index = 0, item = {} }) {
            const letters = "abcdefghijklmnopqrstuvwxyz".split("");
            const label = letters[index] || index + 1;
            const choices = Array.isArray(item.choices) ? item.choices : [];
            return `
                <section class="question-item-editor" data-${scope}-item>
                    <div class="question-item-title">
                        <span>Ý ${label}</span>
                        <button class="btn btn-secondary question-item-delete" type="button" data-delete-question-item>Xóa ý</button>
                    </div>
                    <label class="question-item-field question-item-field-wide">
                        <span>Câu</span>
                        <input type="text" data-${scope}-item-prompt value="${escapeHtml(item.prompt || "")}" placeholder="She ___ to school every day.">
                    </label>
                    <div class="question-choice-grid">
                        ${[0, 1, 2, 3].map(choiceIndex => `
                            <label class="question-item-field">
                                <span>${letters[choiceIndex].toUpperCase()}</span>
                                <input type="text" data-${scope}-choice="${choiceIndex}" value="${escapeHtml(choices[choiceIndex] || "")}" placeholder="Đáp án ${letters[choiceIndex].toUpperCase()}">
                            </label>
                        `).join("")}
                    </div>
                    <label class="question-item-field">
                        <span>Đúng</span>
                        <input type="text" data-${scope}-item-expected value="${escapeHtml(item.expected || "")}" placeholder="Có thể để trống để AI điền sau">
                    </label>
                    <label class="question-item-field question-item-field-wide">
                        <span>Giải thích</span>
                        <textarea rows="2" data-${scope}-item-explanation placeholder="Giải thích vì sao đáp án này đúng">${escapeHtml(item.explanation || "")}</textarea>
                    </label>
                </section>
            `;
        }

        collectBuilderItems(root, scope, options = {}) {
            return [...(root?.querySelectorAll(`[data-${scope}-item]`) || [])]
                .map((itemNode, index) => {
                    const prompt = itemNode.querySelector(`[data-${scope}-item-prompt]`)?.value.trim() || "";
                    const expected = itemNode.querySelector(`[data-${scope}-item-expected]`)?.value.trim() || "";
                    const explanation = itemNode.querySelector(`[data-${scope}-item-explanation]`)?.value.trim() || "";
                    const choices = [0, 1, 2, 3].map(choiceIndex => itemNode.querySelector(`[data-${scope}-choice="${choiceIndex}"]`)?.value.trim() || "");
                    if (!options.allowPartial) {
                        if (!prompt) return null;
                        if (choices.some(choice => !choice)) return null;
                    }
                    return {
                        id: `${scope}-item-${Date.now().toString(36)}-${index}`,
                        prompt,
                        expected,
                        explanation,
                        choices
                    };
                })
                .filter(Boolean);
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

    PracticeExerciseTypeRegistry.register(new MultipleChoiceBlankExerciseType());
})();
