# Exercise Question Form Skill

## Mục tiêu

Khi hệ thống gửi lên một list câu hỏi, AI phải trả về đúng một schema ổn định, không tự đổi key và không dùng key có dấu để tránh lỗi encoding hoặc parser.

## Schema chuẩn

```json
{
  "questions": "1. She __ to school everyday.\n2. He __ football on Sundays.",
  "type": "multiple_choice_blank",
  "cau_hoi": "Chọn đáp án đúng để hoàn thành các câu sau:",
  "cac_cau": [
    {
      "number": "1",
      "question": "She __ to school everyday.",
      "form": {
        "de_bai": "",
        "cau_A": "",
        "cau_B": "",
        "cau_C": "",
        "cau_D": "",
        "dap_an": "",
        "giai_thich": ""
      }
    },
    {
      "number": "2",
      "question": "He __ football on Sundays.",
      "form": {
        "de_bai": "",
        "cau_A": "",
        "cau_B": "",
        "cau_C": "",
        "cau_D": "",
        "dap_an": "",
        "giai_thich": ""
      }
    }
  ]
}
```

## Ý nghĩa các field

- `questions`: toàn bộ list câu hỏi gốc
- `type`: dạng bài chung của batch
- `cau_hoi`: hướng dẫn chung của dạng bài
- `cac_cau`: mảng các câu cần điền form
- `number`: số thứ tự câu
- `question`: câu gốc
- `form`: nội dung AI phải điền

## Quy tắc bắt buộc

- Luôn trả về JSON hợp lệ
- Chỉ trả về đúng 4 field top-level:
  - `questions`
  - `type`
  - `cau_hoi`
  - `cac_cau`
- Không thêm markdown
- Không thêm code block
- Không thêm text ngoài JSON
- Không đổi `questions`
- Không đổi `type`
- Không đổi `cau_hoi`
- Không đổi `number`
- Không đổi `question`
- Chỉ điền vào `form`

## Form của từng dạng bài

### 1. `multiple_choice_blank`

```json
{
  "questions": "She __ to school everyday.",
  "type": "multiple_choice_blank",
  "cau_hoi": "Chọn đáp án đúng để hoàn thành các câu sau:",
  "cac_cau": [
    {
      "number": "1",
      "question": "She __ to school everyday.",
      "form": {
        "de_bai": "She ____ to school everyday.",
        "cau_A": "go",
        "cau_B": "goes",
        "cau_C": "going",
        "cau_D": "is go",
        "dap_an": "B",
        "giai_thich": "Everyday chỉ thói quen nên dùng hiện tại đơn. She đi với goes."
      }
    }
  ]
}
```

### 2. `true_false`

```json
{
  "questions": "The sentence 'She go to school everyday' is correct.",
  "type": "true_false",
  "cau_hoi": "Đánh dấu đúng hoặc sai cho từng câu:",
  "cac_cau": [
    {
      "number": "1",
      "question": "The sentence 'She go to school everyday' is correct.",
      "form": {
        "de_bai": "The sentence 'She go to school everyday' is correct.",
        "cau_A": "True",
        "cau_B": "False",
        "cau_C": "",
        "cau_D": "",
        "dap_an": "B",
        "giai_thich": "She phải đi với goes nên mệnh đề này sai."
      }
    }
  ]
}
```

### 3. `rewrite_sentence`

```json
{
  "questions": "Rewrite the sentence correctly: She go to school everyday.",
  "type": "rewrite_sentence",
  "cau_hoi": "Viết lại câu cho đúng:",
  "cac_cau": [
    {
      "number": "1",
      "question": "Rewrite the sentence correctly: She go to school everyday.",
      "form": {
        "de_bai": "Rewrite the sentence correctly: She go to school everyday.",
        "cau_A": "",
        "cau_B": "",
        "cau_C": "",
        "cau_D": "",
        "dap_an": "She goes to school every day.",
        "giai_thich": "Cần đổi go thành goes và every day viết tách."
      }
    }
  ]
}
```

### 4. `short_answer`

```json
{
  "questions": "What tense should be used in 'She __ to school everyday'?",
  "type": "short_answer",
  "cau_hoi": "Trả lời ngắn gọn cho từng câu hỏi:",
  "cac_cau": [
    {
      "number": "1",
      "question": "What tense should be used in 'She __ to school everyday'?",
      "form": {
        "de_bai": "What tense should be used in 'She __ to school everyday'?",
        "cau_A": "",
        "cau_B": "",
        "cau_C": "",
        "cau_D": "",
        "dap_an": "The simple present tense.",
        "giai_thich": "Everyday diễn tả thói quen nên dùng hiện tại đơn."
      }
    }
  ]
}
```

### 5. `listening_dictation`

```json
{
  "questions": "Listen and write the sentence.",
  "type": "listening_dictation",
  "cau_hoi": "Nghe và chép lại chính xác câu sau:",
  "cac_cau": [
    {
      "number": "1",
      "question": "Listen and write the sentence.",
      "form": {
        "de_bai": "Listen and write the sentence.",
        "cau_A": "",
        "cau_B": "",
        "cau_C": "",
        "cau_D": "",
        "dap_an": "She goes to school every day.",
        "giai_thich": "Đây là transcript đúng của câu nghe."
      }
    }
  ]
}
```

### 6. `sentence_unscramble`

```json
{
  "questions": "Unscramble: school / she / every day / goes / to",
  "type": "sentence_unscramble",
  "cau_hoi": "Sắp xếp lại thành câu hoàn chỉnh:",
  "cac_cau": [
    {
      "number": "1",
      "question": "Unscramble: school / she / every day / goes / to",
      "form": {
        "de_bai": "Unscramble: school / she / every day / goes / to",
        "cau_A": "",
        "cau_B": "",
        "cau_C": "",
        "cau_D": "",
        "dap_an": "She goes to school every day.",
        "giai_thich": "Thứ tự đúng là chủ ngữ + động từ + cụm giới từ + trạng ngữ."
      }
    }
  ]
}
```
