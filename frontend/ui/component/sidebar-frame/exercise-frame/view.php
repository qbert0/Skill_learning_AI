<section class="sidebar-exercise-frame" aria-label="<?php echo htmlspecialchars($frame->title(), ENT_QUOTES, 'UTF-8'); ?>">
    <details class="sidebar-practice-panel">
        <summary
            class="sidebar-practice-toggle"
            data-practice-panel-toggle
            title="<?php echo htmlspecialchars($frame->panelLabel(), ENT_QUOTES, 'UTF-8'); ?>"
        >
            <?php echo app_icon($frame->panelIcon()); ?>
            <span><?php echo htmlspecialchars($frame->panelLabel(), ENT_QUOTES, 'UTF-8'); ?></span>
            <span class="sidebar-practice-chevron" aria-hidden="true"><?php echo app_icon('chevronRight'); ?></span>
        </summary>
        <div class="practice-subnav" aria-label="<?php echo htmlspecialchars($frame->panelLabel(), ENT_QUOTES, 'UTF-8'); ?>">
            <?php foreach ($frame->items() as $item): ?>
                <?php require __DIR__ . '/item.php'; ?>
            <?php endforeach; ?>
        </div>
    </details>
</section>
