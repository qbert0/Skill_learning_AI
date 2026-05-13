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

<div id="workspaceMenu" class="workspace-menu hidden" role="dialog" aria-label="Chọn không gian học">
    <div id="workspaceMenuList" class="workspace-menu-list"></div>
    <div class="workspace-create-row">
        <input id="newWorkspaceNameInput" type="text" placeholder="Tên không gian học mới">
        <?php echo app_icon_button('add', ['id' => 'newWorkspaceBtn', 'title' => 'Tạo không gian học']); ?>
    </div>
</div>
