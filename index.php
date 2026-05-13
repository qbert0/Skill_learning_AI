<?php
if (!is_dir(__DIR__ . '/user_data')) {
    mkdir(__DIR__ . '/user_data', 0777, true);
}

require_once __DIR__ . '/frontend/shared/icons.php';
require_once __DIR__ . '/frontend/bootstrap/assets.php';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Language Studio</title>
    <?php foreach (frontend_style_paths() as $stylePath): ?>
        <link rel="stylesheet" href="<?php echo htmlspecialchars($stylePath, ENT_QUOTES, 'UTF-8'); ?>?v=<?php echo FRONTEND_ASSET_VERSION; ?>">
    <?php endforeach; ?>
</head>
<body>
    <?php require __DIR__ . '/frontend/bootstrap/app-shell.php'; ?>

    <?php foreach (frontend_script_paths() as $scriptPath): ?>
        <script src="<?php echo htmlspecialchars($scriptPath, ENT_QUOTES, 'UTF-8'); ?>?v=<?php echo FRONTEND_ASSET_VERSION; ?>"></script>
    <?php endforeach; ?>
</body>
</html>
