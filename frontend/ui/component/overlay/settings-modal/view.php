<?php require_once __DIR__ . '/../../../../shared/icon-button.php'; ?>
<div id="settingsModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
    <div class="modal-backdrop" data-close-settings></div>
    <section class="modal-panel">
        <div class="panel-heading">
            <h3 id="settingsTitle">Cài đặt</h3>
            <?php echo app_icon_button('close', ['data' => ['close-settings' => '']]); ?>
        </div>
        <section class="settings-section">
            <div class="settings-section-head">
                <div>
                    <p class="settings-eyebrow">AI server</p>
                    <h4>Kết nối chấm điểm và điền đáp án</h4>
                </div>
                <span id="aiRuntimeBadge" class="settings-badge">Chưa kiểm tra</span>
            </div>
            <div class="settings-card">
                <p id="aiRuntimeSummary" class="settings-card-title">AI sẽ đọc cấu hình từ file <code>.env</code>.</p>
                <p id="aiRuntimeMeta" class="settings-help">Dán API key của bạn vào <code>.env</code>, frontend sẽ không lưu key nữa.</p>
            </div>
            <div class="settings-grid">
                <label>Model AI mặc định
                    <select id="aiModelInput">
                        <option value="local-rule-based">Local rule-based</option>
                        <option value="external-chat-model">External AI via .env</option>
                    </select>
                </label>
                <label>AI provider
                    <select id="aiProviderInput">
                        <option value="gemini">Google Gemini</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="claude">Claude</option>
                    </select>
                </label>
                <label>Tên model
                    <input id="aiModelNameInput" type="text" placeholder="gemini-flash-latest">
                </label>
                <label>API endpoint
                    <input id="aiEndpointInput" type="text" placeholder="https://generativelanguage.googleapis.com/v1beta/models">
                </label>
                <label>Max tokens
                    <input id="aiMaxTokensInput" type="number" min="64" max="8192" step="1" placeholder="1200">
                </label>
            </div>
            <label>System prompt cho AI
                <textarea id="aiSystemPromptInput" rows="4" spellcheck="false"></textarea>
            </label>
        </section>
        <section class="settings-section">
            <div class="settings-section-head">
                <div>
                    <p class="settings-eyebrow">Storage</p>
                    <h4>Dữ liệu học tập</h4>
                </div>
            </div>
            <label>Thư mục lưu dữ liệu
                <input id="dataPathInput" type="text" placeholder="user_data/studio">
            </label>
            <p class="settings-help">Ứng dụng sẽ tự tạo các thư mục con: trang-hoc, luyen-tap, phan-tich-loi, bai-tap-tuan.</p>
            <label>Cỡ chữ trang học
                <input id="learningFontSizeInput" type="number" min="8" max="32" step="1" placeholder="12">
            </label>
        </section>
        <section class="settings-section">
            <div class="settings-section-head">
                <div>
                    <p class="settings-eyebrow">Backup</p>
                    <h4>Sao lưu / phục hồi</h4>
                </div>
            </div>
            <label>Sao lưu / phục hồi toàn bộ dữ liệu JSON
                <textarea id="jsonDataBox" rows="10" spellcheck="false"></textarea>
            </label>
        </section>
        <div class="button-row">
            <button id="exportBtn" class="btn btn-secondary" type="button">Tạo bản sao JSON</button>
            <button id="importBtn" class="btn btn-secondary" type="button">Phục hồi từ JSON</button>
            <button id="saveSettingsBtn" class="btn btn-primary" type="button">Lưu cài đặt</button>
        </div>
    </section>
</div>
