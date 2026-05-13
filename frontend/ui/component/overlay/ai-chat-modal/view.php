<?php require_once __DIR__ . '/../../../../shared/icon-button.php'; ?>
<div id="aiChatModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="aiChatTitle">
    <div class="modal-backdrop" data-close-ai-chat></div>
    <section class="modal-panel ai-chat-modal-panel">
        <div class="panel-heading">
            <div>
                <p class="settings-eyebrow">AI Chat</p>
                <h3 id="aiChatTitle">Hỏi AI trực tiếp</h3>
            </div>
            <?php echo app_icon_button('close', ['data' => ['close-ai-chat' => '']]); ?>
        </div>

        <section class="ai-chat-shell">
            <div id="aiChatMessages" class="ai-chat-messages" aria-live="polite"></div>
            <form id="aiChatForm" class="ai-chat-form">
                <label class="ai-chat-input-wrap" for="aiChatInput">
                    <textarea id="aiChatInput" rows="4" placeholder="Nhập câu hỏi của bạn cho AI..."></textarea>
                </label>
                <div class="ai-chat-actions">
                    <span id="aiChatStatus" class="ai-chat-status">Sẵn sàng</span>
                    <button id="aiChatSendBtn" class="btn btn-primary" type="submit">Gửi câu hỏi</button>
                </div>
            </form>
        </section>
    </section>
</div>
