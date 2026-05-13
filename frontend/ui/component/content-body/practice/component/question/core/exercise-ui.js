window.ExerciseUiRegistry = (() => {
    function render(exercise) {
        return (exercise.questions || []).map((question, index) => PracticeExerciseTypeRegistry.renderRunnerQuestion(question, index)).join("");
    }

    function collectAnswers(container) {
        const answers = {};
        container.querySelectorAll("[data-question-id]").forEach(input => {
            if (input.type === "radio" && !input.checked) return;
            answers[input.dataset.questionId] = String(input.value || "").trim();
        });
        return answers;
    }

    function label(type) {
        return PracticeExerciseTypeRegistry.label(type) || "Bài tập";
    }

    function renderReview(exercise, attempt) {
        if (!attempt) {
            return '<div class="empty-state compact">Chưa có lần làm bài nào để review.</div>';
        }

        const feedbackByKey = new Map((attempt.feedback || []).map(item => [`${item.questionId}::${item.itemId}`, item]));

        return `
            <section class="review-summary-card practice-card">
                <div class="review-summary-score">${attempt.correct}/${attempt.total}</div>
                <div class="review-summary-copy">
                    <h4>${escapeHtml(exercise.title || "Bài tập")}</h4>
                    <p>${escapeHtml(`Điểm: ${attempt.score}%. Lần nộp gần nhất lúc ${formatDateTime(attempt.createdAt)}.`)}</p>
                </div>
            </section>
            <div class="review-question-list">
                ${(exercise.questions || []).map((question, questionIndex) => {
                    const items = Array.isArray(question.items) ? question.items : [];
                    return `
                        <article class="review-question-card practice-card">
                            <div class="review-question-heading">
                                <span class="runner-question-order">Câu ${questionIndex + 1}</span>
                                <strong>${escapeHtml(question.prompt || ExerciseUiRegistry.label(question.type))}</strong>
                            </div>
                            <div class="review-item-list">
                                ${items.map((item, itemIndex) => {
                                    const key = `${question.id}::${item.id || itemIndex}`;
                                    const result = feedbackByKey.get(key);
                                    return `
                                        <section class="review-item ${result?.isCorrect ? "correct" : "wrong"}">
                                            <div class="review-item-head">
                                                <span class="runner-item-label">Ý ${String.fromCharCode(97 + itemIndex)}</span>
                                                <p class="runner-item-prompt">${escapeHtml(item.prompt || "")}</p>
                                            </div>
                                            <p><strong>Trả lời:</strong> ${escapeHtml(result?.answer || "(trống)")}</p>
                                            <p><strong>Đáp án:</strong> ${escapeHtml(result?.expected || "Được chấm theo AI / giáo viên")}</p>
                                            <details class="review-explanation">
                                                <summary>Xem giải thích</summary>
                                                <p>${escapeHtml(result?.explanation || item.explanation || question.explanation || "Chưa có giải thích.")}</p>
                                            </details>
                                        </section>
                                    `;
                                }).join("")}
                            </div>
                        </article>
                    `;
                }).join("")}
            </div>
        `;
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

    function formatDateTime(value) {
        if (!value) return "chưa rõ";
        return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
    }

    return { render, collectAnswers, label, renderReview };
})();
