user_data/studio/
├─ settings.json
├─ workspaces.json
├─ studio.backup.json
├─ trang-hoc/
│  └─ <workspace-id>/
│     └─ pages.json
├─ luyen-tap/
│  └─ <workspace-id>/
│     ├─ Foundation/
│     │  └─ exercises.json
│     ├─ Listening/
│     │  └─ exercises.json
│     ├─ Writing/
│     │  └─ exercises.json
│     ├─ Speaking/
│     │  └─ exercises.json
│     ├─ Reading/
│     │  └─ exercises.json
│     └─ attempts.json
├─ phan-tich-loi/
│  └─ <workspace-id>/
│     └─ mistakes.json
└─ bai-tap-tuan/
   └─ <workspace-id>/
      └─ tests.json

Skill storage

- `Foundation`: gộp `Grammar` và `Vocabulary`, vì hai nhóm này dùng chung kiểu bài tập.
- `Listening`, `Writing`, `Speaking`, `Reading`: giữ riêng theo kỹ năng.
- Hiện tại chỉ `Foundation` có 2 dạng câu đã triển khai: `multiple_choice_blank` và `rewrite_sentence`.
- Với các skill chưa có dạng bài tương ứng, giao diện không cho tạo bài mới.
- Khi đọc dữ liệu cũ, các skill `Grammar` và `Vocabulary` được migrate mềm sang `Foundation`.
- Khi lưu dữ liệu mới, bài tập ngữ pháp/từ vựng chỉ ghi vào `Foundation/exercises.json`.

Exercise schema

```json
{
  "id": "ex-...",
  "workspaceId": "ws-...",
  "skill": "Foundation",
  "title": "Bài 1",
  "sourcePrompt": "Ghi chú chung",
  "createdAt": "2026-04-21T00:00:00.000Z",
  "questions": [
    {
      "id": "q-...",
      "skill": "Foundation",
      "type": "multiple_choice_blank",
      "prompt": "Chọn đáp án đúng vào chỗ trống",
      "items": [
        {
          "id": "item-...",
          "prompt": "She ___ to school every day.",
          "expected": "goes",
          "choices": ["go", "goes", "went", "gone"]
        }
      ],
      "explanation": "Chọn đáp án đúng để điền vào chỗ trống."
    },
    {
      "id": "q-...",
      "skill": "Foundation",
      "type": "rewrite_sentence",
      "prompt": "Viết lại câu cho đúng",
      "items": [
        {
          "id": "item-...",
          "prompt": "I has a book.",
          "expected": "I have a book.",
          "choices": []
        }
      ],
      "explanation": "Viết lại câu cho đúng ngữ pháp."
    }
  ]
}
```

Practice tree

Workspace
└─ Luyện tập
   └─ Skill
      └─ Bài tập
         └─ Câu
            ├─ Ý a
            │  ├─ Đề bài
            │  ├─ Đáp án đúng
            │  └─ 4 lựa chọn nếu là `multiple_choice_blank`
            └─ Ý b
               ├─ Đề bài
               └─ Đáp án đúng
