<section id="practice" class="view">
    <article class="panel">
        <div class="panel-heading">
            <h3 id="exerciseListTitle">Bài tập theo kỹ năng</h3>
            <button id="createExercisePlusBtn" class="btn btn-icon" type="button" title="Thêm bài tập mới">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>
        <div id="practiceAccordions" class="accordion-list"></div>
    </article>

    <article id="exerciseRunner" class="panel runner-panel hidden">
        <div class="panel-heading">
            <h3 id="runnerTitle">Bài tập</h3>
            <button id="closeRunnerBtn" class="btn btn-secondary" type="button">Đóng</button>
        </div>
        <div id="runnerBody"></div>
        <div class="runner-actions">
            <button id="submitExerciseBtn" class="btn btn-primary" type="button">Nộp bài</button>
            <button id="resetAttemptBtn" class="btn btn-secondary" type="button">Làm lại</button>
        </div>
        <div id="runnerFeedback" class="feedback-area"></div>
    </article>
</section>
