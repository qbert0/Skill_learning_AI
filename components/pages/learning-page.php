<style>
/* learning-page: layout + block editor UI chỉ dùng cho trang học */
.learning-page-layout {
    position: relative;
    width: calc(100% + 22px);
    min-height: calc(100vh - 72px);
    margin-right: -22px;
    overflow: visible;
    overflow-x: hidden;
    padding: 0 22px 0 0;
}

.markdown-workspace .page-strip-wrap {
    display: none;
}

.markdown-workspace {
    position: relative;
    display: block;
    min-height: 100%;
    padding: 10px 14px 24px;
    background: var(--ivory);
    border: 1px solid var(--border-cream);
    border-radius: 8px;
    box-shadow: 0 0 0 1px rgba(209, 207, 197, 0.32);
    overflow: visible;
}

.page-title-input {
    border: 0;
    border-radius: 0;
    padding: 0;
    background: transparent;
    font-family: "Segoe UI", Arial, system-ui, sans-serif;
    font-size: clamp(28px, 4vw, 46px);
    line-height: 1.1;
}

.page-title-input:focus {
    outline: 0;
}

.rich-editor {
    min-height: 0;
    border: 0;
    border-radius: 0;
    overflow: visible;
    padding: 8px 0 48px;
    background: transparent;
    font-size: var(--learning-font-size, 14px);
    line-height: 1.7;
    outline: 0;
}

.rich-editor:empty::before {
    content: attr(data-placeholder);
    color: var(--stone-gray);
}

.rich-editor h1 {
    margin: 0.7em 0 0.35em;
    line-height: 1.15;
    font-size: 24px;
}

.rich-editor h2 {
    margin: 0.7em 0 0.35em;
    font-size: 20px;
}

.rich-editor h3 {
    margin: 0.65em 0 0.3em;
    font-size: 17px;
}

.rich-editor h4 {
    margin: 0.55em 0 0.25em;
    font-size: 15px;
}

.rich-editor p {
    margin: 0.35em 0;
}

.rich-editor hr {
    border: 0;
    border-top: 1px solid rgba(0,0,0,0.14);
    margin: 18px 0;
}

.rich-editor table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    background: #fff;
}

.rich-editor ul,
.rich-editor ol {
    margin: 0.5em 0;
    padding-left: 24px;
}

.rich-editor details {
    margin: 8px 0;
    padding: 8px 10px;
    border-radius: 8px;
    background: #fff;
    box-shadow: inset 0 0 0 1px var(--border-warm);
}

.rich-editor summary {
    cursor: pointer;
    font-weight: 700;
}

.rich-editor td,
.rich-editor th {
    border: 1px solid rgba(0,0,0,0.12);
    padding: 8px;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
    margin: 12px 0;
}

.gallery-grid article {
    min-height: 100px;
    padding: 12px;
    border: 1px solid var(--border-warm);
    border-radius: 8px;
    background: #fff;
}

.slash-menu,
.table-tools {
    position: absolute;
    z-index: 30;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 8px;
    background: #fff;
    box-shadow: rgba(0,0,0,0.08) 0 12px 32px;
}

.slash-menu {
    width: min(380px, 92%);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 6px;
    padding: 6px;
    max-height: min(420px, 56vh);
    overflow: hidden;
}

.slash-menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 6px 2px;
}

.slash-menu-header strong {
    font-size: 13px;
}

.slash-menu-header span,
.slash-menu-empty {
    color: var(--olive-gray);
    font-size: 12px;
}

.slash-menu-scroll {
    min-height: 0;
    overflow-y: auto;
    padding-right: 2px;
}

.slash-menu-group + .slash-menu-group {
    margin-top: 4px;
}

.slash-menu-group-label {
    display: block;
    padding: 6px 10px 4px;
    color: var(--stone-gray);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.slash-menu-item {
    min-height: 44px;
    width: 100%;
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    align-items: start;
    gap: 10px;
    border: 0;
    border-radius: 6px;
    padding: 6px 10px;
    background: transparent;
    color: var(--near-black);
    text-align: left;
}

.slash-menu-item:hover {
    background: #f6f5f4;
}

.slash-menu-icon {
    padding-top: 2px;
}

.slash-menu-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
}

.slash-menu-copy strong {
    font-size: 13px;
}

.slash-menu-copy span {
    color: var(--olive-gray);
    font-size: 12px;
}

.slash-menu-empty {
    padding: 8px 10px;
}

.table-tools {
    display: flex;
    gap: 4px;
    padding: 5px;
}

.table-tools button {
    min-height: 30px;
    border: 0;
    border-radius: 6px;
    padding: 5px 8px;
    background: var(--sand);
    color: var(--charcoal);
    font-size: 12px;
    font-weight: 700;
}

.page-outline-panel {
    position: fixed;
    top: 58px;
    right: 28px;
    z-index: 6;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 8px;
    width: 12px;
    height: calc(100vh - 78px);
    min-height: 0;
    overflow: hidden;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 999px;
    background: rgba(135, 134, 127, 0.3);
    color: var(--olive-gray);
    transition: width 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.page-outline-toggle {
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border: 0;
    border-radius: 6px;
    padding: 5px 7px;
    background: #eee9dd;
    color: var(--olive-gray);
    font-size: 12px;
    font-weight: 700;
    text-align: left;
    white-space: nowrap;
}

.page-outline-toggle:hover {
    background: #ebe8dd;
    color: var(--near-black);
}

.page-outline-toggle span:last-child {
    color: var(--stone-gray);
    font-weight: 600;
}

.page-outline-panel:hover,
.page-outline-panel.open {
    width: 240px;
    padding: 4px;
    border-radius: 8px;
    border-color: rgba(0,0,0,0.08);
    background: rgba(250, 249, 245, 0.96);
    box-shadow: rgba(0,0,0,0.08) 0 12px 32px;
}

.page-outline-panel:not(:hover):not(.open) .page-outline,
.page-outline-panel:not(:hover):not(.open) .page-outline-toggle span {
    display: none;
}

.page-outline-panel:not(:hover):not(.open) .page-outline-toggle {
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 0;
    border-radius: 999px;
    background: transparent;
}

.page-outline {
    display: grid;
    align-content: start;
    gap: 2px;
    min-height: 0;
    overflow-y: auto;
    padding-right: 2px;
}

.page-outline button {
    min-height: 28px;
    border: 0;
    border-radius: 6px;
    padding: 5px 8px;
    background: transparent;
    color: var(--olive-gray);
    font-size: 12px;
    text-align: left;
}

.page-outline button:hover {
    background: #ebe8dd;
    color: var(--near-black);
}

.page-outline .outline-level-1 { padding-left: 8px; font-weight: 700; }
.page-outline .outline-level-2 { padding-left: 22px; }
.page-outline .outline-level-3 { padding-left: 38px; color: var(--stone-gray); }

.empty-outline {
    padding: 6px 0;
    color: var(--stone-gray);
    font-size: 12px;
}

.page-link-token {
    color: #0075de;
    background: #f2f9ff;
    border-radius: 4px;
    padding: 1px 4px;
    font-weight: 600;
}

.page-strip-wrap {
    display: grid;
    gap: 10px;
    padding-top: 14px;
    border-top: 1px solid var(--border-warm);
}

.page-strip-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    color: var(--olive-gray);
    font-size: 14px;
    font-weight: 700;
}

.page-strip {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 4px 0 12px;
    scrollbar-color: var(--ring) transparent;
}

.page-strip-card {
    flex: 0 0 220px;
    min-height: 86px;
    border: 1px solid var(--border-warm);
    border-radius: 8px;
    padding: 12px;
    background: #fff;
    color: var(--near-black);
    text-align: left;
}

.page-strip-card.active {
    border-color: var(--terracotta);
    box-shadow: 0 0 0 1px rgba(201, 100, 66, 0.24);
}

.page-strip-card strong {
    display: block;
    margin-bottom: 6px;
}

.page-strip-card span {
    color: var(--olive-gray);
    font-size: 12px;
}

@media (max-width: 1120px) {
    .page-outline-panel {
        display: none;
    }
}
</style>
<section id="knowledge" class="view active">
    <div class="learning-page-layout">
        <?php require __DIR__ . '/../editor/block-editor.php'; ?>
        <?php require __DIR__ . '/../editor/page-outline.php'; ?>
    </div>
</section>
