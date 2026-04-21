<?php
header('Content-Type: application/json; charset=utf-8');

$baseDir = realpath(__DIR__ . '/..');
$userDir = $baseDir . '/user_data';
if (!is_dir($userDir)) {
    mkdir($userDir, 0777, true);
}

$filePath = $userDir . '/grammar.txt';
if (file_exists($filePath)) {
    $content = file_get_contents($filePath);
} else {
    $content = "Thì hiện tại đơn: S + V(s/es)\nThì quá khứ đơn: S + V-ed\nBe going to: S + be + going to V\nTừ ghép: look forward to, break down, give up";
}

echo json_encode(['success' => true, 'content' => $content], JSON_UNESCAPED_UNICODE);
