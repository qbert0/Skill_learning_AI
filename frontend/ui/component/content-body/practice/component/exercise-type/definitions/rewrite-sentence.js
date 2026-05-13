PracticeExerciseTypeDefinitionRegistry.register({
    id: "rewrite_sentence",
    label: "Viết lại câu",
    prompt: "Viết lại câu hoặc chỉnh sửa câu cho đúng yêu cầu.",
    explanation: "Tập trung vào ngữ pháp, trật tự từ và ý nghĩa tương đương.",
    answerMode: "text",
    gradingMode: "auto",
    itemSchema: [
        { key: "prompt", type: "text", required: true, label: "Nội dung ý" },
        { key: "expected", type: "text", required: false, label: "Câu mẫu / đáp án" },
        { key: "explanation", type: "textarea", required: false, label: "Giải thích" }
    ],
    builder: {
        editor: "long-text",
        multilineAnswer: false
    },
    runner: {
        input: "textarea",
        rows: 3
    },
    ai: {
        canGradeOpenAnswer: true
    },
    tags: ["foundation", "writing"]
});
