PracticeExerciseTypeDefinitionRegistry.register({
    id: "sentence_unscramble",
    label: "Sắp xếp lại câu",
    prompt: "Sắp xếp các từ/cụm từ để tạo thành câu đúng.",
    explanation: "Kiểm tra trật tự từ và cấu trúc câu.",
    answerMode: "text",
    gradingMode: "expected",
    itemSchema: [
        { key: "prompt", type: "text", required: true, label: "Từ / cụm từ bị xáo trộn" },
        { key: "expected", type: "text", required: true, label: "Câu đúng" },
        { key: "explanation", type: "textarea", required: false, label: "Giải thích" }
    ],
    builder: {
        editor: "short-text"
    },
    runner: {
        input: "text"
    },
    ai: {
        canFillExpected: true
    },
    tags: ["foundation", "writing"]
});
