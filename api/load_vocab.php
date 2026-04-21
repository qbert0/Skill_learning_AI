<?php
header('Content-Type: application/json; charset=utf-8');

$baseDir = realpath(__DIR__ . '/..');
$userDir = $baseDir . '/user_data';
if (!is_dir($userDir)) {
    mkdir($userDir, 0777, true);
}

$filePath = $userDir . '/vocabulary.json';
if (file_exists($filePath)) {
    $content = file_get_contents($filePath);
} else {
    $default = [
        ['word' => 'apple', 'pronunciation' => '/ˈæp.əl/', 'meaning' => 'quả táo', 'example' => 'I eat an apple.'],
        ['word' => 'run', 'pronunciation' => '/rʌn/', 'meaning' => 'chạy', 'example' => 'She runs every morning.'],
        ['word' => 'beautiful', 'pronunciation' => '/ˈbjuː.tɪ.fəl/', 'meaning' => 'xinh đẹp', 'example' => 'The sunset is beautiful.']
    ];
    $content = json_encode($default, JSON_UNESCAPED_UNICODE);
}

echo json_encode(['success' => true, 'content' => $content], JSON_UNESCAPED_UNICODE);
