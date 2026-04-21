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
$decoded = json_decode($content, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['success' => false, 'message' => 'Dữ liệu JSON không hợp lệ.']);
    exit;
}

$filePath = $userDir . '/vocabulary.json';
$result = file_put_contents($filePath, json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
if ($result === false) {
    echo json_encode(['success' => false, 'message' => 'Không thể ghi file từ vựng.']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Đã lưu từ vựng thành công.']);
