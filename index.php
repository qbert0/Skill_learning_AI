<?php
if (!is_dir(__DIR__ . '/user_data')) {
    mkdir(__DIR__ . '/user_data', 0777, true);
}

require_once __DIR__ . '/components/shared/icons.php';
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Language Studio</title>
    <link rel="stylesheet" href="/assets/style.css?v=20260419-29">
</head>
<body>
    <?php require __DIR__ . '/components/layout/sidebar.php'; ?>

    <main class="app-shell">
        <header class="topbar">
            <div>
                <p id="workspaceLabel" class="breadcrumb-line">English workspace / knowledge</p>
            </div>
        </header>

        <?php require __DIR__ . '/components/pages/learning-page.php'; ?>
        <?php require __DIR__ . '/components/pages/practice-page.php'; ?>
        <?php require __DIR__ . '/components/pages/status-pages.php'; ?>
    </main>

    <?php require __DIR__ . '/components/overlays/settings-modal.php'; ?>
    <?php require __DIR__ . '/components/overlays/page-menu.php'; ?>

    <script src="/js/components/shared/icon-registry.js?v=20260419-29"></script>
    <script src="/js/components/shared/icon-button-config.js?v=20260419-29"></script>
    <script src="/js/components/shared/icon-button.js?v=20260419-29"></script>
    <script src="/js/components/shared/search-component.js?v=20260419-29"></script>
    <script src="/js/components/shared/accordion-component.js?v=20260419-29"></script>
    <script src="/js/components/cards/page-tree-item.js?v=20260419-29"></script>
    <script src="/js/modules/exercise-ui.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/registry.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/paragraph-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/heading1-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/heading2-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/heading3-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/heading4-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/bulleted-list-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/numbered-list-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/todo-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/toggle-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/page-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/callout-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/quote-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/table-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/divider-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/page-link-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/gallery-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/image-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/video-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/audio-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/code-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/file-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/table-view-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/board-view-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/gallery-view-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/list-view-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/feed-view-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/dashboard-view-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/calendar-view-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/timeline-view-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/map-view-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/vertical-bar-chart-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/horizontal-bar-chart-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/line-chart-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/number-chart-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/inline-equation-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor/plugins/emoji-block.js?v=20260419-29"></script>
    <script src="/js/modules/block-editor.js?v=20260419-29"></script>
    <script src="/js/app.js?v=20260419-29"></script>
</body>
</html>
