window.ExerciseUiRegistry = (() => {
    const typeLabels = {
        fill_blank: "Điền từ vào câu",
        synonym: "Tìm từ đồng nghĩa",
        multiple_choice: "Trắc nghiệm",
        short_answer: "Trả lời ngắn",
        writing: "Viết tự luận",
        speaking: "Luyện nói",
        listening_note: "Nghe và ghi chú"
    };

    function render(exercise) {
        return exercise.questions.map((question, index) => renderQuestion(question, index)).join("");
    }

    function renderQuestion(question, index) {
        const title = `<strong>Câu ${index + 1}: ${escapeHtml(question.prompt)}</strong>`;
        if ((question.type === "multiple_choice" || question.type === "synonym") && (question.choices || []).length) {
            const choices = (question.choices || []).map((choice, choiceIndex) => `
                <label>
                    <input type="radio" name="answer-${question.id}" value="${escapeHtml(choice)}" data-question-id="${question.id}">
                    ${escapeHtml(choice)}
                </label>
            `).join("");
            return `<div class="runner-question" data-question="${question.id}">${title}${choices}</div>`;
        }

        if (question.type === "writing") {
            return `<div class="runner-question" data-question="${question.id}">${title}<textarea rows="8" data-question-id="${question.id}" placeholder="Viết câu trả lời của bạn"></textarea></div>`;
        }

        if (question.type === "speaking") {
            return `<div class="runner-question" data-question="${question.id}">${title}<textarea rows="5" data-question-id="${question.id}" placeholder="Ghi transcript hoặc ý chính câu trả lời nói của bạn"></textarea></div>`;
        }

        if (question.type === "listening_note") {
            return `<div class="runner-question" data-question="${question.id}">${title}<textarea rows="5" data-question-id="${question.id}" placeholder="Ghi từ khóa, ý chính hoặc câu nghe được"></textarea></div>`;
        }

        return `<div class="runner-question" data-question="${question.id}">${title}<input type="text" data-question-id="${question.id}" placeholder="Nhập đáp án"></div>`;
    }

    function collectAnswers(container) {
        const answers = {};
        container.querySelectorAll("[data-question-id]").forEach(input => {
            if (input.type === "radio" && !input.checked) return;
            answers[input.dataset.questionId] = input.value.trim();
        });
        return answers;
    }

    function label(type) {
        return typeLabels[type] || "Bài tập";
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

    return { render, collectAnswers, label };
})();
