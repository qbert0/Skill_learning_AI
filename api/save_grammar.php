<?php
header('Content-Type: application/json; charset=utf-8');

$baseDir = realpath(__DIR__ . '/..');
$userDir = $baseDir . '/user_data';
if (!is_dir($userDir)) {
    mkdir($userDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['content'])) {
    echo json_encode(['success' => false, 'message' => 'Yêu cầu không hợp lệ.']);
    exit;
}

$content = $_POST['content'];
$filePath = $userDir . '/grammar.txt';
$result = file_put_contents($filePath, $content);
if ($result === false) {
    echo json_encode(['success' => false, 'message' => 'Không thể ghi file ngữ pháp.']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Đã lưu ngữ pháp thành công.'], JSON_UNESCAPED_UNICODE);
