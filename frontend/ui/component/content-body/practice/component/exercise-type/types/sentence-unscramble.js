(function registerSentenceUnscrambleExerciseType() {
    class SentenceUnscrambleExerciseType extends PracticeExerciseType {
        constructor() {
            super(PracticeExerciseTypeDefinitionRegistry.require("sentence_unscramble"));
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
                        ${this.items(question).map((item, itemIndex) => `
                            <article class="runner-question-item runner-item-card">
                                <div class="runner-item-head">
                                    <div class="runner-item-label">Ý ${String.fromCharCode(97 + itemIndex)}</div>
                                    <p class="runner-item-prompt">${escapeHtml(item.prompt || "")}</p>
                                </div>
                                <input class="short-answer-input" type="text" data-question-id="${escapeHtml(`${question.id}::${item.id || itemIndex}`)}" placeholder="Nhập câu đã sắp xếp đúng">
                            </article>
                        `).join("")}
                    </div>
                </section>
            `;
        }

        renderBuilderItem({ scope, index = 0, item = {} }) {
            const letters = "abcdefghijklmnopqrstuvwxyz".split("");
            const label = letters[index] || index + 1;
            return `
                <section class="question-item-editor" data-${scope}-item>
                    <div class="question-item-title">
                        <span>Ý ${label}</span>
                        <button class="btn btn-secondary question-item-delete" type="button" data-delete-question-item>Xóa ý</button>
                    </div>
                    <label>
                        <span>Từ / cụm từ xáo trộn</span>
                        <input type="text" data-${scope}-item-prompt value="${escapeHtml(item.prompt || "")}" placeholder="school / every day / goes / she / to">
                    </label>
                    <label>
                        <span>Câu đúng</span>
                        <input type="text" data-${scope}-item-expected value="${escapeHtml(item.expected || "")}" placeholder="She goes to school every day.">
                    </label>
                    <label>
                        <span>Giải thích</span>
                        <textarea rows="2" data-${scope}-item-explanation placeholder="Giải thích trật tự từ">${escapeHtml(item.explanation || "")}</textarea>
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
                    if (!options.allowPartial && (!prompt || !expected)) return null;
                    return {
                        id: `${scope}-item-${Date.now().toString(36)}-${index}`,
                        prompt,
                        expected,
                        explanation,
                        choices: []
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

    PracticeExerciseTypeRegistry.register(new SentenceUnscrambleExerciseType());
})();
