<?php
/**
 * Exercise Item Component
 * Hiển thị một bài tập với menu ba chấm
 * 
 * Props:
 * - exercise: {id, title, skill, questions: [], createdAt}
 * - maxScore: số điểm cao nhất đạt được (nếu có)
 */
?>
<div class="exercise-item" data-exercise-id="<?php echo htmlspecialchars($exercise['id']); ?>">
    <div class="exercise-item-header">
        <div class="exercise-item-info">
            <h4 class="exercise-title"><?php echo htmlspecialchars($exercise['title']); ?></h4>
            <div class="exercise-meta">
                <span class="meta-item"><?php echo count($exercise['questions']); ?> câu</span>
                <?php if (isset($maxScore)): ?>
                    <span class="meta-item">Điểm: <strong><?php echo htmlspecialchars($maxScore); ?></strong></span>
                <?php endif; ?>
            </div>
        </div>
        <div class="exercise-item-actions">
            <button class="btn btn-icon" type="button" data-open-exercise-menu="<?php echo htmlspecialchars($exercise['id']); ?>" title="Thêm tùy chọn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="12" cy="19" r="2"/>
                </svg>
            </button>
            <div class="exercise-menu hidden" data-exercise-menu="<?php echo htmlspecialchars($exercise['id']); ?>">
                <button class="menu-item" type="button" data-run-exercise="<?php echo htmlspecialchars($exercise['id']); ?>">Làm bài</button>
                <button class="menu-item" type="button" data-duplicate-exercise="<?php echo htmlspecialchars($exercise['id']); ?>">Nhân bản</button>
                <button class="menu-item" type="button" data-rename-exercise="<?php echo htmlspecialchars($exercise['id']); ?>">Đổi tên</button>
                <button class="menu-item danger" type="button" data-delete-exercise="<?php echo htmlspecialchars($exercise['id']); ?>">Xóa</button>
            </div>
        </div>
    </div>
</div>
