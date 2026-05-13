<?php require_once __DIR__ . '/../../../../shared/icon-button.php'; ?>
<section class="learning-pages-panel">
    <div class="sidebar-section-title" data-root-page-drop title="Thả trang học vào đây để đưa ra ngoài cùng">
        <span>Trang học trong không gian này</span>
        <?php echo app_icon_button('add', ['id' => 'newPageBtn', 'title' => 'Thêm trang học']); ?>
    </div>
    <div id="pageList" class="page-tree"></div>
    <div id="learningPagesResizeHandle" class="learning-pages-resize-handle" role="separator" aria-orientation="horizontal" title="Kéo để đổi chiều cao khung trang học"></div>
</section>
