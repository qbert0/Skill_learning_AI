PracticeExerciseTypeDefinitionRegistry.register({
    id: "true_false",
    label: "Đúng / Sai",
    prompt: "Đọc nhận định và chọn Đúng hoặc Sai.",
    explanation: "Kiểm tra nhanh khả năng hiểu nội dung hoặc quy tắc.",
    answerMode: "single_choice",
    gradingMode: "expected",
    itemSchema: [
        { key: "prompt", type: "text", required: true, label: "Nhận định" },
        { key: "expected", type: "enum", required: true, label: "Đáp án đúng", options: ["True", "False"] },
        { key: "explanation", type: "textarea", required: false, label: "Giải thích" }
    ],
    builder: {
        editor: "fixed-choices",
        choiceCount: 2,
        fixedChoices: ["True", "False"]
    },
    runner: {
        input: "radio"
    },
    ai: {
        canFillExpected: true
    },
    tags: ["foundation", "reading", "listening"]
});
