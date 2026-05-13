PracticeExerciseTypeDefinitionRegistry.register({
    id: "listening_dictation",
    label: "Nghe chép chính tả",
    prompt: "Nghe và chép lại chính xác câu hoặc cụm từ.",
    explanation: "Tập trung vào khả năng nhận âm, chính tả và cụm từ.",
    answerMode: "text",
    gradingMode: "expected",
    itemSchema: [
        { key: "prompt", type: "text", required: true, label: "Chỉ dẫn / ngữ cảnh" },
        { key: "expected", type: "text", required: true, label: "Nội dung chuẩn" },
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
    tags: ["listening"]
});
