const SKILLS = ["Grammar", "Vocabulary", "Listening", "Writing", "Speaking", "Reading"];
const SKILL_LABELS = {
    Grammar: "Ngữ pháp",
    Vocabulary: "Từ vựng",
    Listening: "Nghe",
    Writing: "Viết",
    Speaking: "Nói",
    Reading: "Đọc"
};
const VIEW_TITLES = {
    knowledge: "knowledge",
    practice: "practice",
    analysis: "analysis",
    tests: "tests",
    "exercise-creation": "exercise-creation"
};

let studio = createDefaultStudio();
let activeWorkspaceId = "ws-english";
let activePageId = null;
let activeExerciseId = null;
let selectedPracticeSkill = "Grammar";
let pageMenuTargetId = null;
let draggedPageId = null;
const collapsedPageIds = new Set();
const pageHistoryState = new Map();
const SIDEBAR_MIN_WIDTH = 260;
const SIDEBAR_MAX_WIDTH = 560;
const LEARNING_PAGES_MIN_HEIGHT = 180;
const LEARNING_PAGES_MAX_HEIGHT = 720;
function createDefaultStudio() {
    return {
        settings: { dataPath: "user_data/studio", aiModel: "local-rule-based", learningFontSize: 14 },
        workspaces: [{
            id: "ws-english",
            name: "English",
            language: "English",
            pages: [{
                id: "page-intro",
                title: "Present perfect notes",
                folder: "Grammar/Tenses",
                tags: ["grammar", "speaking"],
                markdown: "<h1>Present perfect</h1><p>Use <strong>have/has + V3</strong> for experience without a specific time.</p><hr><p>I have visited Seoul twice.</p>",
                updatedAt: new Date().toISOString()
            }],
            exercises: [],
            attempts: [],
            mistakes: [],
            tests: []
        }]
    };
}

async function api(action, payload = null) {
    const options = payload
        ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
        : { method: "GET" };
    const response = await fetch(`/api/studio.php?action=${action}`, options);
    const result = await response.json();
    if (!response.ok || result.success === false) throw new Error(result.message || `HTTP ${response.status}`);
    return result;
}

async function loadStudio() {
    setStatus("Đang tải dữ liệu...");
    try {
        const result = await api("load");
        studio = normalizeStudio(result.data);
        activeWorkspaceId = studio.settings.activeWorkspaceId || studio.workspaces[0].id;
        selectedPracticeSkill = studio.settings.selectedPracticeSkill || "Grammar";
        setStatus("Đã tải dữ liệu");
    } catch (error) {
        console.error(error);
        setStatus("Dùng dữ liệu mẫu");
    }
    ensureActivePage();
    renderAll();
}

async function saveStudio() {
    studio.settings.activeWorkspaceId = activeWorkspaceId;
    studio.settings.selectedPracticeSkill = selectedPracticeSkill;
    setStatus("Đang lưu...");
    try {
        await api("save", studio);
        setStatus("Đã lưu");
    } catch (error) {
        console.error(error);
        setStatus("Lưu thất bại");
    }
}

function normalizeStudio(data) {
    const base = createDefaultStudio();
    if (!data || typeof data !== "object") return base;
    if (!Array.isArray(data.workspaces)) return base;
    return {
        settings: { ...base.settings, ...(data.settings || {}) },
        workspaces: data.workspaces.map(normalizeWorkspace)
    };
}

function normalizeWorkspace(workspace) {
    return {
        id: workspace.id || makeId("ws"),
        name: workspace.name || workspace.language || "Workspace",
        language: workspace.language || workspace.name || "English",
        pages: normalizePages(Array.isArray(workspace.pages) ? workspace.pages : []),
        exercises: Array.isArray(workspace.exercises) ? workspace.exercises.map(normalizeExercise) : [],
        attempts: Array.isArray(workspace.attempts) ? workspace.attempts : [],
        mistakes: Array.isArray(workspace.mistakes) ? workspace.mistakes : [],
        tests: Array.isArray(workspace.tests) ? workspace.tests : []
    };
}

function normalizeExercise(exercise) {
    return { ...exercise, skill: exercise.skill || "Grammar", questions: Array.isArray(exercise.questions) ? exercise.questions : [] };
}

function normalizePages(pages) {
    const normalized = pages.map(page => ({
        ...page,
        id: page.id || makeId("page"),
        title: page.title || "Untitled",
        folder: normalizeFolder(page.folder),
        parentId: page.parentId || null,
        tags: Array.isArray(page.tags) ? page.tags : [],
        markdown: page.markdown || "",
        updatedAt: page.updatedAt || new Date().toISOString()
    }));

    const pathMap = new Map();
    normalized.forEach(page => {
        const path = getPagePath(page);
        if (!pathMap.has(path)) pathMap.set(path, []);
        pathMap.get(path).push(page);
    });

    normalized.forEach((page, index) => {
        if (page.parentId) return;
        const folder = normalizeFolder(page.folder);
        if (!folder) return;
        const candidates = pathMap.get(folder) || [];
        if (candidates.length === 1) page.parentId = candidates[0].id;
        if (candidates.length > 1) {
            const nearestPrevious = candidates
                .map(candidate => ({ candidate, index: normalized.findIndex(item => item.id === candidate.id) }))
                .filter(item => item.index >= 0 && item.index < index)
                .sort((a, b) => b.index - a.index)[0];
            if (nearestPrevious) page.parentId = nearestPrevious.candidate.id;
        }
    });

    return normalized;
}

function workspace() {
    return studio.workspaces.find(item => item.id === activeWorkspaceId) || studio.workspaces[0];
}

function activePage() {
    return workspace().pages.find(page => page.id === activePageId);
}

function ensureActivePage() {
    const current = workspace();
    if (!current.pages.length) current.pages.push(createPage());
    if (!current.pages.some(page => page.id === activePageId)) activePageId = current.pages[0].id;
}

function createPage(parent = null) {
    return {
        id: makeId("page"),
        title: parent ? "Trang con mới" : "Trang kiến thức mới",
        parentId: parent ? parent.id : null,
        folder: parent ? getPagePath(parent) : "",
        tags: [],
        markdown: "<h1>Trang kiến thức mới</h1><p>Nhập ghi chú tại đây.</p>",
        updatedAt: new Date().toISOString()
    };
}

function renderAll() {
    renderWorkspaceSelect();
    renderHeader();
    renderPages();
    renderPageStrip();
    renderPageOutline();
    renderPractice();
    renderSettings();
}

function renderHeader() {
    const page = activePage();
    const parts = [
        `${workspace().language} workspace`,
        VIEW_TITLES[document.querySelector(".view.active")?.id || "knowledge"],
        ...(page?.folder ? splitPath(page.folder) : []),
        page?.title || ""
    ].filter(Boolean);
    document.getElementById("workspaceLabel").textContent = parts.join(" / ");
}

function renderWorkspaceSelect() {
    const label = document.getElementById("workspaceNameLabel");
    if (label) label.textContent = workspace().name || workspace().language || "Workspace";
    renderWorkspaceMenuList();
    const avatar = document.getElementById("workspaceAvatar");
    if (avatar) avatar.textContent = (workspace().name || workspace().language || "W").trim().slice(0, 1).toUpperCase();
}

function renderWorkspaceMenuList() {
    const target = document.getElementById("workspaceMenuList");
    if (!target) return;
    target.innerHTML = studio.workspaces.map(item => `
        <button class="workspace-menu-item ${item.id === activeWorkspaceId ? "active" : ""}" type="button" data-workspace-menu-id="${item.id}">
            ${item.id === activeWorkspaceId ? IconRegistry.svg("check") : "<span></span>"}
            <input class="workspace-menu-name" type="text" value="${escapeHtml(item.name)}" data-workspace-name-input="${item.id}" readonly aria-label="Tên workspace">
        </button>
    `).join("");
}

function openWorkspaceMenu(anchor = document.getElementById("workspaceMenuBtn")) {
    const menu = document.getElementById("workspaceMenu");
    if (!menu || !anchor) return;
    renderWorkspaceMenuList();
    const rect = anchor.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 8}px`;
    menu.classList.remove("hidden");
}

function closeWorkspaceMenu() {
    document.getElementById("workspaceMenu")?.classList.add("hidden");
}

function renderPages() {
    const pages = workspace().pages;
    const pageList = document.getElementById("pageList");
    pageList.innerHTML = renderPageTree(pages);

    const page = activePage();
    if (!page) return;
    document.getElementById("pageTitleInput").value = page.title;
    setEditorContent(page.markdown || "");
    renderPageOutline();
    renderPageStrip();
    renderHeader();
    syncPageHistory(page);
}

function renderPageTree(pages) {
    if (!pages.length) return '<div class="empty-state">Chưa có trang phù hợp.</div>';
    const allowedIds = new Set(pages.map(page => page.id));
    const roots = pages.filter(page => !page.parentId || !allowedIds.has(page.parentId));
    return roots.map(page => renderPageNode(page, allowedIds, 0)).join("");
}

function renderPageNode(page, allowedIds, level) {
    const children = workspace().pages.filter(item => allowedIds.has(item.id) && item.parentId === page.id);
    const isCollapsed = collapsedPageIds.has(page.id);
    const childrenHtml = children.map(child => renderPageNode(child, allowedIds, level + 1)).join("");
    return PageTreeItemComponent.render({
        page,
        hasChildren: children.length > 0,
        isCollapsed,
        isActive: page.id === activePageId,
        level,
        childrenHtml
    });
}

function getPagePath(page) {
    const parts = [...splitPath(page.folder), page.title].map(part => part.trim()).filter(Boolean);
    return parts.join("/");
}

function normalizeFolder(folder) {
    const parts = splitPath(folder);
    return parts.join("/");
}

function splitPath(path) {
    return String(path || "")
        .split(/[\\/]/)
        .map(part => part.trim())
        .filter(part => part && part.toLowerCase() !== "general");
}

function hasChildPages(page) {
    return workspace().pages.some(item => item.parentId === page.id);
}

function renderPageStrip() {
    const target = document.getElementById("pageStrip");
    if (!target) return;
    target.innerHTML = workspace().pages.map(page => `
        <button class="page-strip-card ${page.id === activePageId ? "active" : ""}" type="button" data-page-id="${page.id}">
            <strong>${escapeHtml(page.title)}</strong>
            <span>${escapeHtml(normalizeFolder(page.folder) || "Trang gốc")}</span>
        </button>
    `).join("");
}

function getPageSnapshot(page = activePage()) {
    if (!page) return null;
    return {
        title: page.title || "",
        markdown: page.markdown || ""
    };
}

function snapshotSignature(snapshot) {
    return JSON.stringify(snapshot || {});
}

function ensurePageHistory(pageId = activePageId) {
    if (!pageId) return null;
    if (!pageHistoryState.has(pageId)) {
        pageHistoryState.set(pageId, {
            undo: [],
            redo: [],
            currentSignature: snapshotSignature(getPageSnapshot(workspace().pages.find(page => page.id === pageId))),
            isApplying: false
        });
    }
    return pageHistoryState.get(pageId);
}

function syncPageHistory(page = activePage()) {
    if (!page) return;
    const state = ensurePageHistory(page.id);
    state.currentSignature = snapshotSignature(getPageSnapshot(page));
}

function rememberActivePageState() {
    const page = activePage();
    if (!page) return;
    const state = ensurePageHistory(page.id);
    if (state.isApplying) return;
    const current = getPageSnapshot(page);
    const signature = snapshotSignature(current);
    if (signature === state.currentSignature) return;
    state.undo.push(JSON.parse(state.currentSignature || "{}"));
    if (state.undo.length > 100) state.undo.shift();
    state.redo = [];
    state.currentSignature = signature;
}

function applyPageSnapshot(snapshot) {
    const page = activePage();
    if (!page || !snapshot) return;
    const state = ensurePageHistory(page.id);
    state.isApplying = true;
    page.title = snapshot.title || "Untitled";
    page.markdown = snapshot.markdown || "";
    page.updatedAt = new Date().toISOString();
    document.getElementById("pageTitleInput").value = page.title;
    setEditorContent(page.markdown);
    renderPageOutline();
    renderPageStrip();
    renderHeader();
    saveStudio().finally(() => {
        state.currentSignature = snapshotSignature(getPageSnapshot(page));
        state.isApplying = false;
    });
}

function undoActivePageChange() {
    const page = activePage();
    if (!page) return false;
    const state = ensurePageHistory(page.id);
    if (!state.undo.length || state.isApplying) return false;
    const current = getPageSnapshot(page);
    const previous = state.undo.pop();
    state.redo.push(current);
    applyPageSnapshot(previous);
    return true;
}

function redoActivePageChange() {
    const page = activePage();
    if (!page) return false;
    const state = ensurePageHistory(page.id);
    if (!state.redo.length || state.isApplying) return false;
    const current = getPageSnapshot(page);
    const next = state.redo.pop();
    state.undo.push(current);
    applyPageSnapshot(next);
    return true;
}

function selectPage(pageId) {
    if (!workspace().pages.some(page => page.id === pageId)) return;
    activePageId = pageId;
    switchView("knowledge");
    renderPages();
    renderPageStrip();
    syncPageHistory();
}

function savePage(shouldRefresh = true) {
    const page = activePage();
    if (!page) return;
    page.title = document.getElementById("pageTitleInput").value.trim() || "Untitled";
    page.folder = normalizeFolder(page.folder);
    page.tags = Array.isArray(page.tags) ? page.tags : [];
    page.markdown = getEditorContent();
    page.updatedAt = new Date().toISOString();
    syncChildFolders(page.id);
    if (shouldRefresh) {
        renderPages();
        renderPageStrip();
    }
    syncPageHistory(page);
    saveStudio();
}

function newPage() {
    const page = createPage();
    workspace().pages.unshift(page);
    activePageId = page.id;
    renderPages();
    renderPageStrip();
    saveStudio();
}

function newChildPage(parentId) {
    const parent = workspace().pages.find(page => page.id === parentId);
    const page = createPage(parent);
    const insertAt = findSubtreeEndIndex(parent);
    workspace().pages.splice(insertAt, 0, page);
    activePageId = page.id;
    renderPages();
    renderPageStrip();
    saveStudio();
}

function duplicatePage(pageId) {
    const source = workspace().pages.find(page => page.id === pageId);
    if (!source) return;
    const copy = { ...source, id: makeId("page"), title: `${source.title} copy`, updatedAt: new Date().toISOString() };
    const index = workspace().pages.findIndex(page => page.id === pageId);
    workspace().pages.splice(index + 1, 0, copy);
    activePageId = copy.id;
    renderPages();
    renderPageStrip();
    saveStudio();
}

function renamePage(pageId) {
    const input = document.querySelector(`[data-page-title-input="${CSS.escape(pageId)}"]`);
    if (!input) return;
    input.readOnly = false;
    input.focus();
    input.select();
}

function pinPage(pageId) {
    const pages = workspace().pages;
    const index = pages.findIndex(page => page.id === pageId);
    if (index <= 0) return;
    const [page] = pages.splice(index, 1);
    pages.unshift(page);
    renderPages();
    renderPageStrip();
    saveStudio();
}

function toggleChildFolder(pageId) {
    const page = workspace().pages.find(item => item.id === pageId);
    if (!page) return;
    if (collapsedPageIds.has(page.id)) {
        collapsedPageIds.delete(page.id);
    } else {
        collapsedPageIds.add(page.id);
    }
    renderPages();
}

function findSubtreeEndIndex(parent) {
    const pages = workspace().pages;
    const parentIndex = pages.findIndex(page => page.id === parent.id);
    let insertAt = parentIndex + 1;
    while (insertAt < pages.length) {
        if (isDescendantOf(pages[insertAt], parent.id)) {
            insertAt += 1;
            continue;
        }
        break;
    }
    return insertAt;
}

function isDescendantOf(page, ancestorId) {
    let current = page;
    while (current?.parentId) {
        if (current.parentId === ancestorId) return true;
        current = workspace().pages.find(item => item.id === current.parentId);
    }
    return false;
}

function collectPageSubtreeIds(pageId, result = new Set()) {
    result.add(pageId);
    workspace().pages
        .filter(page => page.parentId === pageId)
        .forEach(child => collectPageSubtreeIds(child.id, result));
    return result;
}

function movePageInto(draggedId, targetId) {
    if (!draggedId || !targetId || draggedId === targetId) return;
    const pages = workspace().pages;
    const dragged = pages.find(page => page.id === draggedId);
    const target = pages.find(page => page.id === targetId);
    if (!dragged || !target || isDescendantOf(target, dragged.id)) return;

    const subtreeIds = collectPageSubtreeIds(dragged.id);
    const subtree = pages.filter(page => subtreeIds.has(page.id));
    const remaining = pages.filter(page => !subtreeIds.has(page.id));
    const targetIndex = remaining.findIndex(page => page.id === target.id);
    if (targetIndex < 0) return;

    dragged.parentId = target.id;
    dragged.folder = getPagePath(target);
    dragged.updatedAt = new Date().toISOString();
    syncChildFolders(dragged.id);

    remaining.splice(targetIndex + 1, 0, ...subtree);
    workspace().pages = remaining;
    collapsedPageIds.delete(target.id);
    activePageId = dragged.id;
    renderPages();
    renderPageStrip();
    saveStudio();
}

function movePageToRoot(pageId) {
    const pages = workspace().pages;
    const page = pages.find(item => item.id === pageId);
    if (!page) return;
    const subtreeIds = collectPageSubtreeIds(page.id);
    const subtree = pages.filter(item => subtreeIds.has(item.id));
    workspace().pages = [...subtree, ...pages.filter(item => !subtreeIds.has(item.id))];
    page.parentId = null;
    page.folder = "";
    page.updatedAt = new Date().toISOString();
    syncChildFolders(page.id);
    activePageId = page.id;
    renderPages();
    renderPageStrip();
    saveStudio();
}

function commitInlinePageTitle(input) {
    const page = workspace().pages.find(item => item.id === input.dataset.pageTitleInput);
    if (!page) return;
    const title = input.value.trim() || "Untitled";
    input.readOnly = true;
    if (page.title === title) {
        input.value = page.title;
        return;
    }
    page.title = title;
    page.updatedAt = new Date().toISOString();
    syncChildFolders(page.id);
    renderPages();
    renderPageStrip();
    renderHeader();
    saveStudio();
}

function startSidebarResize(startEvent) {
    if (document.body.classList.contains("sidebar-collapsed")) return;
    startEvent.preventDefault();
    const startX = startEvent.clientX;
    const startWidth = document.getElementById("sidebar").getBoundingClientRect().width;

    function resize(moveEvent) {
        const width = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, startWidth + moveEvent.clientX - startX));
        document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
    }

    function stopResize() {
        document.body.classList.remove("sidebar-resizing");
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
    }

    document.body.classList.add("sidebar-resizing");
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
}

function startLearningPagesResize(startEvent) {
    startEvent.preventDefault();
    const panel = document.querySelector(".learning-pages-panel");
    if (!panel) return;
    const startY = startEvent.clientY;
    const startHeight = panel.getBoundingClientRect().height;

    function resize(moveEvent) {
        const viewportMax = Math.floor(window.innerHeight * 0.7);
        const maxHeight = Math.min(LEARNING_PAGES_MAX_HEIGHT, Math.max(LEARNING_PAGES_MIN_HEIGHT, viewportMax));
        const height = Math.min(maxHeight, Math.max(LEARNING_PAGES_MIN_HEIGHT, startHeight + moveEvent.clientY - startY));
        document.documentElement.style.setProperty("--learning-pages-height", `${height}px`);
    }

    function stopResize() {
        document.body.classList.remove("learning-pages-resizing");
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
    }

    document.body.classList.add("learning-pages-resizing");
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
}

function syncChildFolders(parentId) {
    const parent = workspace().pages.find(page => page.id === parentId);
    if (!parent) return;
    workspace().pages
        .filter(page => page.parentId === parent.id)
        .forEach(child => {
            child.folder = getPagePath(parent);
            child.updatedAt = new Date().toISOString();
            syncChildFolders(child.id);
        });
}

function deletePage() {
    deletePageById(activePageId);
}

function deletePageById(pageId) {
    const current = workspace();
    const deleteIds = collectPageSubtreeIds(pageId);
    current.pages = current.pages.filter(page => !deleteIds.has(page.id));
    deleteIds.forEach(id => collapsedPageIds.delete(id));
    if (deleteIds.has(activePageId)) {
        activePageId = null;
        ensureActivePage();
    }
    renderPages();
    renderPageStrip();
    saveStudio();
}

function movePageUp(pageId) {
    const pages = workspace().pages;
    const index = pages.findIndex(page => page.id === pageId);
    if (index <= 0) return;
    [pages[index - 1], pages[index]] = [pages[index], pages[index - 1]];
    renderPages();
    renderPageStrip();
    saveStudio();
}

function openPageMenu(pageId, anchor) {
    pageMenuTargetId = pageId;
    const menu = document.getElementById("pageMenu");
    const rect = anchor.getBoundingClientRect();
    menu.style.left = `${rect.right + 6}px`;
    menu.style.top = `${rect.top}px`;
    menu.classList.remove("hidden");
}

function closePageMenu() {
    document.getElementById("pageMenu").classList.add("hidden");
    pageMenuTargetId = null;
}

function handlePageMenuAction(action) {
    if (!pageMenuTargetId) return;
    if (action === "add-child") newChildPage(pageMenuTargetId);
    if (action === "duplicate") duplicatePage(pageMenuTargetId);
    if (action === "rename") renamePage(pageMenuTargetId);
    if (action === "pin") pinPage(pageMenuTargetId);
    if (action === "move-up") movePageUp(pageMenuTargetId);
    if (action === "delete") deletePageById(pageMenuTargetId);
    closePageMenu();
}

function setEditorContent(content) {
    BlockEditorModule.setContent(content);
}

function renderPageOutline() {
    BlockEditorModule.renderOutline(activePageId);
}

function scrollToOutlineHeading(id) {
    BlockEditorModule.scrollToOutlineHeading(id);
}

function togglePageOutline() {
    BlockEditorModule.toggleOutline();
}

function getEditorContent() {
    return BlockEditorModule.getContent();
}

function markdownToHtml(markdown) {
    return BlockEditorModule.markdownToHtml(markdown);
}

function insertMarkdown(kind) {
    BlockEditorModule.insertBlock(kind, { pages: workspace().pages, activePageId });
    savePage();
}

function buildTableHtml() {
    return BlockEditorModule.buildTableHtml();
}

function buildPageLinkSnippet() {
    return BlockEditorModule.buildPageLinkSnippet({ pages: workspace().pages, activePageId });
}

function insertHtmlAtCursor(html) {
    document.execCommand("insertHTML", false, html);
}

function renderSlashMenu(query = "") {
    return BlockEditorModule.renderSlashMenu(query);
}

function openSlashMenu() {
    BlockEditorModule.openSlashMenu("");
}

function closeSlashMenu() {
    BlockEditorModule.closeSlashMenu();
}

function getCaretRect() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return document.getElementById("markdownEditor").getBoundingClientRect();
    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(false);
    const marker = document.createElement("span");
    marker.textContent = "\u200b";
    range.insertNode(marker);
    const rect = marker.getBoundingClientRect();
    marker.remove();
    return rect;
}

function removeSlashTrigger() {
    BlockEditorModule.removeSlashTrigger();
}

function applySlashCommand(command) {
    removeSlashTrigger();
    insertMarkdown(command);
}

function updateTableTools(target = document.activeElement) {
    BlockEditorModule.updateTableTools(target);
}

function applyTableAction(action) {
    if (!BlockEditorModule.applyTableAction(action)) return;
    savePage();
    renderPageOutline();
    updateTableTools();
}

function applyLiveMarkdownShortcuts() {
    BlockEditorModule.applyLiveMarkdownShortcuts();
}

function placeCaretAtEnd(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function renderPractice() {
    document.getElementById("practiceAccordions").innerHTML = SKILLS.map(renderSkillExerciseAccordion).join("");
}

function renderSkillExerciseAccordion(skill) {
    const label = SKILL_LABELS[skill];
    const exercises = workspace().exercises.filter(exercise => exercise.skill === skill);
    return AccordionComponent.render({
        id: skill,
        title: escapeHtml(label),
        meta: `${exercises.length} bài`,
        open: skill === selectedPracticeSkill,
        className: "skill-accordion",
        action: `data-skill-accordion="${skill}"`,
        body: exercises.length
            ? exercises.map(exercise => renderExerciseSet(exercise, false)).join("")
            : '<div class="empty-state compact">Chưa có bài tập.</div>'
    });
}

function renderExerciseSet(exercise, open = true) {
    return `
        <div class="exercise-item" data-exercise-id="${escapeHtml(exercise.id)}">
            <div class="exercise-item-header">
                <div class="exercise-item-info">
                    <h4 class="exercise-title">${escapeHtml(exercise.title)}</h4>
                    <div class="exercise-meta">
                        <span class="meta-item">${exercise.questions.length} câu</span>
                    </div>
                </div>
                <div class="exercise-item-actions">
                    <button class="btn btn-icon" type="button" data-open-exercise-menu="${escapeHtml(exercise.id)}" title="Thêm tùy chọn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                        </svg>
                    </button>
                    <div class="exercise-menu hidden" data-exercise-menu="${escapeHtml(exercise.id)}">
                        <button class="menu-item" type="button" data-run-exercise="${escapeHtml(exercise.id)}">Làm bài</button>
                        <button class="menu-item" type="button" data-duplicate-exercise="${escapeHtml(exercise.id)}">Nhân bản</button>
                        <button class="menu-item" type="button" data-rename-exercise="${escapeHtml(exercise.id)}">Đổi tên</button>
                        <button class="menu-item danger" type="button" data-delete-exercise="${escapeHtml(exercise.id)}">Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateExerciseSchema({ skill, title, prompt }) {
    const lines = prompt.split("\n").map(line => line.trim()).filter(Boolean);
    const rawQuestions = lines.length > 1 ? lines : prompt.split(/[.;?]+/).map(line => line.trim()).filter(Boolean);
    const questions = rawQuestions.slice(0, 20).map((line, index) => buildQuestionFromLine(line, index, detectQuestionType(skill, line), skill));
    return {
        id: makeId("ex"),
        workspaceId: activeWorkspaceId,
        skill,
        title,
        sourcePrompt: prompt,
        questions: questions.length ? questions : [buildQuestionFromLine(prompt, 0, "short_answer", skill)],
        createdAt: new Date().toISOString()
    };
}

function detectQuestionType(skill, line) {
    const text = line.toLowerCase();
    if (/(a\)|b\)|c\)|d\)|trắc nghiệm|khoanh|chọn đáp án|multiple choice)/.test(text)) return "multiple_choice";
    if (/(đồng nghĩa|synonym|similar)/.test(text)) return "synonym";
    if (/(điền|fill|blank|___|\.\.\.|chỗ trống)/.test(text)) return "fill_blank";
    if (skill === "Writing") return "writing";
    if (skill === "Speaking") return "speaking";
    if (skill === "Listening") return "listening_note";
    return "short_answer";
}

function buildQuestionFromLine(line, index, type, skill) {
    const answerMatch = line.match(/(?:=>|::|đáp án:|answer:)\s*(.+)$/i);
    const expected = answerMatch ? answerMatch[1].trim() : "";
    const cleanPrompt = answerMatch ? line.slice(0, answerMatch.index).trim() : line;
    const choices = extractChoices(cleanPrompt);
    return {
        id: makeId(`q${index}`),
        skill,
        type: choices.length ? "multiple_choice" : type,
        prompt: cleanPrompt || line,
        expected,
        choices,
        explanation: expected ? `Đáp án dự kiến là "${expected}".` : "Cần so sánh với yêu cầu đề bài và kiến thức đã học."
    };
}

function extractChoices(text) {
    const matches = text.match(/[A-D]\)\s*([^A-D]+)/g);
    if (!matches) return [];
    return matches.map(item => item.replace(/^[A-D]\)\s*/, "").trim());
}

function runExercise(id) {
    activeExerciseId = id;
    const exercise = workspace().exercises.find(item => item.id === id);
    if (!exercise) return;
    document.getElementById("exerciseRunner").classList.remove("hidden");
    document.getElementById("runnerTitle").textContent = exercise.title;
    document.getElementById("runnerBody").innerHTML = ExerciseUiRegistry.render(exercise);
    document.getElementById("runnerFeedback").innerHTML = "";
    document.getElementById("exerciseRunner").scrollIntoView({ behavior: "smooth", block: "start" });
}

function submitExercise() {
    const current = workspace();
    const exercise = current.exercises.find(item => item.id === activeExerciseId);
    if (!exercise) return;
    const answers = ExerciseUiRegistry.collectAnswers(document.getElementById("runnerBody"));
    const feedback = exercise.questions.map(question => gradeQuestion(question, answers[question.id] || ""));
    const correct = feedback.filter(item => item.isCorrect).length;
    current.attempts.unshift({
        id: makeId("attempt"),
        exerciseId: exercise.id,
        exerciseTitle: exercise.title,
        skill: exercise.skill,
        score: Math.round(correct / Math.max(1, feedback.length) * 100),
        correct,
        total: feedback.length,
        answers,
        feedback,
        createdAt: new Date().toISOString()
    });
    document.getElementById("runnerFeedback").innerHTML = feedback.map(item => `
        <article class="feedback-card ${item.isCorrect ? "correct" : "wrong"}">
            <strong>${item.isCorrect ? "Đúng" : "Sai"}: ${escapeHtml(item.prompt)}</strong>
            <p>Trả lời: ${escapeHtml(item.answer || "(trống)")}</p>
            <p>Đáp án: ${escapeHtml(item.expected || "Cần AI/giáo viên kiểm tra sâu hơn")}</p>
            <p>${escapeHtml(item.explanation)}</p>
        </article>`).join("");
    saveStudio();
}

function gradeQuestion(question, answer) {
    const expected = question.expected || "";
    const normalizedAnswer = normalizeText(answer);
    const normalizedExpected = normalizeText(expected);
    const isCorrect = expected ? normalizedAnswer === normalizedExpected || normalizedAnswer.includes(normalizedExpected) : answer.trim().length >= 16;
    return {
        questionId: question.id,
        prompt: question.prompt,
        answer,
        expected,
        isCorrect,
        explanation: isCorrect ? "Câu trả lời khớp với đáp án hoặc đủ thông tin theo yêu cầu." : (question.explanation || "Sai vì câu trả lời chưa khớp đáp án dự kiến hoặc còn thiếu ý.")
    };
}

function toggleExerciseMenu(exerciseId) {
    const menu = document.querySelector(`[data-exercise-menu="${exerciseId}"]`);
    if (!menu) return;
    const isHidden = menu.classList.contains("hidden");
    closeAllExerciseMenus();
    if (isHidden) menu.classList.remove("hidden");
}

function closeAllExerciseMenus() {
    document.querySelectorAll(".exercise-menu").forEach(menu => menu.classList.add("hidden"));
}

function renameExercise(exerciseId) {
    const exercise = workspace().exercises.find(item => item.id === exerciseId);
    if (!exercise) return;
    const newName = prompt("Nhập tên bài tập mới:", exercise.title);
    if (newName && newName.trim()) {
        exercise.title = newName.trim();
        renderPractice();
        saveStudio();
    }
}

function createExerciseFromCreationPage() {
    const skill = document.getElementById("creationSkillSelect").value.trim();
    const title = document.getElementById("creationTitleInput").value.trim();
    const prompt = document.getElementById("creationPromptInput").value.trim();
    
    if (!skill) {
        setStatus("Bạn cần chọn kỹ năng.");
        return;
    }
    if (!title) {
        setStatus("Bạn cần nhập tên bài tập.");
        return;
    }
    if (!prompt) {
        setStatus("Bạn cần nhập đề bài.");
        return;
    }
    
    workspace().exercises.unshift(generateExerciseSchema({ skill, title, prompt }));
    document.getElementById("exerciseCreationForm").reset();
    switchView("practice");
    renderPractice();
    saveStudio();
    setStatus("Tạo bài tập thành công!");
}

function renderSettings() {
    applyLearningSettings();
    document.getElementById("dataPathInput").value = normalizeDataFolder(studio.settings.dataPath || "user_data/studio");
    document.getElementById("aiModelInput").value = studio.settings.aiModel || "local-rule-based";
    document.getElementById("learningFontSizeInput").value = normalizeFontSize(studio.settings.learningFontSize);
    document.getElementById("jsonDataBox").value = JSON.stringify(studio, null, 2);
}

function saveSettings() {
    studio.settings.dataPath = normalizeDataFolder(document.getElementById("dataPathInput").value.trim() || "user_data/studio");
    studio.settings.aiModel = document.getElementById("aiModelInput").value;
    studio.settings.learningFontSize = normalizeFontSize(document.getElementById("learningFontSizeInput").value);
    applyLearningSettings();
    renderSettings();
    saveStudio();
}

function applyLearningSettings() {
    const size = normalizeFontSize(studio.settings.learningFontSize);
    studio.settings.learningFontSize = size;
    document.documentElement.style.setProperty("--learning-font-size", `${size}px`);
}

function importJson() {
    try {
        studio = normalizeStudio(JSON.parse(document.getElementById("jsonDataBox").value));
        activeWorkspaceId = studio.workspaces[0].id;
        ensureActivePage();
        renderAll();
        saveStudio();
    } catch {
        setStatus("JSON không hợp lệ.");
    }
}

function newWorkspace() {
    const input = document.getElementById("newWorkspaceNameInput");
    const name = input?.value.trim();
    if (!name) return;
    const ws = { id: makeId("ws"), name, language: name, pages: [createPage()], exercises: [], attempts: [], mistakes: [], tests: [] };
    studio.workspaces.push(ws);
    activeWorkspaceId = ws.id;
    activePageId = ws.pages[0].id;
    if (input) input.value = "";
    renderAll();
    openWorkspaceMenu();
    saveStudio();
}

function renameWorkspace() {
    openWorkspaceMenu();
    requestAnimationFrame(() => {
        const input = document.querySelector(`[data-workspace-name-input="${CSS.escape(activeWorkspaceId)}"]`);
        if (!input) return;
        input.readOnly = false;
        input.focus();
        input.select();
    });
}

function selectWorkspace(workspaceId) {
    activeWorkspaceId = workspaceId;
    activePageId = null;
    ensureActivePage();
    renderAll();
    saveStudio();
}

function commitInlineWorkspaceName(input) {
    const item = studio.workspaces.find(workspace => workspace.id === input.dataset.workspaceNameInput);
    if (!item) return;
    const name = input.value.trim() || "Workspace";
    input.readOnly = true;
    if (item.name === name) {
        input.value = item.name;
        return;
    }
    item.name = name;
    item.language = name;
    renderAll();
    openWorkspaceMenu();
    saveStudio();
}

function switchView(id) {
    document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === id));
    document.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === id));
    renderHeader();
}

function setStatus(text) {
    document.getElementById("saveStatus").textContent = text;
}

function splitTags(value) {
    return String(value).split(",").map(tag => tag.trim()).filter(Boolean);
}

function normalizeDataFolder(value) {
    return String(value || "user_data/studio").trim().replace(/\.json$/i, "") || "user_data/studio";
}

function normalizeFontSize(value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return 14;
    return Math.min(28, Math.max(10, parsed));
}

function makeId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(value) {
    return value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value)) : "chưa rõ";
}

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

function stripHtml(value) {
    const div = document.createElement("div");
    div.innerHTML = value || "";
    return div.innerText || "";
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

document.addEventListener("DOMContentLoaded", () => {
    IconRegistry.replaceTextIcons();
    const practiceButton = document.querySelector('.nav-item[data-view="practice"]');
    if (practiceButton) {
        practiceButton.insertAdjacentHTML("beforeend", `<button class="practice-toggle" type="button" data-practice-toggle title="Thu/mở kỹ năng">${IconRegistry.svg("chevronDown")}</button>`);
    }
    document.getElementById("sidebarToggle").addEventListener("click", () => document.body.classList.toggle("sidebar-collapsed"));
    document.getElementById("workspaceMenuBtn")?.addEventListener("click", event => {
        event.stopPropagation();
        openWorkspaceMenu(event.currentTarget);
    });
    document.getElementById("newWorkspaceBtn")?.addEventListener("click", newWorkspace);
    document.getElementById("newWorkspaceNameInput")?.addEventListener("keydown", event => {
        if (event.key === "Enter") newWorkspace();
    });
    document.getElementById("renameWorkspaceBtn")?.addEventListener("click", event => {
        event.stopPropagation();
        renameWorkspace();
    });
    document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", event => {
        if (event.target.closest("[data-practice-toggle]")) return;
        switchView(button.dataset.view);
    }));
    document.querySelector("[data-practice-toggle]")?.addEventListener("click", event => {
        event.stopPropagation();
        const nav = document.querySelector(".nav-tabs");
        nav?.classList.toggle("practice-collapsed");
        event.currentTarget.innerHTML = IconRegistry.svg(nav?.classList.contains("practice-collapsed") ? "chevronRight" : "chevronDown");
    });
    document.getElementById("settingsBtn").addEventListener("click", () => document.getElementById("settingsModal").classList.remove("hidden"));
    document.querySelectorAll("[data-close-settings]").forEach(item => item.addEventListener("click", () => document.getElementById("settingsModal").classList.add("hidden")));
    document.getElementById("newPageBtn").addEventListener("click", newPage);
    document.getElementById("newPageStripBtn")?.addEventListener("click", newPage);
    document.getElementById("pageOutlineToggle")?.addEventListener("click", togglePageOutline);
    document.getElementById("slashMenu")?.addEventListener("mousedown", event => {
        event.preventDefault();
    });
    document.getElementById("sidebarResizeHandle")?.addEventListener("mousedown", startSidebarResize);
    document.getElementById("learningPagesResizeHandle")?.addEventListener("mousedown", startLearningPagesResize);
    document.getElementById("pageTitleInput").addEventListener("input", () => {
        rememberActivePageState();
        savePage();
    });
    document.getElementById("markdownEditor").addEventListener("input", () => {
        rememberActivePageState();
        applyLiveMarkdownShortcuts();
        updateTableTools();
        renderPageOutline();
        BlockEditorModule.syncSlashMenu();
        savePage(false);
    });
    document.getElementById("markdownEditor").addEventListener("paste", event => {
        rememberActivePageState();
        if (!BlockEditorModule.handlePaste(event)) return;
        updateTableTools();
        renderPageOutline();
        closeSlashMenu();
        savePage(false);
    });
    document.getElementById("markdownEditor").addEventListener("keyup", event => {
        if (event.key === "Escape") closeSlashMenu();
        if (event.key !== "Escape") BlockEditorModule.syncSlashMenu();
        updateTableTools();
    });
    document.getElementById("markdownEditor").addEventListener("click", event => {
        updateTableTools(event.target);
        closeSlashMenu();
    });
    document.getElementById("createExercisePlusBtn")?.addEventListener("click", () => switchView("exercise-creation"));
    document.getElementById("submitExerciseBtn").addEventListener("click", submitExercise);
    document.getElementById("resetAttemptBtn").addEventListener("click", () => runExercise(activeExerciseId));
    document.getElementById("closeRunnerBtn").addEventListener("click", () => document.getElementById("exerciseRunner").classList.add("hidden"));
    document.getElementById("exerciseCreationForm")?.addEventListener("submit", event => {
        event.preventDefault();
        createExerciseFromCreationPage();
    });
    document.getElementById("cancelExerciseCreationBtn")?.addEventListener("click", () => switchView("practice"));
    document.getElementById("exportBtn").addEventListener("click", renderSettings);
    document.getElementById("importBtn").addEventListener("click", importJson);
    document.getElementById("saveSettingsBtn").addEventListener("click", saveSettings);

    document.addEventListener("click", event => {
        const workspaceNameInput = event.target.closest("[data-workspace-name-input]");
        if (workspaceNameInput) {
            if (!workspaceNameInput.readOnly) {
                return;
            }
            if (event.detail <= 1) {
                selectWorkspace(workspaceNameInput.dataset.workspaceNameInput);
                closeWorkspaceMenu();
            }
            return;
        }
        const workspaceMenuItem = event.target.closest("[data-workspace-menu-id]");
        if (workspaceMenuItem) {
            selectWorkspace(workspaceMenuItem.dataset.workspaceMenuId);
            closeWorkspaceMenu();
            return;
        }
        if (!event.target.closest("#workspaceMenu") && !event.target.closest("#workspaceMenuBtn")) {
            closeWorkspaceMenu();
        }

        const menuAction = event.target.closest("[data-page-menu-action]")?.dataset.pageMenuAction;
        if (menuAction) {
            handlePageMenuAction(menuAction);
            return;
        }
        const moreButton = event.target.closest("[data-page-more]");
        if (moreButton) {
            openPageMenu(moreButton.dataset.pageMore, moreButton);
            return;
        }
        if (!event.target.closest("#pageMenu")) closePageMenu();

        const addChildId = event.target.closest("[data-page-add-child]")?.dataset.pageAddChild;
        const pageToggleId = event.target.closest("[data-page-toggle]")?.dataset.pageToggle;
        const titleInput = event.target.closest("[data-page-title-input]");
        const pageId = event.target.closest("[data-page-id]")?.dataset.pageId;
        const accordion = event.target.closest("[data-accordion]");
        const skillAccordion = event.target.closest("[data-skill-accordion]")?.dataset.skillAccordion;
        const runId = event.target.closest("[data-run-exercise]")?.dataset.runExercise;
        const deleteId = event.target.closest("[data-delete-exercise]")?.dataset.deleteExercise;
        const duplicateId = event.target.closest("[data-duplicate-exercise]")?.dataset.duplicateExercise;
        const renameId = event.target.closest("[data-rename-exercise]")?.dataset.renameExercise;
        const openMenuId = event.target.closest("[data-open-exercise-menu]")?.dataset.openExerciseMenu;
        const slashCommand = event.target.closest("[data-slash-command]")?.dataset.slashCommand;
        const tableAction = event.target.closest("[data-table-action]")?.dataset.tableAction;
        const outlineTarget = event.target.closest("[data-outline-target]")?.dataset.outlineTarget;

        if (slashCommand) {
            applySlashCommand(slashCommand);
            return;
        }
        if (tableAction) {
            applyTableAction(tableAction);
            return;
        }
        if (outlineTarget) {
            scrollToOutlineHeading(outlineTarget);
            return;
        }
        if (!event.target.closest("#slashMenu")) closeSlashMenu();

        if (addChildId) {
            newChildPage(addChildId);
            return;
        }
        if (pageToggleId) {
            toggleChildFolder(pageToggleId);
            return;
        }
        if (titleInput) {
            if (titleInput.readOnly) selectPage(titleInput.dataset.pageTitleInput);
            return;
        }
        if (pageId) {
            selectPage(pageId);
            return;
        }
        if (skillAccordion) {
            selectedPracticeSkill = skillAccordion;
            renderPractice();
            saveStudio();
            return;
        }
        if (accordion) AccordionComponent.toggleFromEvent(event);
        if (openMenuId) {
            toggleExerciseMenu(openMenuId);
            return;
        }
        if (runId) {
            closeAllExerciseMenus();
            runExercise(runId);
        }
        if (deleteId) {
            closeAllExerciseMenus();
            workspace().exercises = workspace().exercises.filter(item => item.id !== deleteId);
            renderPractice();
            saveStudio();
        }
        if (duplicateId) {
            closeAllExerciseMenus();
            const item = workspace().exercises.find(exercise => exercise.id === duplicateId);
            if (item) {
                workspace().exercises.unshift({ ...item, id: makeId("ex"), title: `${item.title} (làm lại)`, createdAt: new Date().toISOString() });
                renderPractice();
                saveStudio();
            }
        }
        if (renameId) {
            closeAllExerciseMenus();
            renameExercise(renameId);
            return;
        }
    });

    document.addEventListener("dblclick", event => {
        const titleInput = event.target.closest("[data-page-title-input]");
        if (titleInput) return;
        const workspaceInput = event.target.closest("[data-workspace-name-input]");
        if (workspaceInput) {
            workspaceInput.readOnly = false;
            workspaceInput.focus();
            workspaceInput.select();
        }
    });

    document.addEventListener("keydown", event => {
        const insideLearningEditor = event.target.closest("#knowledge");
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z" && insideLearningEditor) {
            event.preventDefault();
            undoActivePageChange();
            return;
        }
        if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y" && insideLearningEditor)
            || ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z" && insideLearningEditor)) {
            event.preventDefault();
            redoActivePageChange();
            return;
        }

        const workspaceInput = event.target.closest("[data-workspace-name-input]");
        if (workspaceInput && !workspaceInput.readOnly) {
            if (event.key === "Enter") {
                event.preventDefault();
                commitInlineWorkspaceName(workspaceInput);
            }
            if (event.key === "Escape") {
                const item = studio.workspaces.find(workspace => workspace.id === workspaceInput.dataset.workspaceNameInput);
                workspaceInput.value = item?.name || workspaceInput.value;
                workspaceInput.readOnly = true;
            }
            return;
        }

        const titleInput = event.target.closest("[data-page-title-input]");
        if (!titleInput || titleInput.readOnly) return;
        if (event.key === "Enter") {
            event.preventDefault();
            commitInlinePageTitle(titleInput);
        }
        if (event.key === "Escape") {
            const page = workspace().pages.find(item => item.id === titleInput.dataset.pageTitleInput);
            titleInput.value = page?.title || titleInput.value;
            titleInput.readOnly = true;
        }
    });

    document.addEventListener("focusout", event => {
        const workspaceInput = event.target.closest("[data-workspace-name-input]");
        if (workspaceInput && !workspaceInput.readOnly) {
            commitInlineWorkspaceName(workspaceInput);
            return;
        }

        const titleInput = event.target.closest("[data-page-title-input]");
        if (titleInput && !titleInput.readOnly) commitInlinePageTitle(titleInput);
    });

    document.addEventListener("dragstart", event => {
        const item = event.target.closest("[data-page-drag]");
        if (!item) return;
        draggedPageId = item.dataset.pageDrag;
        item.classList.add("dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", draggedPageId);
    });

    document.addEventListener("dragover", event => {
        const rootDrop = event.target.closest("[data-root-page-drop]");
        if (rootDrop && draggedPageId) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            rootDrop.classList.add("drag-over");
            return;
        }
        const target = event.target.closest("[data-page-drop]");
        if (!target || !draggedPageId || target.dataset.pageDrop === draggedPageId) return;
        const targetPage = workspace().pages.find(page => page.id === target.dataset.pageDrop);
        if (!targetPage || isDescendantOf(targetPage, draggedPageId)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        target.classList.add("drag-over");
    });

    document.addEventListener("dragleave", event => {
        event.target.closest("[data-page-drop]")?.classList.remove("drag-over");
        event.target.closest("[data-root-page-drop]")?.classList.remove("drag-over");
    });

    document.addEventListener("drop", event => {
        const rootDrop = event.target.closest("[data-root-page-drop]");
        if (rootDrop && draggedPageId) {
            event.preventDefault();
            rootDrop.classList.remove("drag-over");
            movePageToRoot(draggedPageId);
            draggedPageId = null;
            return;
        }
        const target = event.target.closest("[data-page-drop]");
        if (!target || !draggedPageId) return;
        event.preventDefault();
        document.querySelectorAll(".page-item.drag-over").forEach(item => item.classList.remove("drag-over"));
        movePageInto(draggedPageId, target.dataset.pageDrop);
        draggedPageId = null;
    });

    document.addEventListener("dragend", () => {
        draggedPageId = null;
        document.querySelectorAll(".page-item.dragging, .page-item.drag-over").forEach(item => {
            item.classList.remove("dragging", "drag-over");
        });
        document.querySelectorAll("[data-root-page-drop].drag-over").forEach(item => item.classList.remove("drag-over"));
    });

    loadStudio();
});
