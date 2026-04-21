<?php
declare(strict_types=1);

namespace App\AI;

final class AiClient
{
    private AiModelRegistry $models;

    public function __construct(AiModelRegistry $models)
    {
        $this->models = $models;
    }

    public function complete(array $messages, string $modelId = 'local-rule-based'): array
    {
        $model = $this->models->get($modelId);

        if ($model['provider'] === 'local') {
            return [
                'provider' => 'local',
                'model' => $model['id'],
                'content' => $this->localResponse($messages),
            ];
        }

        return [
            'provider' => $model['provider'],
            'model' => $model['id'],
            'content' => 'External AI provider is not configured yet. Add the HTTP call inside modules/AI/AiClient.php.',
        ];
    }

    private function localResponse(array $messages): string
    {
        $last = end($messages);
        $content = is_array($last) ? (string)($last['content'] ?? '') : '';

        if (strpos(strtolower($content), 'grade') !== false) {
            return 'Score the answer by relevance, completeness, and use of the source knowledge.';
        }

        return 'Create focused practice questions from the user knowledge base.';
    }
}
