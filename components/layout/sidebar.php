<?php require_once __DIR__ . '/../shared/icon-button.php'; ?>
<aside id="sidebar" class="sidebar">
    <section class="workspace-bar">
        <div class="workspace-identity">
            <div id="workspaceAvatar" class="workspace-avatar">E</div>
            <button id="workspaceMenuBtn" class="workspace-name" type="button" title="Chọn không gian học">
                <span id="workspaceNameLabel">English</span>
                <?php echo app_icon('chevron-down'); ?>
            </button>
            <?php echo app_icon_button('workspace-rename', ['id' => 'renameWorkspaceBtn']); ?>
        </div>
        <?php echo app_icon_button('sidebar-toggle', ['id' => 'sidebarToggle']); ?>
    </section>

    <div class="sidebar-scroll">
        <?php require __DIR__ . '/../cards/learning-pages-panel.php'; ?>

        <nav class="nav-tabs">
            <button class="nav-item active" data-view="knowledge" title="Kho kiến thức"><?php echo app_icon('library'); ?> <span>Kho kiến thức</span></button>
            <button class="nav-item" data-view="practice" title="Luyện tập"><?php echo app_icon('practice'); ?> <span>Luyện tập</span></button>
            <div class="practice-subnav" aria-label="Đi nhanh tới kỹ năng luyện tập">
                <button type="button" data-practice-skill="Grammar"><?php echo app_icon('grammar'); ?><span>Ngữ pháp</span></button>
                <button type="button" data-practice-skill="Vocabulary"><?php echo app_icon('vocabulary'); ?><span>Từ vựng</span></button>
                <button type="button" data-practice-skill="Listening"><?php echo app_icon('listening'); ?><span>Nghe</span></button>
                <button type="button" data-practice-skill="Writing"><?php echo app_icon('writing'); ?><span>Viết</span></button>
                <button type="button" data-practice-skill="Speaking"><?php echo app_icon('speaking'); ?><span>Nói</span></button>
                <button type="button" data-practice-skill="Reading"><?php echo app_icon('reading'); ?><span>Đọc</span></button>
            </div>
            <button class="nav-item" data-view="analysis" title="Phân tích lỗi"><?php echo app_icon('analysis'); ?> <span>Phân tích lỗi</span></button>
            <button class="nav-item" data-view="tests" title="Bài kiểm tra"><?php echo app_icon('check'); ?> <span>Bài kiểm tra</span></button>
        </nav>
    </div>

    <div class="sidebar-footer">
        <?php echo app_icon_button('settings', ['id' => 'settingsBtn', 'class' => 'settings-button']); ?>
        <small id="saveStatus">Sẵn sàng</small>
    </div>
    <div id="sidebarResizeHandle" class="sidebar-resize-handle" role="separator" aria-orientation="vertical" title="Kéo để đổi chiều rộng sidebar"></div>
</aside>

<div id="workspaceMenu" class="workspace-menu hidden" role="dialog" aria-label="Chọn không gian học">
    <div id="workspaceMenuList" class="workspace-menu-list"></div>
    <div class="workspace-create-row">
        <input id="newWorkspaceNameInput" type="text" placeholder="Tên không gian học mới">
        <?php echo app_icon_button('add', ['id' => 'newWorkspaceBtn', 'title' => 'Tạo không gian học']); ?>
    </div>
</div>
