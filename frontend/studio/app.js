const SKILLS = PracticeSkillRegistry.skillIds();
const SKILL_LABELS = PracticeSkillRegistry.skillLabels();
const VIEW_TITLES = {
    knowledge: "knowledge",
    practice: "practice",
    analysis: "analysis",
    tests: "tests"
};
const CONTENT_BODY_REGISTRY = {
    knowledge: { headerActions: "knowledge-markdown" },
    practice: { headerActions: "practice-skill" },
    analysis: { headerActions: null },
    tests: { headerActions: null }
};
const EXERCISE_QUESTION_FORM_SKILL_PATH = "/markdown/Skill/exercise_question_form.md";

let aiRuntime = createDefaultAiRuntime();
let studio = createDefaultStudio();
let activeWorkspaceId = "ws-english";
let activePageId = null;
let activeExerciseId = null;
let activePracticeAttemptId = null;
let selectedPracticeSkill = "Foundation";
let activePracticeMode = "list";
let creationMode = "manual";
let creationBusy = false;
let aiChatBusy = false;
let aiChatMessages = createDefaultAiChatMessages();
let practiceTimerHandle = null;
let practiceDeadlineAt = null;
let pageMenuTargetId = null;
let draggedPageId = null;
let exerciseQuestionFormSkillTextPromise = null;
const collapsedPageIds = new Set();
const pageHistoryState = new Map();
const SIDEBAR_MIN_WIDTH = 260;
const SIDEBAR_MAX_WIDTH = 560;
const LEARNING_PAGES_MIN_HEIGHT = 180;
const LEARNING_PAGES_MAX_HEIGHT = 720;
function createDefaultStudio() {
    return {
        settings: {
            dataPath: "user_data/studio",
            aiModel: "local-rule-based",
            learningFontSize: 12,
            selectedPracticeSkill: "Foundation",
            aiConfig: defaultAiConfig()
        },
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
    const raw = await response.text();
    let result = null;
    try {
        result = JSON.parse(raw);
    } catch {
        const condensed = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        throw new Error(condensed || `HTTP ${response.status}`);
    }
    if (!response.ok || result.success === false) throw new Error(result.message || `HTTP ${response.status}`);
    return result;
}

async function loadStudio() {
    setStatus("Đang tải dữ liệu...");
    try {
        const result = await api("load");
        aiRuntime = normalizeAiRuntime(result.aiRuntime);
        studio = normalizeStudio(result.data);
        activeWorkspaceId = studio.settings.activeWorkspaceId || studio.workspaces[0].id;
        selectedPracticeSkill = normalizeSkill(studio.settings.selectedPracticeSkill || "Foundation");
        setStatus("Đã tải dữ liệu");
    } catch (error) {
        console.error(error);
        aiRuntime = createDefaultAiRuntime();
        setStatus("Dùng dữ liệu mẫu");
    }
    ensureActivePage();
    renderAll();
    if (window.location.hash) applyRouteFromHash();
    else updateRoute();
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
    const storedAiConfig = sanitizeStoredAiConfig(data.settings?.aiConfig || {});
    return {
        settings: {
            ...base.settings,
            ...(data.settings || {}),
            selectedPracticeSkill: normalizeSkill(data.settings?.selectedPracticeSkill),
            aiConfig: storedAiConfig
        },
        workspaces: data.workspaces.map(normalizeWorkspace)
    };
}

function normalizeAiRuntime(runtime) {
    return {
        ...createDefaultAiRuntime(),
        ...(runtime || {})
    };
}

function createDefaultAiRuntime() {
    return {
        configured: false,
        provider: "gemini",
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
        model: "gemini-flash-latest",
        maxTokens: 1200,
        systemPrompt: "Bạn là trợ lý tiếng Anh cho người Việt. Khi được yêu cầu trả JSON thì chỉ trả JSON hợp lệ.",
        source: ".env"
    };
}

function createDefaultAiChatMessages() {
    return [{
        role: "assistant",
        content: "Mình sẵn sàng trả lời nhanh về ngữ pháp, từ vựng, bài tập hoặc cách dùng AI trong app này."
    }];
}

function defaultExerciseQuestionFormSkillText() {
    return `# Exercise Question Form Skill

Muc tieu: nhan mot list cau hoi va dien vao form tuong ung cua dang bai.

Quy tac chung:
- Luon tra ve JSON hop le.
- Tra ve dung 4 field top-level: "questions", "type", "cau_hoi", "cac_cau".
- "questions" la noi dung list cau hoi nguon.
- "type" la dang bai chung cua ca batch.
- "cau_hoi" la huong dan chung cua dang bai.
- "cac_cau" la mang cau hoi da duoc dien form.
- Moi phan tu trong "cac_cau" phai co: "number", "question", "form".
- Khong them markdown, HTML, code block, hay giai thich ben ngoai JSON.

Khung JSON chung:
{
  "questions": "1. She __ to school everyday.\\n2. He __ football on Sundays.",
  "type": "multiple_choice_blank",
  "cau_hoi": "Chon dap an dung de hoan thanh cac cau sau:",
  "cac_cau": [
    {
      "number": "1",
      "question": "She __ to school everyday.",
      "form": {
        "de_bai": "She ____ to school everyday.",
        "cau_A": "go",
        "cau_B": "goes",
        "cau_C": "going",
        "cau_D": "is go",
        "dap_an": "B",
        "giai_thich": "Chu ngu She o hien tai don nen dung goes."
      }
    }
  ]
}

Quy tac theo dang bai:
- multiple_choice_blank: dien du de_bai, cau_A, cau_B, cau_C, cau_D, dap_an, giai_thich. dap_an chi duoc la A hoac B hoac C hoac D.
- true_false: de_bai la cau hoi, cau_A = "True", cau_B = "False", cau_C rong, cau_D rong, dap_an la A hoac B.
- rewrite_sentence: de_bai la yeu cau viet lai cau, cau_A-D de rong, dap_an la cau viet lai dung, giai_thich ngan gon.
- short_answer: de_bai la cau hoi ngan, cau_A-D de rong, dap_an la cau tra loi mong doi, giai_thich ngan gon.
- listening_dictation: de_bai la cau nghe va viet lai, cau_A-D de rong, dap_an la transcript dung, giai_thich ngan gon.
- sentence_unscramble: de_bai la cac tu/cum tu bi dao thu tu, cau_A-D de rong, dap_an la cau da sap xep dung, giai_thich ngan gon.`;
}

async function loadExerciseQuestionFormSkillText() {
    if (!exerciseQuestionFormSkillTextPromise) {
        exerciseQuestionFormSkillTextPromise = fetch(EXERCISE_QUESTION_FORM_SKILL_PATH)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            })
            .then(text => String(text || "").trim() || defaultExerciseQuestionFormSkillText())
            .catch(error => {
                console.warn("[Exercise form skill fallback]", error);
                return defaultExerciseQuestionFormSkillText();
            });
    }
    return exerciseQuestionFormSkillTextPromise;
}

function normalizeWorkspace(workspace) {
    return {
        id: workspace.id || makeId("ws"),
        name: workspace.name || workspace.language || "Workspace",
        language: workspace.language || workspace.name || "English",
        pages: normalizePages(Array.isArray(workspace.pages) ? workspace.pages : []),
        exercises: Array.isArray(workspace.exercises) ? workspace.exercises.map(normalizeExercise) : [],
        attempts: Array.isArray(workspace.attempts) ? workspace.attempts.map(normalizeAttempt) : [],
        mistakes: Array.isArray(workspace.mistakes) ? workspace.mistakes : [],
        tests: Array.isArray(workspace.tests) ? workspace.tests : []
    };
}

function normalizeSkill(skill) {
    return PracticeSkillRegistry.normalizeSkill(skill);
}

function canCreateExerciseForSkill(skill) {
    return PracticeSkillRegistry.canCreateExercise(skill);
}

function normalizeExercise(exercise) {
    return {
        ...exercise,
        skill: normalizeSkill(exercise.skill),
        durationMinutes: normalizeDuration(exercise.durationMinutes),
        questions: Array.isArray(exercise.questions) ? exercise.questions.map(normalizeQuestion) : []
    };
}

function normalizeAttempt(attempt) {
    return {
        ...attempt,
        id: attempt.id || makeId("attempt"),
        exerciseId: attempt.exerciseId || "",
        exerciseTitle: attempt.exerciseTitle || "",
        skill: normalizeSkill(attempt.skill),
        score: Number.parseInt(attempt.score, 10) || 0,
        correct: Number.parseInt(attempt.correct, 10) || 0,
        total: Number.parseInt(attempt.total, 10) || 0,
        answers: attempt.answers && typeof attempt.answers === "object" ? attempt.answers : {},
        feedback: Array.isArray(attempt.feedback) ? attempt.feedback : [],
        createdAt: attempt.createdAt || new Date().toISOString()
    };
}

function normalizeQuestion(question) {
    const type = normalizeQuestionType(question.type);
    const items = Array.isArray(question.items) && question.items.length
        ? question.items
        : [{
            id: question.itemId || makeId("item"),
            prompt: question.prompt || "",
            expected: question.expected || "",
            choices: Array.isArray(question.choices) ? question.choices : []
        }];
    return {
        ...question,
        id: question.id || makeId("q"),
        type,
        prompt: question.prompt || questionPromptByType(type),
        gradingMode: question.gradingMode || ((items.every(item => item.expected) && items.length) ? "expected" : "auto"),
        items: items.map(item => normalizeQuestionItem(item, type)),
        explanation: question.explanation || questionExplanationByType(type)
    };
}

function normalizeQuestionItem(item, type) {
    const choices = Array.isArray(item.choices) ? item.choices : [];
    return {
        id: item.id || makeId("item"),
        prompt: item.prompt || "",
        expected: item.expected || "",
        explanation: item.explanation || "",
        choices: type === "multiple_choice_blank"
            ? choices.slice(0, 4)
            : (type === "true_false" ? ["True", "False"] : [])
    };
}

function normalizeQuestionType(type) {
    if (type === "multiple_choice" || type === "fill_blank" || type === "synonym") return "multiple_choice_blank";
    if (type === "true_false" || type === "short_answer" || type === "listening_dictation" || type === "sentence_unscramble") return type;
    if (type === "writing" || type === "speaking" || type === "listening_note") return "short_answer";
    if (type === "rewrite_sentence") return "rewrite_sentence";
    return "multiple_choice_blank";
}

function questionPromptByType(type) {
    return PracticeExerciseTypeRegistry.prompt(type);
}

function questionExplanationByType(type) {
    const registryExplanation = PracticeExerciseTypeRegistry.explanation(type);
    if (registryExplanation) return registryExplanation;
    const exerciseType = PracticeSkillRegistry.exerciseTypesForSkill("Foundation").find(item => item.id === type);
    if (exerciseType?.explanation) return exerciseType.explanation;
    return type === "rewrite_sentence" ? "Viết lại câu cho đúng ngữ pháp." : "Chọn đáp án đúng để điền vào chỗ trống.";
}

function normalizeDuration(value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return null;
    return parsed;
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

function defaultAiConfig() {
    return {
        provider: aiRuntime.provider || "gemini",
        endpoint: aiRuntime.endpoint || "https://generativelanguage.googleapis.com/v1beta/models",
        model: aiRuntime.model || "gemini-flash-latest",
        maxTokens: aiRuntime.maxTokens || 1200,
        systemPrompt: aiRuntime.systemPrompt || "Bạn là trợ lý tiếng Anh cho người Việt. Khi được yêu cầu trả JSON thì chỉ trả JSON hợp lệ."
    };
}

function sanitizeStoredAiConfig(config = {}) {
    const defaults = defaultAiConfig();
    return {
        provider: defaults.provider,
        endpoint: defaults.endpoint,
        model: defaults.model,
        maxTokens: Number.parseInt(config.maxTokens, 10) || defaults.maxTokens,
        systemPrompt: String(config.systemPrompt || "").trim() || defaults.systemPrompt
    };
}

function effectiveAiConfig() {
    return sanitizeStoredAiConfig(studio.settings.aiConfig || {});
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

function activeViewId() {
    return document.querySelector(".view.active")?.id || "knowledge";
}

function renderHeader() {
    const page = activePage();
    const activeView = activeViewId();
    const parts = [{ label: `${workspace().language} workspace`, view: "knowledge" }];
    if (activeView === "practice") {
        const practiceExercise = workspace().exercises.find(item => item.id === activeExerciseId) || null;
        parts.push({ label: "practice", view: "practice" });
        parts.push({ label: SKILL_LABELS[selectedPracticeSkill] || selectedPracticeSkill, view: "practice", skill: selectedPracticeSkill });
        parts.push(...PracticeInterfaceRegistry.breadcrumb(activePracticeMode, {
            skill: selectedPracticeSkill,
            skillLabel: SKILL_LABELS[selectedPracticeSkill] || selectedPracticeSkill,
            exercise: practiceExercise
        }));
    } else {
        parts.push({ label: VIEW_TITLES[activeView] || activeView, view: activeView });
        if (activeView === "knowledge") {
            if (page?.folder) splitPath(page.folder).forEach(label => parts.push({ label, view: "knowledge" }));
            if (page?.title) parts.push({ label: page.title, view: "knowledge", pageId: page.id });
        }
    }
    BreadcrumbModule.render(document.getElementById("workspaceLabel"), parts);
    renderContentHeaderActions(activeView);
}

function renderContentHeaderActions(activeView = activeViewId()) {
    const target = document.getElementById("contentHeaderActions");
    if (!target) return;
    const headerActions = CONTENT_BODY_REGISTRY[activeView]?.headerActions;
    if (headerActions === "knowledge-markdown") {
        const mode = BlockEditorModule.currentMode();
        target.innerHTML = `
            <div class="header-toggle-group" role="tablist" aria-label="Chế độ markdown">
                <button class="header-action-btn ${mode === "visual" ? "active" : ""}" type="button" data-header-markdown-mode="visual" aria-pressed="${mode === "visual"}">Dạng đồ họa</button>
                <button class="header-action-btn ${mode === "code" ? "active" : ""}" type="button" data-header-markdown-mode="code" aria-pressed="${mode === "code"}">Dạng mã markdown</button>
                <button class="header-action-btn" type="button" data-open-ai-chat>AI chat</button>
            </div>
        `;
        return;
    }
    if (headerActions === "practice-skill") {
        target.innerHTML = `
            <div class="header-skill-group" data-practice-skill-selector>
                ${SKILLS.map(skill => `
                    <button class="header-action-btn ${selectedPracticeSkill === skill ? "active" : ""}" type="button" data-header-practice-skill="${skill}" data-select-practice-skill="${skill}">
                        ${SKILL_LABELS[skill] || skill}
                    </button>
                `).join("")}
                <button class="header-action-btn" type="button" data-open-ai-chat>AI chat</button>
            </div>
        `;
        return;
    }
    target.innerHTML = '<button class="header-action-btn" type="button" data-open-ai-chat>AI chat</button>';
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
    BlockEditorModule.focusActiveEditor();
    syncPageHistory(page);
}

function syncVisiblePageMeta(page = activePage()) {
    if (!page) return;
    const pageTitleInput = document.getElementById("pageTitleInput");
    if (pageTitleInput && document.activeElement !== pageTitleInput) {
        pageTitleInput.value = page.title;
    }
    document.querySelectorAll("[data-page-title-input]").forEach(input => {
        if (input.dataset.pageTitleInput === page.id) input.value = page.title;
    });
    renderHeader();
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
    return;
}

function getPageSnapshot(page = activePage()) {
    if (!page) return null;
    return {
        title: page.title || "",
        markdown: page.markdown || "",
        caret: getEditorCaretSnapshot()
    };
}

function getPendingPageSnapshot() {
    return {
        title: document.getElementById("pageTitleInput")?.value.trim() || "Untitled",
        markdown: getEditorContent(),
        caret: getEditorCaretSnapshot()
    };
}

function snapshotSignature(snapshot) {
    if (!snapshot) return "{}";
    return JSON.stringify({
        title: snapshot.title || "",
        markdown: snapshot.markdown || ""
    });
}

function getEditorCaretSnapshot() {
    if (BlockEditorModule.currentMode() === "code") {
        const codeEditor = document.getElementById("markdownCodeEditor");
        if (!codeEditor) return null;
        return {
            mode: "code",
            start: codeEditor.selectionStart ?? 0,
            end: codeEditor.selectionEnd ?? 0
        };
    }

    const root = document.getElementById("markdownEditor");
    const selection = window.getSelection();
    if (!root || !selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.startContainer)) return null;
    return {
        mode: "visual",
        path: getNodePath(root, range.startContainer),
        offset: range.startOffset
    };
}

function getNodePath(root, node) {
    const path = [];
    let current = node;
    while (current && current !== root) {
        const parent = current.parentNode;
        if (!parent) break;
        path.unshift([...parent.childNodes].indexOf(current));
        current = parent;
    }
    return path;
}

function resolveNodePath(root, path = []) {
    let current = root;
    for (const index of path) {
        if (!current?.childNodes?.length) break;
        current = current.childNodes[Math.min(index, current.childNodes.length - 1)];
    }
    return current || root;
}

function restoreEditorCaretSnapshot(caret) {
    if (!caret) return;
    if (caret.mode === "code") {
        BlockEditorModule.setMode("code", { focus: false });
        const codeEditor = document.getElementById("markdownCodeEditor");
        if (!codeEditor) return;
        codeEditor.focus();
        codeEditor.setSelectionRange(caret.start || 0, caret.end || caret.start || 0);
        return;
    }

    BlockEditorModule.setMode("visual", { focus: false });
    const root = document.getElementById("markdownEditor");
    if (!root) return;
    let node = resolveNodePath(root, caret.path);
    if (node.nodeType !== Node.TEXT_NODE) {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        node = walker.nextNode() || node;
    }
    const range = document.createRange();
    const maxOffset = node.nodeType === Node.TEXT_NODE ? node.nodeValue.length : node.childNodes.length;
    range.setStart(node, Math.min(caret.offset || 0, maxOffset));
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
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

function rememberActivePageStateLegacy() {
    const page = activePage();
    if (!page) return;
    const state = ensurePageHistory(page.id);
    if (state.isApplying) return;
    const current = getPageSnapshot(page);
    const signature = snapshotSignature(current);
    if (signature === state.currentSignature) return;
    state.undo.push(JSON.parse(state.currentSignature || "{}"));
    // Giá»›i háº¡n tá»‘i Ä‘a 20 láº§n undo (theo yÃªu cáº§u)
    if (state.undo.length > 20) state.undo.shift();
    state.redo = [];
    state.currentSignature = signature;
}

function rememberActivePageState() {
    const page = activePage();
    if (!page) return;
    const state = ensurePageHistory(page.id);
    if (state.isApplying) return;
    const current = getPageSnapshot(page);
    const next = getPendingPageSnapshot();
    const currentSignature = snapshotSignature(current);
    const nextSignature = snapshotSignature(next);
    if (currentSignature === nextSignature) return;
    const lastUndoSignature = snapshotSignature(state.undo[state.undo.length - 1]);
    if (lastUndoSignature !== currentSignature) state.undo.push(current);
    if (state.undo.length > 20) state.undo.shift();
    state.redo = [];
    state.currentSignature = nextSignature;
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
    restoreEditorCaretSnapshot(snapshot.caret);
    renderPageOutline();
    renderPageStrip();
    syncVisiblePageMeta(page);
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
    } else {
        syncVisiblePageMeta(page);
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
    BlockEditorModule.setContent(KnowledgeBlockTransform.normalizeMarkdown(content));
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
    return KnowledgeBlockTransform.normalizeMarkdown(BlockEditorModule.getContent());
}

function markdownToHtml(markdown) {
    return BlockEditorModule.markdownToHtml(markdown);
}

function insertMarkdown(kind) {
    BlockEditorModule.insertBlock(kind, { pages: workspace().pages, activePageId });
    savePage();
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

function togglePracticeSubnav(forceOpen = null) {
    const panel = document.querySelector(".sidebar-practice-panel");
    if (!panel) return;
    if (forceOpen === null) {
        panel.open = !panel.open;
        return;
    }
    panel.open = Boolean(forceOpen);
}

function showPracticeSkill(skill = selectedPracticeSkill) {
    selectedPracticeSkill = normalizeSkill(skill);
    activePracticeMode = "list";
    activeExerciseId = null;
    activePracticeAttemptId = null;
    clearPracticeTimer();
    togglePracticeSubnav(true);
    switchView("practice");
    renderPractice();
    updateRoute();
}

function openPracticeCreation(skill = selectedPracticeSkill) {
    selectedPracticeSkill = normalizeSkill(skill);
    activePracticeMode = "creation";
    activeExerciseId = null;
    activePracticeAttemptId = null;
    clearPracticeTimer();
    togglePracticeSubnav(true);
    switchView("practice");
    renderPractice();
    document.getElementById("creationSkillSelect").value = selectedPracticeSkill;
    updateCreationTypeSelect();
    syncCreationModeUi();
    updateRoute();
}

function getCaretRect() {
    if (BlockEditorModule.currentMode() === "code") {
        return document.getElementById("markdownCodeEditor")?.getBoundingClientRect();
    }
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
    const skillExercises = workspace().exercises.filter(exercise => exercise.skill === selectedPracticeSkill);
    document.getElementById("practiceAccordions").innerHTML = `
        <section class="practice-tree-root">
            ${skillExercises.length
                ? `<div class="practice-exercise-list">${skillExercises.map(exercise => renderExerciseSet(exercise)).join("")}</div>`
                : '<div class="empty-state compact">Chưa có bài tập.</div>'}
        </section>
    `;
    renderPracticeTypeRegistry();
    document.getElementById("practiceSkillMeta").textContent = practiceSkillMeta(skillExercises);
    document.getElementById("practiceListPanel").classList.toggle("hidden", activePracticeMode !== "list");
    document.getElementById("exerciseCreationPanel").classList.toggle("hidden", activePracticeMode !== "creation");
    document.getElementById("exerciseRunner").classList.toggle("hidden", activePracticeMode !== "runner");
    document.getElementById("exerciseReviewPanel").classList.toggle("hidden", activePracticeMode !== "review");
    document.getElementById("exerciseListTitle").textContent = PracticeInterfaceRegistry.title("list", {
        skill: selectedPracticeSkill,
        skillLabel: SKILL_LABELS[selectedPracticeSkill] || selectedPracticeSkill,
        exercise: skillExercises[0] || null
    }) || `Danh sách bài tập - ${SKILL_LABELS[selectedPracticeSkill] || selectedPracticeSkill}`;
    const createButtons = [document.getElementById("createExercisePlusBtn")];
    createButtons.forEach(button => {
        if (!button) return;
        button.disabled = !canCreateExerciseForSkill(selectedPracticeSkill);
        button.title = canCreateExerciseForSkill(selectedPracticeSkill) ? "Thêm bài tập mới" : "Skill này chưa có loại câu hỏi để tạo bài";
    });
    updatePracticeSkillSelector();
    if (activePracticeMode === "creation") {
        updateCreationTypeSelect();
        syncCreationModeUi();
    }
    renderHeader();
}

function practiceSkillMeta(exercises) {
    return `${exercises.length} bài tập`;
}

function renderPracticeTypeRegistry() {
    const registeredTypes = PracticeSkillRegistry.exerciseTypesForSkill(selectedPracticeSkill);
    const count = document.getElementById("practiceTypeCount");
    const catalog = document.getElementById("practiceTypeCatalog");
    if (!count || !catalog) return;
    if (!registeredTypes.length) {
        count.textContent = "0 dạng";
        catalog.innerHTML = '<div class="empty-state compact">Skill này chưa đăng ký dạng bài tập nào.</div>';
        return;
    }
    count.textContent = `${registeredTypes.length} dạng`;
    catalog.innerHTML = registeredTypes.map(type => `
        <article class="practice-type-card">
            <div class="type-meta">${escapeHtml(type.answerMode === "single_choice" ? "Trắc nghiệm / chọn đáp án" : "Tự luận / nhập câu trả lời")}</div>
            <h4>${escapeHtml(type.label)}</h4>
            <p>${escapeHtml(type.explanation || type.prompt || type.label)}</p>
        </article>
    `).join("");
}

function updatePracticeSkillSelector() {
    document.querySelectorAll("[data-select-practice-skill]").forEach(button => {
        button.classList.toggle("active", button.dataset.selectPracticeSkill === selectedPracticeSkill);
    });
    document.querySelectorAll("[data-practice-skill]").forEach(button => {
        button.classList.toggle("active", button.dataset.practiceSkill === selectedPracticeSkill);
    });
}

function renderExerciseSet(exercise) {
    const latestAttempt = latestAttemptForExercise(exercise.id);
    return `
        <div class="exercise-item" data-exercise-id="${escapeHtml(exercise.id)}">
            <div class="exercise-item-header">
                <button class="exercise-item-main" type="button" data-run-exercise="${escapeHtml(exercise.id)}">
                    <h4 class="exercise-title">${escapeHtml(exercise.title)}</h4>
                </button>
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
                        ${latestAttempt ? `<button class="menu-item" type="button" data-review-exercise="${escapeHtml(exercise.id)}">Xem review gần nhất</button>` : ""}
                        <button class="menu-item" type="button" data-duplicate-exercise="${escapeHtml(exercise.id)}">Nhân bản</button>
                        <button class="menu-item" type="button" data-rename-exercise="${escapeHtml(exercise.id)}">Đổi tên</button>
                        <button class="menu-item danger" type="button" data-delete-exercise="${escapeHtml(exercise.id)}">Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderPracticeQuestionItem(question, index, exerciseId = "") {
    const items = Array.isArray(question.items) && question.items.length
        ? question.items
        : [{ id: question.id, prompt: question.prompt || "", expected: question.expected || "", choices: question.choices || [] }];
    return `
        <div class="question-tree-item">
            <div class="question-tree-main">
                <span class="question-tree-index">Câu ${index + 1}</span>
                <span class="question-tree-type">${escapeHtml(ExerciseUiRegistry.label(question.type))}</span>
                <button class="btn btn-secondary question-delete-btn" type="button" data-delete-question="${escapeHtml(exerciseId)}::${escapeHtml(question.id)}">Xóa câu</button>
            </div>
            <p>${escapeHtml(question.prompt || questionPromptByType(question.type))}</p>
            <div class="question-option-list">
                ${items.map((item, itemIndex) => `
                    <div class="question-option-item">
                        <span>${"abcdefghijklmnopqrstuvwxyz"[itemIndex] || itemIndex + 1}</span>
                        <p>${escapeHtml(item.prompt || "Ý chưa có đề bài")}</p>
                    </div>
                `).join("")}
            </div>
            <p class="question-option-item muted">${escapeHtml(question.explanation || "Chưa có giải thích cho câu này.")}</p>
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
    if (/(đúng sai|true false|true\/false)/.test(text)) return "true_false";
    if (/(sắp xếp|unscramble|reorder|trật tự từ)/.test(text)) return "sentence_unscramble";
    if (skill === "Listening" && /(dictation|chép chính tả|nghe và viết|transcript)/.test(text)) return "listening_dictation";
    if (/(đồng nghĩa|synonym|similar)/.test(text)) return "synonym";
    if (/(điền|fill|blank|___|\.\.\.|chỗ trống)/.test(text)) return "fill_blank";
    if (skill === "Writing") return "writing";
    if (skill === "Speaking") return "speaking";
    if (skill === "Listening") return "listening_note";
    return "short_answer";
}

function extractChoices(text) {
    const matches = text.match(/[A-D]\)\s*([^A-D]+)/g);
    if (!matches) return [];
    return matches.map(item => item.replace(/^[A-D]\)\s*/, "").trim());
}

function buildQuestionFromLine(line, index, type, skill) {
    const answerMatch = line.match(/(?:=>|::|đáp án:|answer:)\s*(.+)$/i);
    const expected = answerMatch ? answerMatch[1].trim() : "";
    const cleanPrompt = answerMatch ? line.slice(0, answerMatch.index).trim() : line;
    const choices = extractChoices(cleanPrompt);
    const normalizedType = choices.length ? "multiple_choice_blank" : normalizeQuestionType(type);
    const normalizedChoices = normalizedType === "multiple_choice_blank"
        ? choices.slice(0, 4)
        : (normalizedType === "true_false" ? ["True", "False"] : []);
    return {
        id: makeId(`q${index}`),
        skill,
        type: normalizedType,
        prompt: questionPromptByType(normalizedType),
        items: [{
            id: makeId(`item${index}`),
            prompt: cleanPrompt || line,
            expected,
            choices: normalizedChoices
        }],
        explanation: expected ? `Đáp án dự kiến là "${expected}".` : questionExplanationByType(normalizedType)
    };
}

function runExercise(id) {
    activeExerciseId = id;
    const exercise = workspace().exercises.find(item => item.id === id);
    if (!exercise) return;
    selectedPracticeSkill = normalizeSkill(exercise.skill);
    activePracticeMode = "runner";
    activePracticeAttemptId = null;
    switchView("practice");
    renderPractice();
    document.getElementById("runnerTitle").textContent = exercise.title;
    document.getElementById("runnerMeta").textContent = exercise.durationMinutes
        ? `Bài làm có giới hạn ${exercise.durationMinutes} phút. Hết giờ hệ thống sẽ tự nộp bài.`
        : "Bài làm không giới hạn thời gian.";
    document.getElementById("runnerBody").innerHTML = ExerciseUiRegistry.render(exercise);
    startPracticeTimer(exercise);
    renderHeader();
    updateRoute();
    document.getElementById("exerciseRunner").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function submitExercise() {
    const current = workspace();
    const exercise = current.exercises.find(item => item.id === activeExerciseId);
    if (!exercise) return;
    clearPracticeTimer();
    const answers = ExerciseUiRegistry.collectAnswers(document.getElementById("runnerBody"));
    let feedback = exercise.questions.flatMap(question => gradeQuestion(question, answers));
    feedback = await resolveAiFeedbackIfNeeded(exercise, feedback, answers);
    const correct = feedback.filter(item => item.isCorrect).length;
    const attempt = {
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
    };
    current.attempts.unshift(attempt);
    activePracticeAttemptId = attempt.id;
    saveStudio();
    openPracticeReview(exercise.id, attempt.id);
}

function openPracticeReview(exerciseId, attemptId = null) {
    const exercise = workspace().exercises.find(item => item.id === exerciseId);
    if (!exercise) return;
    activeExerciseId = exerciseId;
    activePracticeAttemptId = attemptId || latestAttemptForExercise(exerciseId)?.id || null;
    selectedPracticeSkill = normalizeSkill(exercise.skill);
    activePracticeMode = "review";
    clearPracticeTimer();
    switchView("practice");
    renderPractice();
    document.getElementById("reviewTitle").textContent = `Review - ${exercise.title}`;
    document.getElementById("reviewBody").innerHTML = ExerciseUiRegistry.renderReview(exercise, activePracticeAttempt());
    renderHeader();
    updateRoute();
    document.getElementById("exerciseReviewPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function latestAttemptForExercise(exerciseId) {
    return workspace().attempts.find(item => item.exerciseId === exerciseId) || null;
}

function activePracticeAttempt() {
    return workspace().attempts.find(item => item.id === activePracticeAttemptId) || latestAttemptForExercise(activeExerciseId);
}

function clearPracticeTimer() {
    if (practiceTimerHandle) window.clearInterval(practiceTimerHandle);
    practiceTimerHandle = null;
    practiceDeadlineAt = null;
    const timer = document.getElementById("runnerTimer");
    if (timer) {
        timer.classList.add("hidden");
        timer.classList.remove("ending");
        timer.textContent = "";
    }
}

function startPracticeTimer(exercise) {
    clearPracticeTimer();
    if (!exercise?.durationMinutes) return;
    practiceDeadlineAt = Date.now() + (exercise.durationMinutes * 60 * 1000);
    const timer = document.getElementById("runnerTimer");
    if (!timer) return;
    timer.classList.remove("hidden");

    const tick = () => {
        const remaining = Math.max(0, practiceDeadlineAt - Date.now());
        const totalSeconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timer.textContent = `Còn ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        timer.classList.toggle("ending", remaining <= 60 * 1000);
        if (remaining <= 0) {
            clearPracticeTimer();
            setStatus("Hết giờ, hệ thống đã tự nộp bài.");
            submitExercise();
        }
    };

    tick();
    practiceTimerHandle = window.setInterval(tick, 1000);
}

function canUseConfiguredAi() {
    const config = studio.settings.aiConfig || defaultAiConfig();
    return Boolean(aiRuntime.configured && config.provider && config.endpoint && config.model);
}

async function requestAiCompletion(messages, settingOverrides = {}) {
    if (!canUseConfiguredAi()) {
        throw new Error("AI chưa được bật trong Cài đặt.");
    }
    appendCreationActivityLog("Đang gửi yêu cầu lên AI...", "Đang gửi");
    const payload = {
        messages,
        model: "external-chat-model",
        settings: {
            ...effectiveAiConfig(),
            ...settingOverrides
        }
    };
    console.log("[AI prompt payload]", payload);
    const result = await api("ai_complete", payload);
    appendCreationActivityLog("AI đã phản hồi, đang xử lý dữ liệu...", "Đang đọc phản hồi");
    console.log("[AI raw text]", result.result?.content || "");
    return result.result;
}

function exerciseQuestionFormResponseSchema() {
    return {
        type: "OBJECT",
        properties: {
            questions: { type: "STRING" },
            type: { type: "STRING" },
            cau_hoi: { type: "STRING" },
            cac_cau: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        number: { type: "STRING" },
                        question: { type: "STRING" },
                        form: {
                            type: "OBJECT",
                            properties: {
                                de_bai: { type: "STRING" },
                                cau_A: { type: "STRING" },
                                cau_B: { type: "STRING" },
                                cau_C: { type: "STRING" },
                                cau_D: { type: "STRING" },
                                dap_an: { type: "STRING" },
                                giai_thich: { type: "STRING" }
                            },
                            required: ["de_bai", "cau_A", "cau_B", "cau_C", "cau_D", "dap_an", "giai_thich"]
                        }
                    },
                    required: ["number", "question", "form"]
                }
            }
        },
        required: ["questions", "type", "cau_hoi", "cac_cau"]
    };
}

function parseJsonFromAiContent(content) {
    const raw = String(content || "").trim();
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        const match = raw.match(/```json\s*([\s\S]+?)```/i) || raw.match(/(\{[\s\S]+\}|\[[\s\S]+\])/);
        if (!match) return null;
        try {
            return JSON.parse(match[1].trim());
        } catch {
            return repairJsonCandidate(match[1].trim());
        }
    }
}

function repairJsonCandidate(raw) {
    try {
        const normalized = String(raw || "")
            .replace(/[\u0000-\u0019]+/g, " ")
            .replace(/,\s*([}\]])/g, "$1")
            .trim();
        return JSON.parse(normalized);
    } catch {
        return null;
    }
}

function buildAiExerciseTemplate({ skill, rawInput, type }) {
    const selectedType = normalizeQuestionType(type || selectedCreationType());
    const lines = rawInput
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .slice(0, 20);

    return {
        questions: lines.map((line, index) => buildAiTemplateQuestion(line, index, selectedType, skill))
    };
}

function buildQuestionsFromPastedText({ rawInput, type, skill }) {
    const normalizedType = normalizeQuestionType(type || selectedCreationType());
    return rawInput
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .slice(0, 20)
        .map((line, index) => normalizeQuestion(buildQuestionFromLine(line, index, normalizedType, skill)));
}

function buildAiTemplateQuestion(line, index, type, skill) {
    const normalizedType = normalizeQuestionType(type || detectQuestionType(skill, line));
    const baseQuestion = {
        id: makeId(`q${index}`),
        skill,
        type: normalizedType,
        prompt: questionPromptByType(normalizedType),
        gradingMode: "expected",
        explanation: "",
        items: [buildAiTemplateItem(line, index, normalizedType)]
    };

    return normalizeQuestion(baseQuestion);
}

function buildAiTemplateItem(line, index, type) {
    if (type === "rewrite_sentence") {
        return {
            id: makeId(`item${index}`),
            prompt: line,
            expected: "",
            explanation: "",
            choices: []
        };
    }

    return {
        id: makeId(`item${index}`),
        prompt: line,
        expected: "",
        explanation: "",
        choices: ["", "", "", ""]
    };
}

function buildUniversalQuestionFormEnvelope({ skill, title, prompt, questions = [], requestedType = "" }) {
    const normalizedRequestedType = normalizeQuestionType(requestedType || "");
    const normalizedQuestions = questions.map((question, index) => buildUniversalQuestionFormQuestion(question, index));
    return {
        questions: String(prompt || normalizedQuestions.map(question => question.question).join("\n")).trim(),
        type: normalizedRequestedType || "multiple_choice_blank",
        cau_hoi: questionPromptByType(normalizedRequestedType || "multiple_choice_blank"),
        cac_cau: normalizedQuestions
    };
}

function buildUniversalQuestionFormQuestion(question, index = 0) {
    const normalizedQuestion = normalizeQuestion(question);
    const item = normalizedQuestion.items?.[0] || {};
    const type = normalizeQuestionType(normalizedQuestion.type);
    const choices = Array.isArray(item.choices) ? item.choices : [];
    const defaultPrompt = String(item.prompt || "").trim();
    const isMultipleChoice = type === "multiple_choice_blank";
    const isTrueFalse = type === "true_false";

    return {
        number: String(index + 1),
        question: defaultPrompt,
        form: {
            de_bai: defaultPrompt,
            cau_A: isTrueFalse ? "True" : String(choices[0] || "").trim(),
            cau_B: isTrueFalse ? "False" : String(choices[1] || "").trim(),
            cau_C: isTrueFalse ? "" : String(choices[2] || "").trim(),
            cau_D: isTrueFalse ? "" : String(choices[3] || "").trim(),
            dap_an: isMultipleChoice || isTrueFalse
                ? answerLetterFromExpected(item.expected, isTrueFalse ? ["True", "False"] : choices, type)
                : String(item.expected || "").trim(),
            giai_thich: String(item.explanation || normalizedQuestion.explanation || "").trim()
        }
    };
}

function questionFormEntriesFromPayload(payload) {
    if (!payload || typeof payload !== "object") return [];
    if (Array.isArray(payload.cac_cau)) return payload.cac_cau;
    if (Array.isArray(payload["các câu"])) return payload["các câu"];
    if (Array.isArray(payload.y)) return payload.y;
    if (Array.isArray(payload["ý"])) return payload["ý"];
    if (payload.y && typeof payload.y === "object") return [payload.y];
    if (payload["ý"] && typeof payload["ý"] === "object") return [payload["ý"]];
    if (Array.isArray(payload.questions)) return payload.questions;
    return [];
}

function answerLetterFromExpected(expected, choices = [], type = "") {
    const normalizedExpected = String(expected || "").trim();
    if (!normalizedExpected) return "";
    const normalizedChoices = Array.isArray(choices)
        ? choices.map(choice => String(choice || "").trim())
        : [];
    const matchIndex = normalizedChoices.findIndex(choice => choice && choice.toLowerCase() === normalizedExpected.toLowerCase());
    if (matchIndex >= 0) return ["A", "B", "C", "D"][matchIndex] || "";
    if (normalizeQuestionType(type) === "true_false") {
        if (normalizedExpected.toLowerCase() === "true") return "A";
        if (normalizedExpected.toLowerCase() === "false") return "B";
    }
    return normalizedExpected.toUpperCase();
}

function answerValueFromForm(formAnswer, choices = [], type = "") {
    const normalizedAnswer = String(formAnswer || "").trim();
    if (!normalizedAnswer) return "";
    const answerKey = normalizedAnswer.toUpperCase();
    const answerIndex = ({ A: 0, B: 1, C: 2, D: 3 })[answerKey];
    if (typeof answerIndex === "number") {
        const choice = String(choices[answerIndex] || "").trim();
        if (choice) return choice;
    }
    if (normalizeQuestionType(type) === "true_false") {
        if (answerKey === "A") return "True";
        if (answerKey === "B") return "False";
    }
    return normalizedAnswer;
}

function extractFilledItemsFromQuestionForms(payload, templateQuestions = []) {
    const entries = questionFormEntriesFromPayload(payload);
    return entries
        .map((question, index) => {
            const templateQuestion = templateQuestions[index] || {};
            const templateItem = templateQuestion.items?.[0] || {};
            const type = normalizeQuestionType(payload?.type || templateQuestion.type);
            const form = question?.form && typeof question.form === "object" ? question.form : {};
            const rawChoices = [form.cau_A, form.cau_B, form.cau_C, form.cau_D];
            const baseChoices = type === "true_false"
                ? ["True", "False"]
                : normalizeAiChoices(rawChoices, []);
            const expected = type === "multiple_choice_blank" || type === "true_false"
                ? answerValueFromForm(form.dap_an, baseChoices, type)
                : pickFilledText(form.dap_an, "");
            return {
                questionId: String(templateQuestion.id || "").trim(),
                itemId: String(templateItem.id || "").trim(),
                choices: type === "multiple_choice_blank"
                    ? syncExpectedChoice(expected, baseChoices)
                    : (type === "true_false" ? ["True", "False"] : []),
                expected,
                explanation: pickFilledText(form.giai_thich, ""),
                prompt: pickFilledText(form.de_bai, question?.question || "")
            };
        })
        .filter(item => item.questionId && item.itemId);
}

function mergeAiQuestionFormsIntoTemplate(templateQuestions, payload) {
    const entries = questionFormEntriesFromPayload(payload);
    const filledItems = new Map(extractFilledItemsFromQuestionForms(payload, templateQuestions).map(item => [`${item.questionId}::${item.itemId}`, item]));

    return templateQuestions.map((templateQuestion, index) => {
        const incomingQuestion = entries[index] || {};
        const normalizedType = normalizeQuestionType(incomingQuestion.type || templateQuestion.type);
        const mergedItems = (templateQuestion.items || []).map(templateItem => {
            const fill = filledItems.get(`${templateQuestion.id}::${templateItem.id}`) || null;
            if (!fill) return templateItem;
            return {
                ...templateItem,
                prompt: pickFilledText(fill.prompt, templateItem.prompt),
                expected: pickFilledText(fill.expected, templateItem.expected),
                explanation: pickFilledText(fill.explanation, templateItem.explanation),
                choices: normalizedType === "multiple_choice_blank"
                    ? syncExpectedChoice(pickFilledText(fill.expected, templateItem.expected), normalizeAiChoices(fill.choices, templateItem.choices || []))
                    : (normalizedType === "true_false" ? ["True", "False"] : [])
            };
        });

        return normalizeQuestion({
            ...templateQuestion,
            type: normalizedType,
            prompt: pickFilledText(incomingQuestion?.question, templateQuestion.prompt),
            gradingMode: "expected",
            explanation: pickFilledText(incomingQuestion?.form?.giai_thich, templateQuestion.explanation),
            items: mergedItems
        });
    });
}

function mergeAiQuestionsFromTemplate(templateQuestions, aiQuestions = []) {
    return templateQuestions.map((templateQuestion, questionIndex) => {
        const incomingQuestion = aiQuestions[questionIndex] || {};
        const normalizedType = normalizeQuestionType(incomingQuestion.type || templateQuestion.type);
        const mergedItems = templateQuestion.items.map((templateItem, itemIndex) => {
            const incomingItem = Array.isArray(incomingQuestion.items) ? (incomingQuestion.items[itemIndex] || {}) : {};
            const mergedExpected = pickFilledText(incomingItem.expected, templateItem.expected);
            const mergedChoices = normalizedType === "multiple_choice_blank"
                ? syncExpectedChoice(mergedExpected, normalizeAiChoices(incomingItem.choices, templateItem.choices))
                : [];

            return {
                ...templateItem,
                prompt: pickFilledText(incomingItem.prompt, templateItem.prompt),
                expected: mergedExpected,
                explanation: pickFilledText(incomingItem.explanation, templateItem.explanation),
                choices: mergedChoices
            };
        });

        return normalizeQuestion({
            ...templateQuestion,
            type: normalizedType,
            prompt: pickFilledText(incomingQuestion.prompt, templateQuestion.prompt),
            gradingMode: "expected",
            explanation: pickFilledText(incomingQuestion.explanation, templateQuestion.explanation),
            items: mergedItems
        });
    });
}

function normalizeAiChoices(candidateChoices, fallbackChoices = []) {
    const normalized = Array.isArray(candidateChoices)
        ? candidateChoices.map(choice => String(choice || "").trim()).filter(Boolean)
        : [];
    if (normalized.length >= 4) return normalized.slice(0, 4);
    const fallback = Array.isArray(fallbackChoices) ? fallbackChoices : [];
    return [0, 1, 2, 3].map(index => normalized[index] || fallback[index] || "");
}

function pickFilledText(value, fallback = "") {
    const text = String(value || "").trim();
    return text || String(fallback || "").trim();
}

function syncExpectedChoice(expected, choices = []) {
    const normalizedExpected = String(expected || "").trim();
    const normalizedChoices = Array.isArray(choices) ? choices.slice(0, 4) : [];
    if (!normalizedExpected) return normalizedChoices;
    if (normalizedChoices.includes(normalizedExpected)) return normalizedChoices;
    const firstEmptyIndex = normalizedChoices.findIndex(choice => !String(choice || "").trim());
    if (firstEmptyIndex >= 0) {
        normalizedChoices[firstEmptyIndex] = normalizedExpected;
        return normalizedChoices;
    }
    normalizedChoices[normalizedChoices.length - 1] = normalizedExpected;
    return normalizedChoices;
}

function aiTemplateInstructions(selectedType) {
    if (normalizeQuestionType(selectedType) === "rewrite_sentence") {
        return [
            "Bạn sẽ nhận một JSON form mẫu của hệ thống.",
            "Giữ nguyên toàn bộ cấu trúc object, thứ tự phần tử, id, skill, type và các key hiện có.",
            "Chỉ điền vào các chuỗi đang trống như expected và explanation.",
            "Có thể chỉnh item.prompt để biến câu gốc thành đề bài đúng định dạng nếu cần.",
            "Không thêm markdown, không thêm giải thích ngoài JSON, không thêm HTML."
        ].join("\n");
    }

    return [
        "Bạn sẽ nhận một JSON form mẫu của hệ thống.",
        "Giữ nguyên toàn bộ cấu trúc object, thứ tự phần tử, id, skill, type và các key hiện có.",
        "Với mỗi item, hãy biến câu gốc thành câu hỏi điền/chọn đáp án phù hợp trong item.prompt nếu cần.",
        "Điền đủ đúng 4 lựa chọn tiếng Anh ngắn gọn trong choices.",
        "expected phải trùng chính xác với một phần tử trong choices.",
        "Điền explanation ngắn, rõ, không có HTML.",
        "Chỉ điền vào JSON mẫu rồi trả lại đúng JSON đó. Không thêm markdown hay văn bản ngoài JSON."
    ].join("\n");
}

async function fillMissingExerciseAnswersWithAi(exercise) {
    const pending = [];
    exercise.questions.forEach(question => {
        (question.items || []).forEach(item => {
            if (!item.expected) {
                pending.push({
                    questionId: question.id,
                    itemId: item.id,
                    type: question.type,
                    questionPrompt: question.prompt,
                    itemPrompt: item.prompt,
                    choices: item.choices || [],
                    choicesMissing: question.type === "multiple_choice_blank" && (!(item.choices || []).filter(choice => String(choice || "").trim()).length),
                    explanation: question.explanation || item.explanation || ""
                });
            }
        });
    });
    if (!pending.length || !canUseConfiguredAi()) return exercise;

    const exerciseFormSkill = await loadExerciseQuestionFormSkillText();
    const questionForms = pending.map((entry, index) => ({
        number: String(index + 1),
        question: entry.itemPrompt,
        form: {
            de_bai: entry.itemPrompt,
            cau_A: entry.type === "true_false" ? "True" : String(entry.choices?.[0] || "").trim(),
            cau_B: entry.type === "true_false" ? "False" : String(entry.choices?.[1] || "").trim(),
            cau_C: entry.type === "true_false" ? "" : String(entry.choices?.[2] || "").trim(),
            cau_D: entry.type === "true_false" ? "" : String(entry.choices?.[3] || "").trim(),
            dap_an: "",
            giai_thich: String(entry.explanation || "").trim()
        }
    }));
    const promptEnvelope = {
        questions: pending.map(entry => entry.itemPrompt).join("\n"),
        type: normalizeQuestionType(pending[0]?.type || "multiple_choice_blank"),
        cau_hoi: questionPromptByType(normalizeQuestionType(pending[0]?.type || "multiple_choice_blank")),
        cac_cau: questionForms
    };
    console.log("[AI question form payload]", promptEnvelope);

    const messages = [
        {
            role: "system",
            content: `${studio.settings.aiConfig?.systemPrompt || defaultAiConfig().systemPrompt}
${exerciseFormSkill}

Nhiem vu hien tai:
- Ban se nhan danh sach cau hoi dang thieu dap an.
- Neu dang bai la multiple_choice_blank va chua du lua chon, hay sinh du 4 lua chon.
- Giu nguyen cau hoi trong truong question.
- Chi dien vao object form roi tra lai JSON dung 4 field top-level: questions, type, cau_hoi, cac_cau.`
        },
        { role: "user", content: JSON.stringify(promptEnvelope) }
    ];
    const result = await requestAiCompletion(messages, {
        responseMode: "json_schema",
        responseSchema: exerciseQuestionFormResponseSchema()
    });
    const parsed = parseJsonFromAiContent(result.content);
    const formItems = extractFilledItemsFromQuestionForms(parsed, exercise.questions);
    const legacyItems = Array.isArray(parsed?.items) ? parsed.items : [];
    const combinedItems = formItems.length ? formItems : legacyItems;
    if (!combinedItems.length) return exercise;
    const fillMap = new Map(combinedItems.map(item => [`${item.questionId}::${item.itemId}`, item]));

    exercise.questions = exercise.questions.map(question => ({
        ...question,
        items: (question.items || []).map(item => {
            const fill = fillMap.get(`${question.id}::${item.id}`);
            if (!fill) return item;
            const nextExpected = item.expected || String(fill.expected || "").trim();
            return {
                ...item,
                prompt: String(fill.prompt || item.prompt || "").trim(),
                choices: question.type === "multiple_choice_blank"
                    ? syncExpectedChoice(nextExpected, normalizeAiChoices(fill.choices, item.choices || []))
                    : (item.choices || []),
                expected: nextExpected,
                explanation: item.explanation || String(fill.explanation || "").trim()
            };
        })
    }));
    return exercise;
}

function hasMissingExpectedAnswers(exercise) {
    return (exercise.questions || []).some(question => (question.items || []).some(item => !String(item.expected || "").trim()));
}

async function resolveAiFeedbackIfNeeded(exercise, feedback, answers) {
    const pending = feedback.filter(item => item.requiresAi);
    if (!pending.length) return feedback;
    if (!canUseConfiguredAi()) {
        return feedback.map(item => item.requiresAi
            ? { ...item, explanation: "Mục này cần AI để chấm. Hãy bật External AI và thêm API key vào file .env.", expected: item.expected || "" }
            : item);
    }

    const questionMap = new Map((exercise.questions || []).map(question => [question.id, question]));
    const messages = [
        { role: "system", content: `${studio.settings.aiConfig?.systemPrompt || defaultAiConfig().systemPrompt}\nHãy chấm câu trả lời tiếng Anh và trả về JSON dạng {\"results\":[{\"questionId\":\"...\",\"itemId\":\"...\",\"isCorrect\":true,\"expected\":\"...\",\"explanation\":\"...\"}]}. Đánh giá dựa trên độ đúng yêu cầu, ngữ pháp và ý nghĩa.` },
        {
            role: "user",
            content: JSON.stringify({
                exercise: { id: exercise.id, title: exercise.title, skill: exercise.skill },
                pending: pending.map(item => {
                    const question = questionMap.get(item.questionId);
                    const sourceItem = (question?.items || []).find(entry => entry.id === item.itemId);
                    return {
                        questionId: item.questionId,
                        itemId: item.itemId,
                        questionPrompt: question?.prompt || "",
                        itemPrompt: sourceItem?.prompt || item.prompt || "",
                        answer: item.answer,
                        expected: sourceItem?.expected || item.expected || "",
                        choices: sourceItem?.choices || []
                    };
                }),
                answers
            })
        }
    ];
    const result = await requestAiCompletion(messages);
    const parsed = parseJsonFromAiContent(result.content);
    if (!parsed?.results) {
        return feedback.map(item => item.requiresAi ? { ...item, explanation: "AI không trả về dữ liệu chấm hợp lệ." } : item);
    }
    const resultMap = new Map(parsed.results.map(item => [`${item.questionId}::${item.itemId}`, item]));
    return feedback.map(item => {
        if (!item.requiresAi) return item;
        const graded = resultMap.get(`${item.questionId}::${item.itemId}`);
        if (!graded) return { ...item, explanation: "AI chưa chấm được mục này." };
        return {
            ...item,
            isCorrect: Boolean(graded.isCorrect),
            expected: String(graded.expected || item.expected || "").trim(),
            explanation: String(graded.explanation || item.explanation || "").trim(),
            requiresAi: false
        };
    });
}

function toggleExerciseMenu(exerciseId) {
    const menu = document.querySelector(`[data-exercise-menu="${exerciseId}"]`);
    if (!menu) return;
    const isHidden = menu.classList.contains("hidden");
    closeAllExerciseMenus();
    if (isHidden) menu.classList.remove("hidden");
}

function gradeQuestion(question, answers) {
    return PracticeExerciseTypeRegistry.gradeQuestion(question, answers);
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

async function createExerciseFromCreationPage() {
    if (creationBusy) return;
    const rawSkill = document.getElementById("creationSkillSelect").value.trim();
    const skill = normalizeSkill(rawSkill);
    const title = document.getElementById("creationTitleInput").value.trim();
    const prompt = document.getElementById("creationPromptInput").value.trim();
    const durationMinutes = normalizeDuration(document.getElementById("creationDurationInput").value);
    const manualQuestions = collectManualQuestionsFromBuilder();
    if (!canCreateExerciseForSkill(skill)) {
        setStatus("Skill này chưa có dạng bài tương ứng nên chưa thể tạo bài.");
        return;
    }
    
    if (!rawSkill) {
        setStatus("Bạn cần chọn kỹ năng.");
        return;
    }
    if (!title) {
        setStatus("Bạn cần nhập tên bài tập.");
        return;
    }
    if (creationMode === "manual" && !prompt && !manualQuestions.length) {
        setStatus("Bạn cần nhập đề bài.");
        return;
    }

    let exercise = null;
    if (creationMode === "ai") {
        const aiInput = document.getElementById("creationAiInput")?.value.trim() || "";
        if (!aiInput) {
            setStatus("Bạn cần dán ít nhất 1 dòng văn bản.");
            return;
        }
        resetCreationActivity("Đang dựng bài từ văn bản", "Chuẩn bị");
        appendCreationActivityLog("Đã nhận văn bản nguồn. Bắt đầu dựng form bài tập theo dạng đã chọn.");
        try {
            const generatedQuestions = buildQuestionsFromPastedText({
                skill,
                rawInput: aiInput,
                type: selectedCreationType()
            });
            if (!generatedQuestions.length) {
                finishCreationActivity("Không tạo ra câu hỏi hợp lệ từ văn bản đã dán.", true);
                setStatus("Không đọc được câu hỏi hợp lệ từ văn bản đã dán.");
                return;
            }
            appendCreationActivityLog(`Đã dựng ${generatedQuestions.length} câu hỏi từ văn bản. Đang đổ dữ liệu vào form...`, "Đang đổ vào form");
            populateManualQuestionBuilder(generatedQuestions);
            exercise = buildManualExercise({
                skill,
                title,
                prompt: aiInput,
                durationMinutes,
                questions: generatedQuestions
            });
        } catch (error) {
            console.error(error);
            finishCreationActivity(`Tạo bài thất bại: ${error.message}`, true);
            setStatus("Không thể dựng bài từ văn bản lúc này.");
            return;
        }
    } else {
        resetCreationActivity("AI đang kiểm tra bài tạo tay", "Chuẩn bị");
        appendCreationActivityLog("Đang chuẩn bị bài tập từ form thủ công.");
        exercise = manualQuestions.length
            ? buildManualExercise({ skill, title, prompt, durationMinutes, questions: manualQuestions })
            : generateExerciseSchema({ skill, title, prompt });
    }

    let creationMessage = "Tạo bài tập thành công!";
    if (!manualQuestions.length && creationMode !== "ai") {
        exercise.durationMinutes = durationMinutes;
    }
    if (hasMissingExpectedAnswers(exercise)) {
        try {
            appendCreationActivityLog("Đang nhờ AI điền đáp án còn thiếu...", "Điền đáp án");
            exercise = await fillMissingExerciseAnswersWithAi(exercise);
            appendCreationActivityLog("AI đã điền xong các đáp án còn thiếu.", "Đã điền đáp án");
        } catch (error) {
            console.error(error);
            creationMessage = "Tạo bài tập xong nhưng AI chưa điền được đáp án trống.";
            appendCreationActivityLog(`AI không điền được đáp án: ${error.message}`, "Lỗi");
        }
        if (hasMissingExpectedAnswers(exercise) && !canUseConfiguredAi()) {
            creationMessage = "Bài tập đã được tạo. Bật External AI và thêm API key trong file .env để AI tự điền đáp án.";
        }
    }

    workspace().exercises.unshift(exercise);
    selectedPracticeSkill = skill;
    document.getElementById("exerciseCreationForm").reset();
    creationMode = "manual";
    updateCreationTypeSelect();
    renderManualQuestionBuilder();
    syncCreationModeUi();
    showPracticeSkill(skill);
    saveStudio();
    finishCreationActivity("Đã tạo bài tập xong.");
    setStatus(creationMessage);
}

function buildManualExercise({ skill, title, prompt, durationMinutes, questions }) {
    return {
        id: makeId("ex"),
        workspaceId: activeWorkspaceId,
        skill,
        title,
        sourcePrompt: prompt,
        durationMinutes,
        questions,
        createdAt: new Date().toISOString()
    };
}

async function generateQuestionsWithAi({ skill, title, prompt, rawInput, type }) {
    if (!canUseConfiguredAi()) {
        throw new Error("AI chưa sẵn sàng.");
    }

    const selectedType = normalizeQuestionType(type || selectedCreationType());
    const template = buildAiExerciseTemplate({ skill, rawInput, type: selectedType });
    const questionFormEnvelope = buildUniversalQuestionFormEnvelope({
        skill,
        title,
        prompt: rawInput,
        questions: template.questions,
        requestedType: selectedType
    });
    const exerciseFormSkill = await loadExerciseQuestionFormSkillText();
    appendCreationActivityLog(`Đang tạo ${template.questions.length} câu theo dạng ${selectedType || "mặc định"}.`, "Chuẩn bị form");
    appendCreationActivityLog("Đã dựng form mẫu nội bộ và sắp gửi lên AI để điền.", "Chuẩn bị form");
    console.log("[AI scaffold]", template);
    console.log("[AI question form scaffold]", questionFormEnvelope);
    const messages = [
        {
            role: "system",
            content: `${studio.settings.aiConfig?.systemPrompt || defaultAiConfig().systemPrompt}
${exerciseFormSkill}

Ban dang ho tro tao bai tap tieng Anh theo form co dinh cua he thong.
${aiTemplateInstructions(selectedType)}
Chi dien vao object form va tra lai dung 4 field top-level: questions, type, cau_hoi, cac_cau.`
        },
        {
            role: "user",
            content: JSON.stringify(questionFormEnvelope)
        }
    ];
    const result = await requestAiCompletion(messages, {
        responseMode: "json_schema",
        responseSchema: exerciseQuestionFormResponseSchema()
    });
    appendCreationActivityLog("Đã nhận phản hồi text từ AI, đang parse JSON...", "Đang parse");
    const parsed = parseJsonFromAiContent(result.content);
    if (!parsed) {
        appendCreationActivityLog(`AI trả về text không parse được thành JSON.`, "Parse lỗi");
        console.error("[AI parse failed]", result.content || "");
        throw new Error("AI trả về dữ liệu không đúng JSON.");
    }
    console.log("[AI parsed json]", parsed);
    const generatedQuestions = questionFormEntriesFromPayload(parsed);
    if (!generatedQuestions.length) {
        appendCreationActivityLog("JSON có trả về nhưng không có mảng 'cac_cau' hợp lệ.", "Parse lỗi");
        console.error("[AI questions missing]", parsed);
        throw new Error("AI chưa trả về mảng 'cac_cau' hợp lệ.");
    }
    const mergedQuestions = generatedQuestions.some(question => question && typeof question.form === "object")
        ? mergeAiQuestionFormsIntoTemplate(template.questions, parsed)
        : mergeAiQuestionsFromTemplate(template.questions, generatedQuestions);
    appendCreationActivityLog(`Parse xong. Ghép được ${mergedQuestions.length} câu hỏi vào form nội bộ.`, "Đã parse");
    console.log("[AI merged questions]", mergedQuestions);
    return mergedQuestions;
}

function renderManualQuestionBuilder(count = 1) {
    const list = document.getElementById("manualQuestionList");
    if (!list) return;
    list.innerHTML = Array.from({ length: count }, (_, index) => renderManualQuestionEditorRow(index)).join("");
}

function populateManualQuestionBuilder(questions = []) {
    const list = document.getElementById("manualQuestionList");
    if (!list) return;
    const skill = normalizeSkill(document.getElementById("creationSkillSelect")?.value || selectedPracticeSkill);
    const source = questions.length ? questions : [{}];
    list.innerHTML = source.map((question, index) => PracticeQuestionComponent.renderManualQuestionEditorRow(index, skill, question)).join("");
}

function collectManualQuestionsFromBuilder() {
    return [...document.querySelectorAll("[data-manual-question]")]
        .map((row, index) => PracticeQuestionComponent.buildQuestionFromForm(
            row,
            "manual",
            normalizeSkill(document.getElementById("creationSkillSelect")?.value || selectedPracticeSkill),
            index
        ))
        .filter(Boolean);
}

function renderManualQuestionEditorRow(index) {
    const skill = normalizeSkill(document.getElementById("creationSkillSelect")?.value || selectedPracticeSkill);
    const type = selectedCreationType() || PracticeQuestionComponent.defaultExerciseTypeForSkill(skill);
    return PracticeQuestionComponent.renderManualQuestionEditorRow(index, skill, { type });
}

function updateCreationTypeSelect() {
    const skill = normalizeSkill(document.getElementById("creationSkillSelect")?.value || selectedPracticeSkill);
    const select = document.getElementById("creationTypeSelect");
    if (!select) return;
    select.innerHTML = PracticeQuestionComponent.renderExerciseTypeOptions(skill, selectedCreationType());
    if (!select.value) {
        select.value = PracticeQuestionComponent.defaultExerciseTypeForSkill(skill) || "";
    }
}

function selectedCreationType() {
    return document.getElementById("creationTypeSelect")?.value || "";
}

function syncCreationModeUi() {
    const manualButton = document.getElementById("creationModeManualBtn");
    const aiButton = document.getElementById("creationModeAiBtn");
    const manualPanel = document.getElementById("manualQuestionBuilder");
    const aiPanel = document.getElementById("creationAiPanel");
    const fillAnswersButton = document.getElementById("fillExerciseAnswersBtn");
    const submitButton = document.getElementById("submitExerciseCreationBtn");

    manualButton?.classList.toggle("active", creationMode === "manual");
    aiButton?.classList.toggle("active", creationMode === "ai");
    manualPanel?.classList.toggle("hidden", creationMode === "ai");
    aiPanel?.classList.toggle("hidden", creationMode !== "ai");
    fillAnswersButton?.classList.toggle("hidden", creationMode !== "manual");
    if (submitButton) {
        submitButton.textContent = creationMode === "ai" ? "AI tạo bài" : "Tạo bài tập";
    }
}

function setCreationMode(mode = "manual") {
    if (creationBusy) return;
    creationMode = mode === "ai" ? "ai" : "manual";
    syncCreationModeUi();
}

function setCreationBusy(isBusy, phase = "Đang chờ") {
    creationBusy = Boolean(isBusy);
    const form = document.getElementById("exerciseCreationForm");
    const submitButton = document.getElementById("submitExerciseCreationBtn");
    const fillButton = document.getElementById("fillExerciseAnswersBtn");
    const phaseNode = document.getElementById("creationAiActivityPhase");
    const activity = document.getElementById("creationAiActivity");

    form?.classList.toggle("creation-busy", creationBusy);
    document.getElementById("exerciseCreationPanel")?.classList.toggle("creation-busy", creationBusy);
    submitButton?.classList.toggle("is-loading", creationBusy);
    if (fillButton && creationMode === "manual") {
        fillButton.disabled = creationBusy;
    }
    if (submitButton) {
        submitButton.disabled = creationBusy;
    }
    if (phaseNode) {
        phaseNode.textContent = phase;
    }
    if (activity && creationBusy) {
        activity.classList.remove("hidden");
    }
}

function resetCreationActivity(title = "AI đang xử lý", phase = "Khởi động") {
    const titleNode = document.getElementById("creationAiActivityTitle");
    const logNode = document.getElementById("creationAiActivityLog");
    const activity = document.getElementById("creationAiActivity");
    if (titleNode) titleNode.textContent = title;
    if (logNode) logNode.innerHTML = "";
    if (activity) activity.classList.remove("hidden");
    setCreationBusy(true, phase);
}

function appendCreationActivityLog(text, phase = "") {
    const logNode = document.getElementById("creationAiActivityLog");
    const phaseNode = document.getElementById("creationAiActivityPhase");
    const time = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    if (phase && phaseNode) {
        phaseNode.textContent = phase;
    }
    if (!logNode) return;
    logNode.insertAdjacentHTML("beforeend", `
        <article class="creation-log-item">
            <span class="creation-log-time">${escapeHtml(time)}</span>
            <div class="creation-log-text">${escapeHtml(text)}</div>
        </article>
    `);
    logNode.scrollTop = logNode.scrollHeight;
}

function finishCreationActivity(text, isError = false) {
    appendCreationActivityLog(text, isError ? "Lỗi" : "Hoàn tất");
    setCreationBusy(false, isError ? "Lỗi" : "Hoàn tất");
    if (!isError) {
        window.setTimeout(() => {
            document.getElementById("creationAiActivity")?.classList.add("hidden");
        }, 1800);
    }
}

function openAiChatModal(prefill = "") {
    const modal = document.getElementById("aiChatModal");
    if (!modal) return;
    renderAiChatMessages();
    modal.classList.remove("hidden");
    const input = document.getElementById("aiChatInput");
    if (input) {
        if (prefill) input.value = prefill;
        requestAnimationFrame(() => input.focus());
    }
}

function closeAiChatModal() {
    document.getElementById("aiChatModal")?.classList.add("hidden");
}

function renderAiChatMessages() {
    const target = document.getElementById("aiChatMessages");
    if (!target) return;
    target.innerHTML = aiChatMessages.map(message => `
        <article class="ai-chat-message ${message.role === "user" ? "user" : "assistant"}">
            <span class="ai-chat-role">${message.role === "user" ? "Bạn" : "AI"}</span>
            <div class="ai-chat-bubble">${formatAiChatMessage(message.content)}</div>
        </article>
    `).join("");
    target.scrollTop = target.scrollHeight;
}

function formatAiChatMessage(content) {
    return escapeHtml(String(content || "")).replace(/\n/g, "<br>");
}

function extractAiChatDisplayContent(rawContent) {
    const raw = String(rawContent || "").trim();
    if (!raw) return "AI chưa trả về nội dung.";
    const parsed = parseJsonFromAiContent(raw);
    if (!parsed) {
        const promptFallback = extractPromptFromMalformedAiResponse(raw);
        if (promptFallback) {
            console.log("[AI chat prompt fallback]", promptFallback);
            return promptFallback;
        }
        return raw;
    }

    if (typeof parsed?.prompt === "string" && parsed.prompt.trim()) {
        return parsed.prompt.trim();
    }

    if (Array.isArray(parsed?.questions) && parsed.questions.length) {
        const prompts = parsed.questions
            .map(question => String(question?.prompt || "").trim())
            .filter(Boolean);
        if (prompts.length) return prompts.join("\n");
    }

    if (typeof parsed?.content === "string" && parsed.content.trim()) {
        return parsed.content.trim();
    }

    const promptFallback = extractPromptFromMalformedAiResponse(raw);
    if (promptFallback) return promptFallback;

    if (Array.isArray(parsed?.questions) && parsed.questions.length === 0) {
        return "AI chưa trả về prompt nào để hiển thị.";
    }

    if (parsed && typeof parsed === "object") {
        return "AI đã trả về dữ liệu có cấu trúc, nhưng không có nội dung chat để hiển thị.";
    }

    return raw;
}

function extractPromptFromMalformedAiResponse(rawContent) {
    const raw = String(rawContent || "").trim();
    if (!raw) return "";

    const promptMatches = [...raw.matchAll(/"prompt"\s*:\s*"([\s\S]*?)(?:"\s*(?:,|\}|\])|$)/gi)];
    if (!promptMatches.length) return "";

    const prompts = promptMatches
        .map(match => decodeJsonLikeText(match[1] || ""))
        .map(text => text.trim())
        .filter(Boolean);

    return prompts.join("\n");
}

function decodeJsonLikeText(value) {
    const raw = String(value || "");
    try {
        return JSON.parse(`"${raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
    } catch {
        return raw
            .replace(/\\"/g, '"')
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\\\/g, "\\")
            .replace(/\\u003c/gi, "<")
            .replace(/\\u003e/gi, ">")
            .replace(/\\u0026/gi, "&");
    }
}

function setAiChatBusy(isBusy, status = "Sẵn sàng") {
    aiChatBusy = Boolean(isBusy);
    const form = document.getElementById("aiChatForm");
    const button = document.getElementById("aiChatSendBtn");
    const statusNode = document.getElementById("aiChatStatus");
    const input = document.getElementById("aiChatInput");
    form?.classList.toggle("is-busy", aiChatBusy);
    if (button) button.disabled = aiChatBusy;
    if (input) input.disabled = aiChatBusy;
    if (statusNode) statusNode.textContent = status;
}

function buildAiChatRequestMessages(question) {
    return [
        {
            role: "system",
            content: `Bạn là AI tư vấn trong ứng dụng học tiếng Anh.
Trả lời tự nhiên, ngắn gọn, rõ ràng, ưu tiên tiếng Việt trừ khi người dùng yêu cầu ngôn ngữ khác.
Không trả JSON, không trả object, không trả markdown code block.
Chỉ trả về đúng phần nội dung câu trả lời bằng văn bản thường.`
        },
        {
            role: "user",
            content: String(question || "").trim()
        }
    ];
}

async function sendAiChatMessage(question) {
    const prompt = String(question || "").trim();
    if (!prompt || aiChatBusy) return;

    aiChatMessages.push({ role: "user", content: prompt });
    renderAiChatMessages();
    setAiChatBusy(true, "AI đang trả lời...");

    try {
        if (!canUseConfiguredAi()) {
            throw new Error("AI chưa được bật trong Cài đặt.");
        }
        const messages = buildAiChatRequestMessages(prompt);
        const payload = {
            messages,
            model: "external-chat-model",
            settings: {
                ...effectiveAiConfig(),
                responseMode: "text"
            }
        };
        console.log("[AI chat prompt payload]", payload);
        const result = await api("ai_complete", payload);
        const rawReply = String(result.result?.content || "").trim() || "AI chưa trả về nội dung.";
        const reply = extractAiChatDisplayContent(rawReply);
        console.log("[AI chat raw text]", rawReply);
        console.log("[AI chat display text]", reply);
        aiChatMessages.push({ role: "assistant", content: reply });
        renderAiChatMessages();
        setAiChatBusy(false, "Đã nhận phản hồi");
    } catch (error) {
        console.error(error);
        aiChatMessages.push({ role: "assistant", content: `Không gọi được AI: ${error.message}` });
        renderAiChatMessages();
        setAiChatBusy(false, "Lỗi");
    }
}

function removeQuestionItemRow(button) {
    const item = button.closest("[data-manual-item]");
    const list = item?.parentElement;
    if (!item || !list) return;
    if (list.children.length <= 1) {
        setStatus("Một câu cần ít nhất 1 ý.");
        return;
    }
    const root = item.closest("[data-manual-question]");
    item.remove();
    PracticeQuestionComponent.refreshQuestionItemEditors(root, "manual", selectedPracticeSkill);
}

function renderSettings() {
    const config = effectiveAiConfig();
    applyLearningSettings();
    document.getElementById("dataPathInput").value = normalizeDataFolder(studio.settings.dataPath || "user_data/studio");
    document.getElementById("aiModelInput").value = studio.settings.aiModel || (aiRuntime.configured ? "external-chat-model" : "local-rule-based");
    document.getElementById("aiProviderInput").value = config.provider || defaultAiConfig().provider;
    document.getElementById("aiModelNameInput").value = config.model || defaultAiConfig().model;
    document.getElementById("aiEndpointInput").value = config.endpoint || defaultAiConfig().endpoint;
    document.getElementById("aiMaxTokensInput").value = config.maxTokens || defaultAiConfig().maxTokens;
    document.getElementById("aiSystemPromptInput").value = config.systemPrompt || defaultAiConfig().systemPrompt;
    document.getElementById("learningFontSizeInput").value = normalizeFontSize(studio.settings.learningFontSize);
    document.getElementById("jsonDataBox").value = JSON.stringify(studio, null, 2);
    renderAiRuntimeStatus();
}

function saveSettings() {
    studio.settings.dataPath = normalizeDataFolder(document.getElementById("dataPathInput").value.trim() || "user_data/studio");
    studio.settings.aiModel = document.getElementById("aiModelInput").value;
    const defaults = defaultAiConfig();
    studio.settings.aiConfig = {
        provider: document.getElementById("aiProviderInput").value || defaults.provider,
        model: document.getElementById("aiModelNameInput").value.trim() || defaults.model,
        endpoint: document.getElementById("aiEndpointInput").value.trim() || defaults.endpoint,
        maxTokens: Number.parseInt(document.getElementById("aiMaxTokensInput").value, 10) || defaultAiConfig().maxTokens,
        systemPrompt: document.getElementById("aiSystemPromptInput").value.trim() || defaults.systemPrompt
    };
    studio.settings.aiConfig = sanitizeStoredAiConfig(studio.settings.aiConfig);
    studio.settings.learningFontSize = normalizeFontSize(document.getElementById("learningFontSizeInput").value);
    applyLearningSettings();
    renderSettings();
    saveStudio();
}

function renderAiRuntimeStatus() {
    const badge = document.getElementById("aiRuntimeBadge");
    const summary = document.getElementById("aiRuntimeSummary");
    const meta = document.getElementById("aiRuntimeMeta");
    if (!badge || !summary || !meta) return;

    badge.classList.remove("connected", "disconnected");
    const model = studio.settings.aiConfig?.model || aiRuntime.model || defaultAiConfig().model;
    const provider = studio.settings.aiConfig?.provider || aiRuntime.provider || defaultAiConfig().provider;

    if (aiRuntime.configured) {
        badge.textContent = "Đã kết nối";
        badge.classList.add("connected");
        summary.textContent = `Server đã sẵn sàng gọi ${provider} với model ${model}.`;
        meta.innerHTML = `API key đang được đọc từ <code>${escapeHtml(aiRuntime.source || ".env")}</code>. Mỗi phản hồi AI sẽ được <code>console.log</code> ra trình duyệt.`;
        if ((studio.settings.aiModel || "") !== "external-chat-model") {
            studio.settings.aiModel = "external-chat-model";
        }
        return;
    }

    badge.textContent = "Thiếu API key";
    badge.classList.add("disconnected");
    summary.textContent = "Chưa thấy API key trong file .env nên AI chưa thể chấm hoặc điền đáp án.";
    meta.innerHTML = `Mở file <code>${escapeHtml(aiRuntime.source || ".env")}</code>, dán key vào biến <code>AI_API_KEY</code>, rồi tải lại trang.`;
}

function applyLearningSettings() {
    const size = normalizeFontSize(studio.settings.learningFontSize);
    studio.settings.learningFontSize = size;
    document.documentElement.style.setProperty("--learning-font-size", `${size}px`);
    const visualEditor = document.getElementById("markdownEditor");
    const codeEditor = document.getElementById("markdownCodeEditor");
    if (visualEditor) visualEditor.style.fontSize = `${size}px`;
    if (codeEditor) codeEditor.style.fontSize = `${size}px`;
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
    if (id !== "practice") clearPracticeTimer();
    document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === id));
    document.querySelectorAll(".nav-item").forEach(button => {
        const skill = button.dataset.practiceSkill;
        if (skill) {
            button.classList.toggle("active", id === "practice" && normalizeSkill(skill) === selectedPracticeSkill);
            return;
        }
        button.classList.toggle("active", button.dataset.view === id);
    });
    renderHeader();
    updateRoute();
}

function updateRoute() {
    const activeView = document.querySelector(".view.active")?.id || "knowledge";
    let route = `#/${activeView}`;
    if (activeView === "practice") {
        route = PracticeInterfaceRegistry.route(activePracticeMode, {
            skill: selectedPracticeSkill,
            skillLabel: SKILL_LABELS[selectedPracticeSkill] || selectedPracticeSkill,
            exercise: workspace().exercises.find(item => item.id === activeExerciseId) || null
        });
    }
    if (activeView === "knowledge" && activePageId) route = `#/knowledge/${encodeURIComponent(activePageId)}`;
    if (window.location.hash !== route) history.replaceState(null, "", route);
}

function applyRouteFromHash() {
    const parts = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
    if (!parts.length) return;
    if (parts[0] === "practice") {
        selectedPracticeSkill = normalizeSkill(parts[1] || selectedPracticeSkill);
        const exerciseIndex = parts.indexOf("exercise");
        if (exerciseIndex >= 0 && parts[exerciseIndex + 1]) {
            if (parts.includes("review")) {
                openPracticeReview(parts[exerciseIndex + 1]);
                return;
            }
            runExercise(parts[exerciseIndex + 1]);
            return;
        }
        if (parts.includes("create")) {
            openPracticeCreation(selectedPracticeSkill);
            return;
        }
        showPracticeSkill(selectedPracticeSkill);
        return;
    }
    if (parts[0] === "knowledge" && parts[1] && workspace().pages.some(page => page.id === parts[1])) {
        selectPage(parts[1]);
        return;
    }
    if (VIEW_TITLES[parts[0]]) switchView(parts[0]);
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
    if (Number.isNaN(parsed)) return 12;
    return Math.min(32, Math.max(8, parsed));
}

function makeId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(value) {
    return value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value)) : "chưa rõ";
}

function stripHtml(value) {
    const div = document.createElement("div");
    div.innerHTML = value || "";
    return div.innerText || "";
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function hydratePracticeSkillControls() {
    PracticeSkillRegistry.hydrateNavigation({
        practiceSkillSelector: document.querySelector("[data-practice-skill-selector]") || document.querySelector(".practice-skill-selector"),
        practiceSubnav: document.querySelector("[data-skill-subnav]") || document.querySelector(".practice-subnav")
    });
    PracticeSkillRegistry.populateSkillSelect(document.getElementById("creationSkillSelect"));
}

document.addEventListener("DOMContentLoaded", () => {
    IconRegistry.replaceTextIcons();
    hydratePracticeSkillControls();
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
        if (!button.dataset.view) return;
        switchView(button.dataset.view);
    }));
    document.querySelectorAll("[data-practice-skill]").forEach(button => button.addEventListener("click", () => {
        showPracticeSkill(button.dataset.practiceSkill);
        saveStudio();
    }));
    document.querySelectorAll("[data-select-practice-skill]").forEach(button => {
        button.addEventListener("click", () => {
            const skill = button.dataset.selectPracticeSkill;
            showPracticeSkill(skill);
            saveStudio();
        });
    });
    document.getElementById("settingsBtn").addEventListener("click", () => document.getElementById("settingsModal").classList.remove("hidden"));
    document.querySelectorAll("[data-close-settings]").forEach(item => item.addEventListener("click", () => document.getElementById("settingsModal").classList.add("hidden")));
    document.querySelectorAll("[data-close-ai-chat]").forEach(item => item.addEventListener("click", closeAiChatModal));
    document.getElementById("aiChatForm")?.addEventListener("submit", async event => {
        event.preventDefault();
        const input = document.getElementById("aiChatInput");
        const value = input?.value.trim() || "";
        if (!value) return;
        if (input) input.value = "";
        await sendAiChatMessage(value);
    });
    document.getElementById("learningFontSizeInput")?.addEventListener("input", event => {
        studio.settings.learningFontSize = normalizeFontSize(event.target.value);
        applyLearningSettings();
    });
    document.getElementById("newPageBtn").addEventListener("click", newPage);
    document.getElementById("pageOutlineToggle")?.addEventListener("click", togglePageOutline);
    document.getElementById("slashMenu")?.addEventListener("mousedown", event => {
        event.preventDefault();
    });
    document.getElementById("blockMenu")?.addEventListener("mousedown", event => {
        event.preventDefault();
    });
    document.getElementById("sidebarResizeHandle")?.addEventListener("mousedown", startSidebarResize);
    document.getElementById("learningPagesResizeHandle")?.addEventListener("mousedown", startLearningPagesResize);
    document.getElementById("pageTitleInput").addEventListener("input", () => {
        rememberActivePageState();
        savePage(false);
    });
    document.getElementById("markdownEditor").addEventListener("input", () => {
        rememberActivePageState();
        applyLiveMarkdownShortcuts();
        BlockEditorModule.syncBlocks();
        updateTableTools();
        renderPageOutline();
        BlockEditorModule.syncSlashMenu();
        savePage(false);
    });
    document.getElementById("markdownEditor").addEventListener("paste", event => {
        rememberActivePageState();
        if (!BlockEditorModule.handlePaste(event)) return;
        BlockEditorModule.syncBlocks();
        updateTableTools();
        renderPageOutline();
        closeSlashMenu();
        savePage(false);
    });
    document.getElementById("markdownEditor").addEventListener("keyup", event => {
        KnowledgeSlashShortcuts.handleKeyup(event, {
            closeMenu: closeSlashMenu,
            syncMenu: () => BlockEditorModule.syncSlashMenu()
        });
        updateTableTools();
    });
    document.getElementById("markdownEditor").addEventListener("click", event => {
        updateTableTools(event.target);
        closeSlashMenu();
    });
    document.getElementById("markdownEditor").addEventListener("mousemove", event => {
        BlockEditorModule.trackHoveredBlock(event.target);
    });
    document.getElementById("markdownEditor").addEventListener("mouseleave", event => {
        if (event.relatedTarget?.closest?.(".block-feature-button, #blockMenu")) return;
        BlockEditorModule.clearHoveredBlock();
    });
    document.getElementById("markdownEditor").addEventListener("dragstart", event => {
        BlockEditorModule.handleDragStart(event);
    });
    document.getElementById("markdownEditor").addEventListener("dragover", event => {
        BlockEditorModule.handleDragOver(event);
    });
    document.getElementById("markdownEditor").addEventListener("drop", event => {
        if (!BlockEditorModule.handleDrop(event)) return;
        renderPageOutline();
        savePage(false);
    });
    document.getElementById("markdownEditor").addEventListener("dragend", () => {
        BlockEditorModule.handleDragEnd();
    });
    document.getElementById("markdownCodeEditor")?.addEventListener("input", () => {
        rememberActivePageState();
        renderPageOutline();
        BlockEditorModule.syncSlashMenu();
        savePage(false);
    });
    document.getElementById("markdownCodeEditor")?.addEventListener("keyup", event => {
        KnowledgeSlashShortcuts.handleKeyup(event, {
            closeMenu: closeSlashMenu,
            syncMenu: () => BlockEditorModule.syncSlashMenu()
        });
    });
    document.getElementById("markdownCodeEditor")?.addEventListener("click", () => {
        closeSlashMenu();
    });
    document.getElementById("createExercisePlusBtn")?.addEventListener("click", () => {
        if (!canCreateExerciseForSkill(selectedPracticeSkill)) {
            setStatus("Skill này chưa có dạng bài tương ứng nên chưa thể tạo bài.");
            return;
        }
        document.getElementById("creationSkillSelect").value = selectedPracticeSkill;
        openPracticeCreation(selectedPracticeSkill);
    });
    document.getElementById("submitExerciseBtn").addEventListener("click", submitExercise);
    document.getElementById("resetAttemptBtn").addEventListener("click", () => runExercise(activeExerciseId));
    document.getElementById("closeRunnerBtn").addEventListener("click", () => showPracticeSkill(selectedPracticeSkill));
    document.getElementById("exerciseCreationForm")?.addEventListener("submit", event => {
        event.preventDefault();
        createExerciseFromCreationPage();
    });
    document.getElementById("creationSkillSelect")?.addEventListener("change", () => {
        updateCreationTypeSelect();
        renderManualQuestionBuilder();
    });
    document.getElementById("creationTypeSelect")?.addEventListener("change", () => renderManualQuestionBuilder());
    document.getElementById("creationModeManualBtn")?.addEventListener("click", () => setCreationMode("manual"));
    document.getElementById("creationModeAiBtn")?.addEventListener("click", () => setCreationMode("ai"));
    document.getElementById("addManualQuestionBtn")?.addEventListener("click", () => {
        const count = document.querySelectorAll("[data-manual-question]").length + 1;
        document.getElementById("manualQuestionList")?.insertAdjacentHTML("beforeend", renderManualQuestionEditorRow(count - 1));
    });
    document.getElementById("fillExerciseAnswersBtn")?.addEventListener("click", async () => {
        if (creationBusy) return;
        const skill = normalizeSkill(document.getElementById("creationSkillSelect")?.value || selectedPracticeSkill);
        const title = document.getElementById("creationTitleInput")?.value.trim() || "Bài tập nháp";
        const prompt = document.getElementById("creationPromptInput")?.value.trim() || "";
        const draft = {
            id: makeId("draft"),
            skill,
            title,
            sourcePrompt: prompt,
            questions: collectManualQuestionsFromBuilder()
        };
        if (!hasMissingExpectedAnswers(draft)) {
            setStatus("Hiện không có đáp án nào bị bỏ trống.");
            return;
        }
        resetCreationActivity("AI đang điền đáp án", "Chuẩn bị");
        appendCreationActivityLog("Đã tìm thấy các ô đáp án còn trống.");
        try {
            const enhanced = await fillMissingExerciseAnswersWithAi(draft);
            populateManualQuestionBuilder(enhanced.questions || []);
            finishCreationActivity("AI đã điền xong đáp án còn trống.");
            setStatus("AI đã điền các đáp án còn trống.");
        } catch (error) {
            console.error(error);
            finishCreationActivity(`Điền đáp án thất bại: ${error.message}`, true);
            setStatus("Không thể dùng AI để điền đáp án lúc này.");
        }
    });
    renderManualQuestionBuilder();
    updateCreationTypeSelect();
    syncCreationModeUi();
    document.getElementById("cancelExerciseCreationBtn")?.addEventListener("click", () => showPracticeSkill(selectedPracticeSkill));
    document.getElementById("reviewRetryBtn")?.addEventListener("click", () => runExercise(activeExerciseId));
    document.getElementById("closeReviewBtn")?.addEventListener("click", () => showPracticeSkill(selectedPracticeSkill));
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
        const breadcrumb = event.target.closest("[data-breadcrumb-view]");
        if (breadcrumb) {
            const view = breadcrumb.dataset.breadcrumbView;
            if (breadcrumb.dataset.breadcrumbExercise) {
                runExercise(breadcrumb.dataset.breadcrumbExercise);
                return;
            }
            if (breadcrumb.dataset.breadcrumbSkill) {
                showPracticeSkill(breadcrumb.dataset.breadcrumbSkill);
                return;
            }
            if (breadcrumb.dataset.breadcrumbPage) {
                selectPage(breadcrumb.dataset.breadcrumbPage);
                return;
            }
            if (view === "practice") showPracticeSkill(selectedPracticeSkill);
            else switchView(view);
            return;
        }
        if (event.target.closest("[data-open-ai-chat]")) {
            openAiChatModal();
            return;
        }
        const headerMarkdownMode = event.target.closest("[data-header-markdown-mode]")?.dataset.headerMarkdownMode;
        if (headerMarkdownMode) {
            BlockEditorModule.setMode(headerMarkdownMode);
            renderPageOutline();
            savePage(false);
            return;
        }
        const headerPracticeSkill = event.target.closest("[data-header-practice-skill]")?.dataset.headerPracticeSkill;
        if (headerPracticeSkill) {
            showPracticeSkill(headerPracticeSkill);
            saveStudio();
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
        const runId = event.target.closest("[data-run-exercise]")?.dataset.runExercise;
        const deleteId = event.target.closest("[data-delete-exercise]")?.dataset.deleteExercise;
        const reviewId = event.target.closest("[data-review-exercise]")?.dataset.reviewExercise;
        const deleteQuestion = event.target.closest("[data-delete-question]")?.dataset.deleteQuestion;
        const duplicateId = event.target.closest("[data-duplicate-exercise]")?.dataset.duplicateExercise;
        const renameId = event.target.closest("[data-rename-exercise]")?.dataset.renameExercise;
        const addManualItem = event.target.closest("[data-add-manual-item]");
        const deleteManualQuestion = event.target.closest("[data-delete-manual-question]");
        const deleteQuestionItem = event.target.closest("[data-delete-question-item]");
        const openMenuId = event.target.closest("[data-open-exercise-menu]")?.dataset.openExerciseMenu;
        const slashCommand = event.target.closest("[data-slash-command]")?.dataset.slashCommand;
        const tableAction = event.target.closest("[data-table-action]")?.dataset.tableAction;
        const outlineTarget = event.target.closest("[data-outline-target]")?.dataset.outlineTarget;
        const blockAction = event.target.closest("[data-block-action]")?.dataset.blockAction;
        const blockColor = event.target.closest("[data-block-color]")?.dataset.blockColor;
        const blockButton = event.target.closest(".block-feature-button");

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
        if (blockButton) {
            BlockEditorModule.toggleBlockMenu();
            return;
        }
        if (blockAction === "delete") {
            if (BlockEditorModule.deleteActiveBlock()) {
                renderPageOutline();
                savePage(false);
            }
            return;
        }
        if (blockColor) {
            if (BlockEditorModule.applyBlockColor(blockColor)) savePage(false);
            return;
        }
        if (!event.target.closest("#slashMenu")) closeSlashMenu();
        if (!event.target.closest("#blockMenu") && !event.target.closest(".block-feature-button")) BlockEditorModule.hideBlockMenu();

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
        if (accordion) AccordionComponent.toggleFromEvent(event);
        if (openMenuId) {
            toggleExerciseMenu(openMenuId);
            return;
        }
        if (runId) {
            closeAllExerciseMenus();
            runExercise(runId);
        }
        if (reviewId) {
            closeAllExerciseMenus();
            openPracticeReview(reviewId);
            return;
        }
        if (deleteId) {
            closeAllExerciseMenus();
            workspace().exercises = workspace().exercises.filter(item => item.id !== deleteId);
            renderPractice();
            saveStudio();
        }
        if (deleteQuestion) {
            const [exerciseId, questionId] = deleteQuestion.split("::");
            const exercise = workspace().exercises.find(item => item.id === exerciseId);
            if (exercise) {
                exercise.questions = (exercise.questions || []).filter(question => question.id !== questionId);
                renderPractice();
                saveStudio();
            }
            return;
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
        if (addManualItem) {
            PracticeQuestionComponent.appendQuestionItemRow(addManualItem.closest("[data-manual-question]"), "manual", selectedPracticeSkill);
            return;
        }
        if (deleteManualQuestion) {
            const card = deleteManualQuestion.closest("[data-manual-question]");
            const list = document.getElementById("manualQuestionList");
            if (!card || !list) return;
            if (list.children.length <= 1) {
                setStatus("Bài tập cần ít nhất 1 câu.");
                return;
            }
            card.remove();
            populateManualQuestionBuilder(collectManualQuestionsFromBuilder());
            return;
        }
        if (deleteQuestionItem) {
            removeQuestionItemRow(deleteQuestionItem);
            return;
        }
    });

    document.addEventListener("change", event => {
        const typeSelect = event.target.closest("[data-manual-type]");
        if (!typeSelect) return;
        const root = typeSelect.closest("[data-manual-question]");
        PracticeQuestionComponent.refreshQuestionItemEditors(root, "manual", selectedPracticeSkill);
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
        if (KnowledgeHistoryShortcuts.handleKeydown(event, {
            insideEditor: Boolean(insideLearningEditor),
            undo: undoActivePageChange,
            redo: redoActivePageChange
        })) {
            event.preventDefault();
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
