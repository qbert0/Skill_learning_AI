<?php
declare(strict_types=1);

define('APP_ROOT', realpath(__DIR__ . '/..'));
define('USER_DATA_DIR', APP_ROOT . DIRECTORY_SEPARATOR . 'user_data');

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
        return;
    }

    $relativeClass = substr($class, strlen($prefix));
    $file = APP_ROOT . DIRECTORY_SEPARATOR . 'modules' . DIRECTORY_SEPARATOR
        . str_replace('\\', DIRECTORY_SEPARATOR, $relativeClass) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

if (!is_dir(USER_DATA_DIR)) {
    mkdir(USER_DATA_DIR, 0777, true);
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
