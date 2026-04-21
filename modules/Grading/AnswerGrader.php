<?php
declare(strict_types=1);

namespace App\Grading;

use App\AI\AiClient;
use App\Domain\SkillSet;

final class AnswerGrader
{
    private AiClient $ai;

    public function __construct(AiClient $ai)
    {
        $this->ai = $ai;
    }

    public function grade(array $exercise, array $answers, string $modelId = 'local-rule-based'): array
    {
        $this->ai->complete([
            ['role' => 'system', 'content' => 'Grade language learning answers across five skills.'],
            ['role' => 'user', 'content' => 'Grade exercise answers for ' . ($exercise['language'] ?? 'Unknown')],
        ], $modelId);

        $feedback = [];
        $correctCount = 0;

        foreach (($exercise['questions'] ?? []) as $index => $question) {
            $answer = trim((string)($answers[$question['id']] ?? $answers[$index] ?? ''));
            $result = $this->gradeOne($question, $answer);
            if ($result['isCorrect']) {
                $correctCount++;
            }
            $feedback[] = $result;
        }

        $total = max(1, count($exercise['questions'] ?? []));
        $score = (int)round($correctCount / $total * 100);

        return [
            'score' => $score,
            'correct' => $correctCount,
            'total' => $total,
            'feedback' => $feedback,
            'gradedAt' => gmdate('c'),
        ];
    }

    private function gradeOne(array $question, string $answer): array
    {
        $skill = SkillSet::normalize((string)($question['skill'] ?? SkillSet::VOCABULARY));
        $keywords = array_values($question['keywords'] ?? []);
        $answerLower = strtolower($answer);
        $hits = 0;

        foreach ($keywords as $keyword) {
            if ($keyword !== '' && strpos($answerLower, strtolower((string)$keyword)) !== false) {
                $hits++;
            }
        }

        $minLength = 10;
        if ($skill === SkillSet::SPEAKING || $skill === SkillSet::WRITING) {
            $minLength = 24;
        } elseif ($skill === SkillSet::READING) {
            $minLength = 18;
        } elseif ($skill === SkillSet::LISTENING) {
            $minLength = 8;
        }

        $isCorrect = strlen($answer) >= $minLength && ($hits > 0 || in_array($skill, [
            SkillSet::SPEAKING,
            SkillSet::WRITING,
            SkillSet::READING,
        ], true));

        return [
            'questionId' => $question['id'] ?? null,
            'sourceTitle' => $question['sourceTitle'] ?? '',
            'language' => $question['language'] ?? '',
            'skill' => $skill,
            'prompt' => $question['prompt'] ?? '',
            'answer' => $answer,
            'expected' => $question['expected'] ?? '',
            'score' => $isCorrect ? 100 : 45,
            'isCorrect' => $isCorrect,
            'explanation' => $this->explanation($skill, $isCorrect, $hits, $question),
        ];
    }

    private function explanation(string $skill, bool $isCorrect, int $hits, array $question): string
    {
        if ($isCorrect) {
            if ($skill === SkillSet::LISTENING) {
                return 'Câu trả lời có đủ tín hiệu nghe hiểu và bám chủ đề.';
            }
            if ($skill === SkillSet::SPEAKING) {
                return 'Câu trả lời đủ dài, đúng hướng và có thể dùng để luyện nói.';
            }
            if ($skill === SkillSet::READING) {
                return 'Bạn đã nêu được ý chính hoặc nội dung liên quan.';
            }
            if ($skill === SkillSet::WRITING) {
                return 'Bài viết đủ ý cơ bản và bám kiến thức nguồn.';
            }
            if ($skill === SkillSet::GRAMMAR) {
                return 'Câu trả lời có dấu hiệu áp dụng đúng cấu trúc.';
            }

            return 'Câu trả lời khớp với kiến thức nguồn.';
        }

        $expected = (string)($question['expected'] ?? '');
        return "Cần ôn lại. Gợi ý đúng: $expected";
    }
}
