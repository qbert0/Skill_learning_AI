<?php
declare(strict_types=1);

define('APP_ROOT', realpath(__DIR__ . '/..'));
define('USER_DATA_DIR', APP_ROOT . DIRECTORY_SEPARATOR . 'user_data');

loadEnvFile(APP_ROOT . DIRECTORY_SEPARATOR . '.env');

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }

    $relativeClass = substr($class, strlen($prefix));
    $parts = explode('\\', $relativeClass);
    $module = array_shift($parts);
    $folderMap = [
        'AI' => 'ai',
        'Domain' => 'domain',
        'Exercises' => 'exercises',
        'Grading' => 'grading',
        'Storage' => 'storage',
    ];

    if (!isset($folderMap[$module])) {
        return;
    }

    $file = APP_ROOT . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . $folderMap[$module];
    if ($parts) {
        $file .= DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $parts);
    }
    $file .= '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

if (!is_dir(USER_DATA_DIR)) {
    mkdir(USER_DATA_DIR, 0777, true);
}

function loadEnvFile(string $path): void
{
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || strpos($trimmed, '#') === 0) {
            continue;
        }

        $separator = strpos($trimmed, '=');
        if ($separator === false) {
            continue;
        }

        $key = trim(substr($trimmed, 0, $separator));
        $value = trim(substr($trimmed, $separator + 1));
        if ($key === '') {
            continue;
        }

        if (
            strlen($value) >= 2
            && (($value[0] === '"' && $value[strlen($value) - 1] === '"') || ($value[0] === "'" && $value[strlen($value) - 1] === "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        putenv($key . '=' . $value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

function envValue(string $key, ?string $default = null): ?string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    if ($value === false || $value === null || $value === '') {
        return $default;
    }

    return (string)$value;
}

function serverAiRuntime(array $overrides = []): array
{
    $provider = trim((string)($overrides['provider'] ?? envValue('AI_PROVIDER', 'openrouter')));
    $providerKey = strtoupper(preg_replace('/[^A-Za-z0-9]+/', '_', $provider) ?: 'OPENROUTER');
    $defaultEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
    if ($provider === 'claude') {
        $defaultEndpoint = 'https://api.anthropic.com/v1/messages';
    } elseif ($provider === 'gemini') {
        $defaultEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    $defaultModel = 'openrouter/auto';
    if ($provider === 'claude') {
        $defaultModel = 'claude-sonnet-4-5';
    } elseif ($provider === 'gemini') {
        $defaultModel = 'gemini-flash-latest';
    }

    return [
        'provider' => $provider,
        'apiKey' => trim((string)($overrides['apiKey'] ?? envValue('AI_API_KEY', envValue($providerKey . '_API_KEY', '')))),
        'endpoint' => trim((string)($overrides['endpoint'] ?? envValue('AI_ENDPOINT', $defaultEndpoint))),
        'model' => trim((string)($overrides['model'] ?? envValue('AI_MODEL', $defaultModel))),
        'maxTokens' => max(64, (int)($overrides['maxTokens'] ?? envValue('AI_MAX_TOKENS', '1200'))),
        'systemPrompt' => trim((string)($overrides['systemPrompt'] ?? envValue('AI_SYSTEM_PROMPT', 'Bạn là trợ lý tiếng Anh cho người Việt. Khi được yêu cầu trả JSON thì chỉ trả JSON hợp lệ.'))),
        'responseMode' => trim((string)($overrides['responseMode'] ?? envValue('AI_RESPONSE_MODE', 'json_schema'))),
        'responseSchema' => is_array($overrides['responseSchema'] ?? null) ? $overrides['responseSchema'] : null,
        'siteUrl' => trim((string)envValue('AI_SITE_URL', 'http://localhost')),
        'appName' => trim((string)envValue('AI_APP_NAME', 'English Studio')),
    ];
}

function clientAiRuntime(): array
{
    $runtime = serverAiRuntime();

    return [
        'configured' => $runtime['apiKey'] !== '',
        'provider' => $runtime['provider'],
        'endpoint' => $runtime['endpoint'],
        'model' => $runtime['model'],
        'maxTokens' => $runtime['maxTokens'],
        'systemPrompt' => $runtime['systemPrompt'],
        'source' => '.env',
    ];
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        sendJson(['success' => false, 'message' => 'Dữ liệu JSON không hợp lệ.'], 400);
    }

    return $data;
}

function sendJson(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
