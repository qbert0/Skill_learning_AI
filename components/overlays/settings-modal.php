<?php require_once __DIR__ . '/../shared/icon-button.php'; ?>
<div id="settingsModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
    <div class="modal-backdrop" data-close-settings></div>
    <section class="modal-panel">
        <div class="panel-heading">
            <h3 id="settingsTitle">Cài đặt</h3>
            <?php echo app_icon_button('close', ['data' => ['close-settings' => '']]); ?>
        </div>
        <label>Thư mục lưu dữ liệu
            <input id="dataPathInput" type="text" placeholder="user_data/studio">
        </label>
        <p class="settings-help">Ứng dụng sẽ tự tạo các thư mục con: trang-hoc, luyen-tap, phan-tich-loi, bai-tap-tuan.</p>
        <label>Model AI mặc định
            <select id="aiModelInput">
                <option value="local-rule-based">Local rule-based</option>
                <option value="external-chat-model">External chat model</option>
            </select>
        </label>
        <label>Cỡ chữ trang học
            <input id="learningFontSizeInput" type="number" min="10" max="28" step="1" placeholder="14">
        </label>
        <label>Sao lưu / phục hồi toàn bộ dữ liệu JSON
            <textarea id="jsonDataBox" rows="10" spellcheck="false"></textarea>
        </label>
        <div class="button-row">
            <button id="exportBtn" class="btn btn-secondary" type="button">Tạo bản sao JSON</button>
            <button id="importBtn" class="btn btn-secondary" type="button">Phục hồi từ JSON</button>
            <button id="saveSettingsBtn" class="btn btn-primary" type="button">Lưu cài đặt</button>
        </div>
    </section>
</div>
