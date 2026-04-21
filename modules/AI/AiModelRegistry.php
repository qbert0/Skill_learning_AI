<?php
declare(strict_types=1);

namespace App\AI;

final class AiModelRegistry
{
    public function all(): array
    {
        return [
            'local-rule-based' => [
                'id' => 'local-rule-based',
                'name' => 'Local rule-based tutor',
                'provider' => 'local',
                'supports' => ['exercise_generation', 'grading', 'feedback'],
                'offline' => true,
            ],
            'external-chat-model' => [
                'id' => 'external-chat-model',
                'name' => 'External chat model',
                'provider' => 'custom_http',
                'supports' => ['exercise_generation', 'grading', 'feedback'],
                'offline' => false,
            ],
        ];
    }

    public function get(string $modelId): array
    {
        $models = $this->all();
        return $models[$modelId] ?? $models['local-rule-based'];
    }
}
