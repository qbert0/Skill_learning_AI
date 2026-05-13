<section id="practice" class="view">
    <article id="practiceListPanel" class="panel practice-page-panel">
        <div class="panel-heading">
            <div class="practice-heading-copy">
                <h3 id="exerciseListTitle">Bài tập theo kỹ năng</h3>
                <p id="practiceSkillMeta" class="practice-panel-note">Chọn một kỹ năng để xem bài tập và dạng câu hỏi đã đăng ký.</p>
            </div>
            <button id="createExercisePlusBtn" class="btn btn-icon" type="button" title="Thêm bài tập mới">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>

        <details class="practice-type-dropdown" open>
            <summary>
                <span>Dạng bài tập đã đăng ký</span>
                <strong id="practiceTypeCount">0 dạng</strong>
            </summary>
            <div id="practiceTypeCatalog" class="practice-type-catalog"></div>
        </details>

        <div id="practiceAccordions" class="accordion-list"></div>
    </article>

    <article id="exerciseCreationPanel" class="panel practice-page-panel hidden">
        <div class="panel-heading">
            <div class="practice-heading-copy">
                <h3>Tạo bài tập mới</h3>
            </div>
            <button id="cancelExerciseCreationBtn" class="btn btn-secondary" type="button">Quay lại danh sách</button>
        </div>

        <form id="exerciseCreationForm">
            <div class="practice-card creation-overview-card">
                <div class="creation-mode-switch" role="tablist" aria-label="Chế độ tạo bài">
                    <button class="creation-mode-btn active" id="creationModeManualBtn" type="button" data-creation-mode="manual">Điền tay</button>
                    <button class="creation-mode-btn" id="creationModeAiBtn" type="button" data-creation-mode="ai">Dán văn bản</button>
                </div>

                <div class="creation-overview-grid">
                    <label class="form-group" for="creationSkillSelect">Kỹ năng
                        <select id="creationSkillSelect" required>
                            <option value="">-- Chọn kỹ năng --</option>
                        </select>
                    </label>

                    <label class="form-group" for="creationTitleInput">Tên bài tập *
                        <input id="creationTitleInput" type="text" placeholder="Ví dụ: Bài 1 - Present simple review" required>
                    </label>

                    <label class="form-group" for="creationDurationInput">Thời gian làm bài
                        <input id="creationDurationInput" type="number" min="1" step="1" placeholder="Để trống nếu không giới hạn">
                    </label>

                    <label class="form-group" for="creationTypeSelect">Dạng bài
                        <select id="creationTypeSelect"></select>
                    </label>
                </div>

                <label class="form-group" for="creationPromptInput">Ghi chú
                    <textarea id="creationPromptInput" rows="2" placeholder="Tùy chọn"></textarea>
                </label>
            </div>

            <div id="creationAiPanel" class="practice-card creation-ai-panel hidden">
                <label class="form-group" for="creationAiInput">
                    <span>Văn bản nguồn</span>
                    <textarea id="creationAiInput" rows="8" placeholder="Dán mỗi dòng một câu hoặc một mục câu hỏi. Ví dụ: She ___ to school every day."></textarea>
                </label>
            </div>

            <div id="manualQuestionBuilder" class="manual-question-builder practice-card">
                <div class="panel-heading compact-heading">
                    <div class="practice-heading-copy">
                        <h4>Form câu hỏi</h4>
                    </div>
                    <button id="addManualQuestionBtn" class="btn btn-secondary" type="button">Thêm câu</button>
                </div>
                <div id="manualQuestionList" class="manual-question-list"></div>
            </div>

            <section id="creationAiActivity" class="practice-card creation-activity hidden" aria-live="polite">
                <div class="creation-activity-header">
                    <div class="creation-activity-indicator">
                        <span class="creation-spinner" aria-hidden="true"></span>
                        <strong id="creationAiActivityTitle">AI đang xử lý</strong>
                    </div>
                    <span id="creationAiActivityPhase" class="creation-activity-phase">Đang chờ</span>
                </div>
                <div id="creationAiActivityLog" class="creation-activity-log"></div>
            </section>

            <div class="form-actions">
                <button id="fillExerciseAnswersBtn" class="btn btn-secondary" type="button">AI điền đáp án</button>
                <button id="submitExerciseCreationBtn" class="btn btn-primary" type="submit">Tạo bài tập</button>
            </div>
        </form>
    </article>

    <article id="exerciseRunner" class="panel practice-page-panel hidden">
        <div class="panel-heading">
            <div class="practice-heading-copy">
                <h3 id="runnerTitle">Bài tập</h3>
                <p id="runnerMeta" class="practice-panel-note">Trang làm bài tập riêng, dùng tối đa chiều rộng content và không chia cột.</p>
            </div>
            <div class="runner-toolbar">
                <div id="runnerTimer" class="runner-timer hidden"></div>
                <button id="closeRunnerBtn" class="btn btn-secondary" type="button">Quay lại danh sách</button>
            </div>
        </div>
        <div id="runnerBody"></div>
        <div class="runner-actions">
            <button id="submitExerciseBtn" class="btn btn-primary" type="button">Nộp bài</button>
            <button id="resetAttemptBtn" class="btn btn-secondary" type="button">Làm lại</button>
        </div>
    </article>

    <article id="exerciseReviewPanel" class="panel practice-page-panel hidden">
        <div class="panel-heading">
            <div class="practice-heading-copy">
                <h3 id="reviewTitle">Review bài tập</h3>
                <p class="practice-panel-note">Xem lại lần làm gần nhất, điểm số, đáp án và giải thích tương ứng.</p>
            </div>
            <div class="runner-toolbar">
                <button id="reviewRetryBtn" class="btn btn-secondary" type="button">Làm lại bài</button>
                <button id="closeReviewBtn" class="btn btn-secondary" type="button">Quay lại danh sách</button>
            </div>
        </div>
        <div id="reviewBody"></div>
    </article>
</section>
