<section class="sidebar-status-frame" aria-label="<?php echo htmlspecialchars($frame->title(), ENT_QUOTES, 'UTF-8'); ?>">
    <div class="nav-tabs">
        <?php foreach ($frame->items() as $item): ?>
            <?php require __DIR__ . '/item.php'; ?>
        <?php endforeach; ?>
    </div>
</section>
