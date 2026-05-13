PracticeExerciseTypeDefinitionRegistry.register({
    id: "short_answer",
    label: "Trả lời ngắn",
    prompt: "Đọc câu hỏi và trả lời ngắn gọn.",
    explanation: "Phù hợp cho đọc hiểu, speaking prompt hoặc câu hỏi khái niệm ngắn.",
    answerMode: "text",
    gradingMode: "auto",
    itemSchema: [
        { key: "prompt", type: "text", required: true, label: "Câu hỏi" },
        { key: "expected", type: "text", required: false, label: "Đáp án mẫu" },
        { key: "explanation", type: "textarea", required: false, label: "Giải thích" }
    ],
    builder: {
        editor: "short-text"
    },
    runner: {
        input: "text"
    },
    ai: {
        canGradeOpenAnswer: true
    },
    tags: ["reading", "speaking", "writing"]
});
