PracticeExerciseTypeDefinitionRegistry.register({
    id: "multiple_choice_blank",
    label: "Điền từ bằng cách chọn đáp án",
    prompt: "Khoanh đáp án đúng hoặc điền từ phù hợp vào chỗ trống.",
    explanation: "Chọn đáp án đúng nhất dựa trên ngữ cảnh và cấu trúc câu.",
    answerMode: "single_choice",
    gradingMode: "auto",
    itemSchema: [
        { key: "prompt", type: "text", required: true, label: "Câu" },
        { key: "choices", type: "string[]", required: true, label: "Lựa chọn", minItems: 4, maxItems: 4 },
        { key: "expected", type: "text", required: false, label: "Đáp án đúng" },
        { key: "explanation", type: "textarea", required: false, label: "Giải thích" }
    ],
    builder: {
        editor: "choice-grid",
        choiceCount: 4,
        allowManualChoices: true
    },
    runner: {
        input: "radio"
    },
    ai: {
        canGenerateChoices: true,
        canFillExpected: true
    },
    tags: ["foundation", "reading", "listening"]
});
