<section id="exercise-creation" class="view">
    <article class="panel">
        <div class="panel-heading">
            <h3>Tạo bài tập mới</h3>
        </div>

        <form id="exerciseCreationForm">
            <div class="form-group">
                <label for="creationSkillSelect">Kỹ năng</label>
                <select id="creationSkillSelect" required>
                    <option value="">-- Chọn kỹ năng --</option>
                    <option value="Grammar">Ngữ pháp</option>
                    <option value="Vocabulary">Từ vựng</option>
                    <option value="Listening">Nghe</option>
                    <option value="Writing">Viết</option>
                    <option value="Speaking">Nói</option>
                    <option value="Reading">Đọc</option>
                </select>
            </div>

            <div class="form-group">
                <label for="creationTitleInput">Tên bài tập *</label>
                <input id="creationTitleInput" type="text" placeholder="Ví dụ: Bài 1 - Present simple review" required>
            </div>

            <div class="form-group">
                <label for="creationPromptInput">Đề bài *</label>
                <textarea id="creationPromptInput" rows="12" placeholder="Mỗi dòng là một câu trong bài.&#10;Có thể dùng các định dạng:&#10;- Mỗi dòng riêng = 1 câu hỏi&#10;- Dùng => để chỉ đáp án (nếu có)&#10;- Dùng a), b), c), d) để tạo trắc nghiệm&#10;&#10;VÍ DỤ:&#10;She have gone to school => has&#10;Choose the correct answer:&#10;a) I am&#10;b) I was&#10;c) I have been" required></textarea>
            </div>

            <div class="form-actions">
                <button id="submitExerciseCreationBtn" class="btn btn-primary" type="submit">Tạo bài tập</button>
                <button id="cancelExerciseCreationBtn" class="btn btn-secondary" type="button">Hủy</button>
            </div>
        </form>
    </article>

    <article class="panel" id="exercisePreview" class="hidden">
        <div class="panel-heading">
            <h3>Xem trước</h3>
        </div>
        <div id="previewContent"></div>
    </article>
</section>
