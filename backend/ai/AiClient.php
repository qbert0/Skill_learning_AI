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

    public function complete(array $messages, string $modelId = 'local-rule-based', array $runtime = []): array
    {
        $model = $this->models->get($modelId);

        if ($model['provider'] === 'local') {
            return [
                'provider' => 'local',
                'model' => $model['id'],
                'content' => $this->localResponse($messages),
            ];
        }

        return $this->externalResponse($messages, $model, $runtime);
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

    private function externalResponse(array $messages, array $model, array $runtime): array
    {
        $runtime = \serverAiRuntime($runtime);
        $provider = (string)$runtime['provider'];

        if ($provider === 'openrouter') {
            return $this->openRouterResponse($messages, $runtime);
        }

        if ($provider === 'gemini') {
            return $this->geminiResponse($messages, $runtime);
        }

        if ($provider === 'claude') {
            return $this->claudeResponse($messages, $runtime);
        }

        throw new \RuntimeException('AI provider is not supported.');
    }

    private function openRouterResponse(array $messages, array $runtime): array
    {
        $apiKey = trim((string)($runtime['apiKey'] ?? ''));
        $endpoint = trim((string)($runtime['endpoint'] ?? 'https://openrouter.ai/api/v1/chat/completions'));
        $model = trim((string)($runtime['model'] ?? 'openrouter/auto'));
        $maxTokens = max(64, (int)($runtime['maxTokens'] ?? 1200));

        if ($apiKey === '') {
            throw new \RuntimeException('Thiếu API key trong file .env.');
        }

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'max_tokens' => $maxTokens,
        ];

        $response = $this->postJson($endpoint, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
            'HTTP-Referer: ' . trim((string)($runtime['siteUrl'] ?? 'http://localhost')),
            'X-Title: ' . trim((string)($runtime['appName'] ?? 'English Studio')),
        ], $payload);

        $content = (string)($response['choices'][0]['message']['content'] ?? '');
        if ($content === '' && isset($response['choices'][0]['message']['content']) && is_array($response['choices'][0]['message']['content'])) {
            foreach ($response['choices'][0]['message']['content'] as $block) {
                if (($block['type'] ?? '') === 'text') {
                    $content .= (string)($block['text'] ?? '');
                }
            }
        }

        error_log('[AI raw text] ' . json_encode(trim($content), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return [
            'provider' => 'openrouter',
            'model' => (string)($response['model'] ?? $model),
            'content' => $content,
            'usage' => $response['usage'] ?? [],
        ];
    }

    private function geminiResponse(array $messages, array $runtime): array
    {
        $apiKey = trim((string)($runtime['apiKey'] ?? ''));
        $endpoint = rtrim(trim((string)($runtime['endpoint'] ?? 'https://generativelanguage.googleapis.com/v1beta/models')), '/');
        $model = trim((string)($runtime['model'] ?? 'gemini-flash-latest'));
        $maxTokens = max(64, (int)($runtime['maxTokens'] ?? 1200));
        $responseMode = trim((string)($runtime['responseMode'] ?? 'json_schema'));

        if ($apiKey === '') {
            throw new \RuntimeException('Thiếu API key trong file .env.');
        }

        $systemParts = array();
        $contents = array();

        foreach ($messages as $message) {
            $role = (string)($message['role'] ?? 'user');
            $content = trim((string)($message['content'] ?? ''));
            if ($content === '') {
                continue;
            }

            if ($role === 'system') {
                $systemParts[] = $content;
                continue;
            }

            $contents[] = [
                'role' => $role === 'assistant' ? 'model' : 'user',
                'parts' => [[
                    'text' => $content,
                ]],
            ];
        }

        if (!$contents) {
            $contents[] = [
                'role' => 'user',
                'parts' => [[
                    'text' => 'Hello',
                ]],
            ];
        }

        $payload = [
            'contents' => $contents,
        ];

        if ($systemParts) {
            $payload['systemInstruction'] = [
                'parts' => [[
                    'text' => implode("\n\n", $systemParts),
                ]],
            ];
        }

        $payload['generationConfig'] = [
            'maxOutputTokens' => $maxTokens,
        ];

        if ($responseMode === 'text') {
            $payload['generationConfig']['responseMimeType'] = 'text/plain';
        } else {
            $payload['generationConfig']['responseMimeType'] = 'application/json';
            $payload['generationConfig']['responseSchema'] = is_array($runtime['responseSchema'] ?? null)
                ? $runtime['responseSchema']
                : [
                'type' => 'OBJECT',
                'properties' => [
                    'questions' => [
                        'type' => 'ARRAY',
                        'items' => [
                            'type' => 'OBJECT',
                            'properties' => [
                                'id' => ['type' => 'STRING'],
                                'skill' => ['type' => 'STRING'],
                                'type' => ['type' => 'STRING'],
                                'prompt' => ['type' => 'STRING'],
                                'gradingMode' => ['type' => 'STRING'],
                                'explanation' => ['type' => 'STRING'],
                                'items' => [
                                    'type' => 'ARRAY',
                                    'items' => [
                                        'type' => 'OBJECT',
                                        'properties' => [
                                            'id' => ['type' => 'STRING'],
                                            'prompt' => ['type' => 'STRING'],
                                            'choices' => [
                                                'type' => 'ARRAY',
                                                'items' => ['type' => 'STRING'],
                                            ],
                                            'expected' => ['type' => 'STRING'],
                                            'explanation' => ['type' => 'STRING'],
                                        ],
                                        'required' => ['id', 'prompt', 'choices', 'expected', 'explanation'],
                                    ],
                                ],
                            ],
                            'required' => ['id', 'skill', 'type', 'prompt', 'gradingMode', 'explanation', 'items'],
                        ],
                    ],
                ],
                'required' => ['questions'],
            ];
        }

        $response = $this->postJson($endpoint . '/' . rawurlencode($model) . ':generateContent', [
            'Content-Type: application/json',
            'X-goog-api-key: ' . $apiKey,
        ], $payload);

        $content = '';
        $finishReason = '';
        foreach (($response['candidates'] ?? []) as $candidate) {
            if ($finishReason === '' && isset($candidate['finishReason'])) {
                $finishReason = (string)$candidate['finishReason'];
            }

            foreach (($candidate['content']['parts'] ?? []) as $part) {
                if (isset($part['text'])) {
                    $content .= (string)$part['text'];
                }
            }
        }

        error_log('[AI raw text] ' . json_encode(trim($content), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return [
            'provider' => 'gemini',
            'model' => (string)($response['modelVersion'] ?? $model),
            'content' => $content,
            'usage' => $response['usageMetadata'] ?? [],
            'finishReason' => $finishReason,
            'responseId' => $response['responseId'] ?? null,
        ];
    }

    private function claudeResponse(array $messages, array $runtime): array
    {
        $apiKey = trim((string)($runtime['apiKey'] ?? ''));
        $endpoint = trim((string)($runtime['endpoint'] ?? 'https://api.anthropic.com/v1/messages'));
        $claudeModel = trim((string)($runtime['model'] ?? 'claude-sonnet-4-5'));
        $maxTokens = max(64, (int)($runtime['maxTokens'] ?? 1200));

        if ($apiKey === '') {
            throw new \RuntimeException('Thiếu API key trong file .env.');
        }

        $systemParts = [];
        $conversation = [];

        foreach ($messages as $message) {
            $role = (string)($message['role'] ?? 'user');
            $content = (string)($message['content'] ?? '');
            if ($role === 'system') {
                $systemParts[] = $content;
                continue;
            }
            $conversation[] = [
                'role' => $role === 'assistant' ? 'assistant' : 'user',
                'content' => $content,
            ];
        }

        if (!$conversation) {
            $conversation[] = ['role' => 'user', 'content' => 'Hello'];
        }

        $payload = [
            'model' => $claudeModel,
            'max_tokens' => $maxTokens,
            'messages' => $conversation,
        ];
        if ($systemParts) {
            $payload['system'] = implode("\n\n", $systemParts);
        }

        $response = $this->postJson($endpoint, [
            'Content-Type: application/json',
            'x-api-key: ' . $apiKey,
            'anthropic-version: 2023-06-01',
        ], $payload);

        $content = '';
        foreach (($response['content'] ?? []) as $block) {
            if (($block['type'] ?? '') === 'text') {
                $content .= (string)($block['text'] ?? '');
            }
        }

        error_log('[AI raw text] ' . json_encode(trim($content), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return [
            'provider' => 'claude',
            'model' => (string)($response['model'] ?? $claudeModel),
            'content' => $content,
            'usage' => $response['usage'] ?? [],
        ];
    }

    private function postJson(string $url, array $headers, array $payload): array
    {
        $body = json_encode($payload, JSON_UNESCAPED_UNICODE);
        if ($body === false) {
            throw new \RuntimeException('Failed to encode AI request payload.');
        }

        if (function_exists('curl_init')) {
            $curl = curl_init($url);
            curl_setopt_array($curl, [
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_POSTFIELDS => $body,
                CURLOPT_TIMEOUT => 60,
            ]);
            $result = curl_exec($curl);
            $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
            $error = curl_error($curl);
            curl_close($curl);

            if ($result === false) {
                throw new \RuntimeException($error ?: 'AI request failed.');
            }

            $decoded = json_decode($result, true);
            if ($status >= 400) {
                $message = is_array($decoded) ? (string)($decoded['error']['message'] ?? $decoded['message'] ?? 'AI request failed.') : 'AI request failed.';
                throw new \RuntimeException($message);
            }

            if (!is_array($decoded)) {
                throw new \RuntimeException('AI returned invalid JSON.');
            }

            return $decoded;
        }

        $curlCliPath = $this->curlCliPath();
        if ($curlCliPath !== null) {
            return $this->postJsonWithCurlCli($curlCliPath, $url, $headers, $body);
        }

        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", $headers),
                'content' => $body,
                'timeout' => 60,
                'ignore_errors' => true,
            ],
        ]);

        $streamError = null;
        set_error_handler(function (int $severity, string $message) use (&$streamError): bool {
            $streamError = $message;
            return true;
        });
        $result = file_get_contents($url, false, $context);
        restore_error_handler();

        if ($result === false) {
            throw new \RuntimeException($streamError ?: 'AI request failed.');
        }

        $decoded = json_decode($result, true);
        if (!is_array($decoded)) {
            throw new \RuntimeException('AI returned invalid JSON.');
        }

        if (isset($decoded['error'])) {
            throw new \RuntimeException((string)($decoded['error']['message'] ?? 'AI request failed.'));
        }

        return $decoded;
    }

    private function curlCliPath(): ?string
    {
        $systemRoot = getenv('SystemRoot') ?: getenv('WINDIR') ?: 'C:\\WINDOWS';
        $path = rtrim($systemRoot, '\\/') . DIRECTORY_SEPARATOR . 'System32' . DIRECTORY_SEPARATOR . 'curl.exe';
        return file_exists($path) ? $path : null;
    }

    private function postJsonWithCurlCli(string $curlPath, string $url, array $headers, string $body): array
    {
        if (!function_exists('exec')) {
            throw new \RuntimeException('PHP cannot access cURL extension, curl.exe fallback, or URL streams.');
        }

        $bodyFile = tempnam(sys_get_temp_dir(), 'ai-body-');
        $responseFile = tempnam(sys_get_temp_dir(), 'ai-response-');
        $headerFile = tempnam(sys_get_temp_dir(), 'ai-header-');
        if ($bodyFile === false || $responseFile === false || $headerFile === false) {
            throw new \RuntimeException('Failed to prepare temporary files for AI request.');
        }

        file_put_contents($bodyFile, $body);

        $command = escapeshellarg($curlPath)
            . ' -sS -X POST'
            . ' ' . $this->buildCurlHeaderArgs($headers)
            . ' --data-binary ' . escapeshellarg('@' . $bodyFile)
            . ' -o ' . escapeshellarg($responseFile)
            . ' -D ' . escapeshellarg($headerFile)
            . ' ' . escapeshellarg($url)
            . ' 2>&1';

        $output = [];
        $exitCode = 0;
        exec($command, $output, $exitCode);

        $rawOutput = trim(implode("\n", $output));
        $responseBody = file_exists($responseFile) ? (string)file_get_contents($responseFile) : '';
        $responseHeaders = file_exists($headerFile) ? (string)file_get_contents($headerFile) : '';

        @unlink($bodyFile);
        @unlink($responseFile);
        @unlink($headerFile);

        $stderr = trim($rawOutput);
        $status = $this->extractHttpStatusFromHeaders($responseHeaders);

        if ($status === null && $exitCode !== 0 && $stderr !== '') {
            throw new \RuntimeException($stderr);
        }

        if ($status === null) {
            throw new \RuntimeException($stderr !== '' ? $stderr : 'AI request failed.');
        }

        $decoded = json_decode($responseBody, true);
        if (!is_array($decoded)) {
            throw new \RuntimeException('AI returned invalid JSON.');
        }

        if ($status >= 400) {
            $message = (string)($decoded['error']['message'] ?? $decoded['message'] ?? $stderr ?: 'AI request failed.');
            throw new \RuntimeException($message);
        }

        return $decoded;
    }

    private function buildCurlHeaderArgs(array $headers): string
    {
        $parts = [];
        foreach ($headers as $header) {
            $parts[] = '-H ' . escapeshellarg($header);
        }

        return implode(' ', $parts);
    }

    private function extractHttpStatusFromHeaders(string $headers): ?int
    {
        if ($headers === '') {
            return null;
        }

        preg_match_all('/^HTTP\/\S+\s+(\d{3})/mi', $headers, $matches);
        if (!isset($matches[1]) || !$matches[1]) {
            return null;
        }

        return (int)end($matches[1]);
    }
}
