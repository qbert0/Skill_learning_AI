(function registerTrueFalseExerciseType() {
    class TrueFalseExerciseType extends PracticeExerciseType {
        constructor() {
            super(PracticeExerciseTypeDefinitionRegistry.require("true_false"));
            this.fixedChoices = ["True", "False"];
        }

        items(question) {
            return super.items(question).map(item => ({
                ...item,
                choices: this.fixedChoices.slice()
            }));
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
                            return `
                                <article class="runner-question-item runner-item-card">
                                    <div class="runner-item-head">
                                        <div class="runner-item-label">Ý ${String.fromCharCode(97 + itemIndex)}</div>
                                        <p class="runner-item-prompt">${escapeHtml(item.prompt || "")}</p>
                                    </div>
                                    <div class="choice-button-grid compact-choice-grid" role="radiogroup" aria-label="Đáp án cho ý ${itemIndex + 1}">
                                        ${this.fixedChoices.map(choice => `
                                            <label class="choice-button">
                                                <input type="radio" name="${escapeHtml(inputName)}" value="${escapeHtml(choice)}" data-question-id="${escapeHtml(answerKey)}">
                                                <span>${escapeHtml(choice.slice(0, 1))}</span>
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
            const expected = String(item.expected || "").trim() || "True";
            return `
                <section class="question-item-editor" data-${scope}-item>
                    <div class="question-item-title">
                        <span>Ý ${label}</span>
                        <button class="btn btn-secondary question-item-delete" type="button" data-delete-question-item>Xóa ý</button>
                    </div>
                    <label class="question-item-field question-item-field-wide">
                        <span>Nhận định</span>
                        <input type="text" data-${scope}-item-prompt value="${escapeHtml(item.prompt || "")}" placeholder="The sentence is grammatically correct.">
                    </label>
                    <label class="question-item-field">
                        <span>Đáp án đúng</span>
                        <select data-${scope}-item-expected>
                            ${this.fixedChoices.map(choice => `<option value="${escapeHtml(choice)}" ${choice === expected ? "selected" : ""}>${escapeHtml(choice)}</option>`).join("")}
                        </select>
                    </label>
                    <label class="question-item-field question-item-field-wide">
                        <span>Giải thích</span>
                        <textarea rows="2" data-${scope}-item-explanation placeholder="Giải thích vì sao nhận định này đúng hoặc sai">${escapeHtml(item.explanation || "")}</textarea>
                    </label>
                </section>
            `;
        }

        collectBuilderItems(root, scope, options = {}) {
            return [...(root?.querySelectorAll(`[data-${scope}-item]`) || [])]
                .map((itemNode, index) => {
                    const prompt = itemNode.querySelector(`[data-${scope}-item-prompt]`)?.value.trim() || "";
                    const expected = itemNode.querySelector(`[data-${scope}-item-expected]`)?.value.trim() || "True";
                    const explanation = itemNode.querySelector(`[data-${scope}-item-explanation]`)?.value.trim() || "";
                    if (!options.allowPartial && !prompt) return null;
                    return {
                        id: `${scope}-item-${Date.now().toString(36)}-${index}`,
                        prompt,
                        expected,
                        explanation,
                        choices: this.fixedChoices.slice()
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

    PracticeExerciseTypeRegistry.register(new TrueFalseExerciseType());
})();
