<?php require_once __DIR__ . '/../shared/icon-button.php'; ?>
<style>
/* learning-pages-panel: khung danh sách trang học trong sidebar */
.learning-pages-panel {
    position: relative;
    height: var(--learning-pages-height);
    min-height: 180px;
    max-height: min(70vh, 720px);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 8px;
    overflow: hidden;
    padding: 10px 6px 10px 0;
    border-top: 1px solid rgba(20, 20, 19, 0.08);
    border-bottom: 1px solid rgba(20, 20, 19, 0.08);
}

.learning-pages-resize-handle {
    position: absolute;
    right: 8px;
    bottom: -4px;
    left: 0;
    height: 8px;
    cursor: row-resize;
    background: transparent;
}

.learning-pages-resize-handle::before {
    content: "";
    position: absolute;
    right: 40%;
    bottom: 3px;
    left: 40%;
    height: 2px;
    border-radius: 999px;
    background: rgba(135, 134, 127, 0.35);
}

.learning-pages-resize-handle:hover::before,
body.learning-pages-resizing .learning-pages-resize-handle::before {
    background: var(--focus);
}

.sidebar-section-title.drag-over {
    border-radius: 7px;
    background: #f2f9ff;
    box-shadow: inset 0 0 0 1px var(--focus);
}

.page-tree {
    min-height: 0;
    display: grid;
    align-content: start;
    gap: 10px;
    grid-auto-rows: max-content;
    overflow-y: auto;
    padding: 2px 3px 4px 0;
    scrollbar-color: var(--ring) transparent;
}

.page-item {
    width: 100%;
    height: 38px;
    min-height: 38px;
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr) 28px 28px;
    align-items: center;
    gap: 3px;
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 5px 4px;
    background: transparent;
    text-align: left;
    font-size: 12px;
}

.page-item.active {
    border-color: var(--terracotta);
    box-shadow: 0 0 0 1px rgba(201, 100, 66, 0.22);
}

.page-item.dragging {
    opacity: 0.45;
}

.page-item.drag-over {
    border-color: var(--focus);
    background: #f2f9ff;
    box-shadow: inset 0 0 0 1px var(--focus);
}

.page-item-main {
    min-width: 0;
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    align-items: center;
    gap: 6px;
    border: 0;
    padding: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    overflow: hidden;
}

.page-title-inline {
    min-width: 0;
    height: 26px;
    border: 0;
    border-radius: 5px;
    padding: 2px 4px;
    background: transparent;
    color: var(--near-black);
    font-size: 12px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
}

.page-title-inline[readonly] {
    cursor: pointer;
}

.page-title-inline:not([readonly]) {
    background: #fff;
    box-shadow: inset 0 0 0 1px var(--focus);
}

.page-title-inline:focus {
    outline: 0;
}

.page-item-more,
.page-item-add,
.page-item-toggle,
.page-item-toggle-placeholder {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: var(--olive-gray);
}

.page-item-toggle-placeholder {
    pointer-events: none;
}

.page-item-more:hover,
.page-item-add:hover,
.page-item-toggle:hover {
    background: #ded6c8;
    color: var(--near-black);
}

.page-item-toggle {
    opacity: 0;
}

.page-item:hover .page-item-toggle,
.page-item-toggle .app-icon {
    opacity: 1;
}

.page-file-icon {
    display: inline-grid;
    place-items: center;
    color: var(--stone-gray);
    font-size: 14px;
}

.page-item-main > span:not(.page-file-icon) {
    display: none;
}

.page-node {
    display: grid;
    align-content: start;
    gap: 3px;
    padding-left: calc(var(--tree-level, 0) * 14px);
}

.page-children {
    display: grid;
    align-content: start;
    gap: 3px;
}

@media (max-width: 640px) {
    .learning-pages-panel {
        --learning-pages-height: 320px;
    }
}
</style>
<section class="learning-pages-panel">
    <div class="sidebar-section-title" data-root-page-drop title="Thả trang học vào đây để đưa ra ngoài cùng">
        <span>Trang học trong không gian này</span>
        <?php echo app_icon_button('add', ['id' => 'newPageBtn', 'title' => 'Thêm trang học']); ?>
    </div>
    <div id="pageList" class="page-tree"></div>
    <div id="learningPagesResizeHandle" class="learning-pages-resize-handle" role="separator" aria-orientation="horizontal" title="Kéo để đổi chiều cao khung trang học"></div>
</section>
