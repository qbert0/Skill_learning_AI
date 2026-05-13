/**
 * History Manager - Quản lý undo/redo cho trang Learning Page
 * Lưu tối đa 20 trạng thái
 */
window.HistoryManager = (() => {
    const MAX_HISTORY = 20;
    let history = [];
    let currentIndex = -1;

    function saveState(title, content) {
        // Xóa tất cả trạng thái sau currentIndex (nếu đã thực hiện undo rồi lại chỉnh sửa)
        if (currentIndex < history.length - 1) {
            history = history.slice(0, currentIndex + 1);
        }

        // Thêm trạng thái mới
        history.push({ title, content });

        // Giới hạn tối đa MAX_HISTORY
        if (history.length > MAX_HISTORY) {
            history.shift();
        } else {
            currentIndex++;
        }
    }

    function canUndo() {
        return currentIndex > 0;
    }

    function canRedo() {
        return currentIndex < history.length - 1;
    }

    function undo() {
        if (!canUndo()) return null;
        currentIndex--;
        return history[currentIndex];
    }

    function redo() {
        if (!canRedo()) return null;
        currentIndex++;
        return history[currentIndex];
    }

    function getCurrentState() {
        if (currentIndex < 0 || currentIndex >= history.length) return null;
        return history[currentIndex];
    }

    function clear() {
        history = [];
        currentIndex = -1;
    }

    function getStats() {
        return {
            total: history.length,
            currentIndex,
            canUndo: canUndo(),
            canRedo: canRedo()
        };
    }

    return { saveState, canUndo, canRedo, undo, redo, getCurrentState, clear, getStats };
})();
