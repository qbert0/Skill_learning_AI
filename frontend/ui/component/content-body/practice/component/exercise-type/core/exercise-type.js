window.PracticeExerciseType = class PracticeExerciseType {
    constructor(definition = {}) {
        if (new.target === PracticeExerciseType) {
            throw new Error("PracticeExerciseType is abstract and cannot be instantiated directly.");
        }
        if (!definition.id) throw new Error("Practice exercise type requires an id.");
        this.id = definition.id;
        this.label = definition.label || definition.id;
        this.prompt = definition.prompt || this.label;
        this.explanation = definition.explanation || "";
        this.answerMode = definition.answerMode || "text";
        this.gradingMode = definition.gradingMode || "auto";
    }

    items(question) {
        if (Array.isArray(question.items) && question.items.length) return question.items;
        return [{
            id: question.id,
            prompt: question.itemPrompt || question.prompt || "",
            expected: question.expected || "",
            choices: Array.isArray(question.choices) ? question.choices : [],
            explanation: question.itemExplanation || ""
        }];
    }

    normalizeText(value) {
        return String(value || "").trim().toLowerCase();
    }

    scoreExpected(answer, expected) {
        const normalizedAnswer = this.normalizeText(answer);
        const normalizedExpected = this.normalizeText(expected);
        if (!normalizedExpected) return false;
        return normalizedAnswer === normalizedExpected || normalizedAnswer.includes(normalizedExpected);
    }

    resolveGradingMode(question, item) {
        const questionMode = question.gradingMode || this.gradingMode || "auto";
        if (questionMode !== "auto") return questionMode;
        return (item.expected || question.expected) ? "expected" : "ai";
    }

    gradeWithExpected({ question, item, answer, index }) {
        const expected = item.expected || "";
        const isCorrect = this.scoreExpected(answer, expected);
        return {
            questionId: question.id,
            questionPrompt: question.prompt || this.prompt,
            questionType: question.type || this.id,
            itemId: item.id || String(index),
            prompt: item.prompt || question.prompt || "",
            answer,
            expected,
            isCorrect,
            requiresAi: false,
            explanation: isCorrect
                ? "Câu trả lời khớp với đáp án."
                : (item.explanation || question.explanation || this.explanation || "Câu trả lời chưa khớp với đáp án dự kiến.")
        };
    }

    gradeWithAi({ question, item, answer, index }) {
        return {
            questionId: question.id,
            questionPrompt: question.prompt || this.prompt,
            questionType: question.type || this.id,
            itemId: item.id || String(index),
            prompt: item.prompt || question.prompt || "",
            answer,
            expected: item.expected || "",
            isCorrect: false,
            requiresAi: true,
            explanation: item.explanation || question.explanation || this.explanation || "Mục này cần AI để chấm điểm."
        };
    }

    grade(question, answers) {
        return this.items(question).map((item, index) => {
            const answerKey = `${question.id}::${item.id || index}`;
            const answer = String(answers[answerKey] || "").trim();
            const gradingMode = this.resolveGradingMode(question, item);
            if (gradingMode === "ai") return this.gradeWithAi({ question, item, answer, index });
            return this.gradeWithExpected({ question, item, answer, index });
        });
    }

    renderRunner() {
        throw new Error(`renderRunner must be implemented by exercise type "${this.id}".`);
    }

    renderBuilderItem() {
        throw new Error(`renderBuilderItem must be implemented by exercise type "${this.id}".`);
    }

    collectBuilderItems() {
        throw new Error(`collectBuilderItems must be implemented by exercise type "${this.id}".`);
    }
};
