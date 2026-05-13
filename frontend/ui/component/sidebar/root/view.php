<?php require_once __DIR__ . '/../../../../shared/icon-button.php'; ?>
<aside id="sidebar" class="sidebar">
    <?php ui_sidebar_header()->render(); ?>

    <div class="sidebar-scroll">
        <div class="sidebar-frame-stack">
            <?php foreach (ui_sidebar_frames() as $frame): ?>
                <?php $frame->render(['frame' => $frame]); ?>
            <?php endforeach; ?>
        </div>
    </div>

    <?php ui_sidebar_footer()->render(); ?>
    <div id="sidebarResizeHandle" class="sidebar-resize-handle" role="separator" aria-orientation="vertical" title="Kéo để đổi chiều rộng sidebar"></div>
</aside>
