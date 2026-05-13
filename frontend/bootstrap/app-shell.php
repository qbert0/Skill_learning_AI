<?php
declare(strict_types=1);
require_once __DIR__ . '/../ui/registry.php';
?>
<?php require __DIR__ . '/../ui/component/sidebar/root/view.php'; ?>

<main class="app-shell">
    <?php foreach (ui_content_headers() as $contentHeader): ?>
        <?php $contentHeader->render(); ?>
    <?php endforeach; ?>

    <?php foreach (ui_content_bodies() as $contentBody): ?>
        <?php $contentBody->render(); ?>
    <?php endforeach; ?>
</main>

<?php foreach (ui_overlay_views() as $overlayView): ?>
    <?php $overlayView->render(); ?>
<?php endforeach; ?>
