<?php
declare(strict_types=1);

namespace App\Exercises;

use App\AI\AiClient;
use App\Domain\SkillSet;

final class ExerciseGenerator
{
    private AiClient $ai;

    public function __construct(AiClient $ai)
    {
        $this->ai = $ai;
    }

    public function generate(array $studio, array $options): array
    {
        $language = (string)($options['language'] ?? ($studio['settings']['languages'][0] ?? 'English'));
        $skill = (string)($options['skill'] ?? 'Mixed');
        $limit = max(1, min(10, (int)($options['limit'] ?? 5)));
        $model = (string)($options['model'] ?? ($studio['settings']['aiModel'] ?? 'local-rule-based'));

        $knowledge = array_values(array_filter($studio['knowledge'] ?? [], function (array $item) use ($language, $skill): bool {
            $sameLanguage = ($item['language'] ?? '') === $language;
            $sameSkill = $skill === 'Mixed' || ($item['skill'] ?? '') === $skill;
            return $sameLanguage && $sameSkill;
        }));

        if (!$knowledge) {
            $knowledge = array_values(array_filter($studio['knowledge'] ?? [], fn (array $item): bool => ($item['language'] ?? '') === $language));
        }

        $this->ai->complete([
            ['role' => 'system', 'content' => 'Generate language-learning exercises for all five core skills.'],
            ['role' => 'user', 'content' => 'Generate exercise set for ' . $language . ' / ' . $skill],
        ], $model);

        $questions = [];
        foreach (array_slice($this->shuffle($knowledge), 0, $limit) as $index => $item) {
            $normalizedSkill = SkillSet::normalize((string)($item['skill'] ?? SkillSet::VOCABULARY));
            $questions[] = $this->buildQuestion($item, $normalizedSkill, $index);
        }

        return [
            'id' => 'exercise-' . bin2hex(random_bytes(5)),
            'language' => $language,
            'skill' => $skill,
            'questions' => $questions,
            'createdAt' => gmdate('c'),
            'mode' => $model,
        ];
    }

    private function buildQuestion(array $item, string $skill, int $index): array
    {
        $title = (string)($item['title'] ?? 'Untitled');
        $examples = array_values($item['examples'] ?? []);
        $expected = $examples[0] ?? (string)($item['content'] ?? '');
        $promptMap = [
            SkillSet::VOCABULARY => "Giải thích nghĩa và đặt một câu mới với: $title",
            SkillSet::GRAMMAR => "Viết một câu áp dụng cấu trúc: $title",
            SkillSet::LISTENING => "Chuẩn bị câu trả lời nghe hiểu: bạn sẽ nghe chủ đề '$title', hãy ghi các từ khóa cần bắt được.",
            SkillSet::SPEAKING => "Soạn câu trả lời nói ngắn cho chủ đề: $title",
            SkillSet::READING => "Đọc nội dung đã lưu về '$title' và nêu ý chính bằng 1-2 câu.",
            SkillSet::WRITING => "Viết một đoạn ngắn có sử dụng kiến thức: $title",
        ];

        return [
            'id' => ($item['id'] ?? 'knowledge') . '-' . $index,
            'sourceId' => $item['id'] ?? null,
            'sourceTitle' => $title,
            'language' => $item['language'] ?? 'English',
            'skill' => $skill,
            'prompt' => $promptMap[$skill],
            'expected' => $expected,
            'rubric' => $this->rubricFor($skill),
            'keywords' => $this->keywords($item),
        ];
    }

    private function rubricFor(string $skill): array
    {
        return match ($skill) {
            SkillSet::LISTENING => ['captures key words', 'understands main idea', 'uses context'],
            SkillSet::SPEAKING => ['relevant response', 'natural expression', 'accurate target structure'],
            SkillSet::READING => ['main idea', 'supporting detail', 'inference'],
            SkillSet::WRITING => ['accuracy', 'coherence', 'uses source knowledge'],
            SkillSet::GRAMMAR => ['correct structure', 'complete sentence', 'natural usage'],
            default => ['meaning accuracy', 'example quality', 'context usage'],
        };
    }

    private function keywords(array $item): array
    {
        $text = strtolower(implode(' ', [
            $item['title'] ?? '',
            $item['content'] ?? '',
            implode(' ', $item['examples'] ?? []),
            implode(' ', $item['tags'] ?? []),
        ]));

        $words = preg_split('/[^\p{L}\p{N}]+/u', $text) ?: [];
        $words = array_values(array_unique(array_filter($words, fn (string $word): bool => strlen($word) > 3)));

        return array_slice($words, 0, 16);
    }

    private function shuffle(array $items): array
    {
        shuffle($items);
        return $items;
    }
}
