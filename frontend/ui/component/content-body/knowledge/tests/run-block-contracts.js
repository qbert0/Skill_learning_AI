const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const results = [];

function loadScript(relativePath, sandbox) {
    const absolutePath = path.resolve(root, relativePath);
    const source = fs.readFileSync(absolutePath, "utf8");
    vm.runInContext(source, sandbox, { filename: absolutePath });
    sandbox.KnowledgeBlockCore = sandbox.window.KnowledgeBlockCore;
    sandbox.KnowledgeBlockTransform = sandbox.window.KnowledgeBlockTransform;
    sandbox.KnowledgeBlockFeature = sandbox.window.KnowledgeBlockFeature;
    sandbox.KnowledgeBlockRegistry = sandbox.window.KnowledgeBlockRegistry;
    sandbox.BlockPluginRegistry = sandbox.window.BlockPluginRegistry;
    sandbox.BlockEditorModule = sandbox.window.BlockEditorModule;
}

function createSandbox() {
    const sandbox = {
        window: {},
        console,
        Node: { ELEMENT_NODE: 1 },
        setTimeout,
        clearTimeout
    };
    vm.createContext(sandbox);
    loadScript("core/block.js", sandbox);
    loadScript("core/block-transform.js", sandbox);
    loadScript("core/block-feature.js", sandbox);
    loadScript("component/block/registry.js", sandbox);
    [
        "component/block/plugins/paragraph-block.js",
        "component/block/plugins/heading1-block.js",
        "component/block/plugins/heading2-block.js",
        "component/block/plugins/heading3-block.js",
        "component/block/plugins/heading4-block.js",
        "component/block/plugins/bulleted-list-block.js",
        "component/block/plugins/numbered-list-block.js",
        "component/block/plugins/todo-block.js",
        "component/block/plugins/toggle-block.js",
        "component/block/plugins/table-block.js",
        "component/block/plugins/divider-block.js",
        "component/block/plugins/code-block.js",
        "component/block/plugins/image-block.js",
        "component/block/plugins/audio-block.js",
        "component/block/plugins/video-block.js",
        "component/block/plugins/board-view-block.js",
        "component/block/plugins/calendar-view-block.js",
        "core/block-editor.js"
    ].forEach(file => loadScript(file, sandbox));
    return sandbox;
}

function scenario(name, run) {
    try {
        run();
        results.push({ name, ok: true });
    } catch (error) {
        results.push({ name, ok: false, error });
    }
}

scenario("KnowledgeBlockCore define applies defaults", () => {
    const sandbox = createSandbox();
    const block = sandbox.KnowledgeBlockCore.define({ id: "demo" });
    assert.equal(block.group, "basic");
    assert.equal(block.icon, "file");
    assert.deepEqual(Array.from(block.aliases), []);
});

scenario("wrapper block keeps child semantic type through block feature", () => {
    const sandbox = createSandbox();
    const wrapper = {
        nodeType: 1,
        classList: { contains: name => name === "knowledge-block" }
    };
    sandbox.KnowledgeBlockFeature.semanticRoot = () => ({
        nodeType: 1,
        classList: { contains: () => false },
        tagName: "TABLE",
        querySelector: () => null
    });
    assert.equal(sandbox.KnowledgeBlockRegistry.detectType(wrapper), "table");
});

scenario("markdownToHtml groups bullet items", () => {
    const sandbox = createSandbox();
    const html = sandbox.BlockEditorModule.__test.markdownToHtml("- A\n- B\n- C");
    assert.match(html, /^<ul><li>A<\/li><li>B<\/li><li>C<\/li><\/ul>$/);
});

scenario("markdownToHtml preserves inline markdown", () => {
    const sandbox = createSandbox();
    const html = sandbox.BlockEditorModule.__test.markdownToHtml("Xin **chào** *bạn* với `code` và ~~gạch~~");
    assert.match(html, /<strong>chào<\/strong>/);
    assert.match(html, /<em>bạn<\/em>/);
    assert.match(html, /<code>code<\/code>/);
    assert.match(html, /<del>gạch<\/del>/);
});

scenario("markdownToHtml parses tables", () => {
    const sandbox = createSandbox();
    const html = sandbox.BlockEditorModule.__test.markdownToHtml([
        "| Khẳng định | Phủ định | Nghi vấn |",
        "| :--- | :--- | :--- |",
        "| I/You/We/They **play** | I/You/We/They **do not play** | **Do** I/you/we/they **play**? |",
        "| He/She/It **plays** | He/She/It **does not play** | **Does** he/she/it **play**? |"
    ].join("\n"));
    assert.match(html, /<table class="knowledge-table">/);
    assert.match(html, /<th>Khẳng định<\/th>/);
    assert.match(html, /<strong>play<\/strong>/);
    assert.match(html, /<strong>Does<\/strong>/);
});

scenario("markdownToHtml supports shorthand table declarations", () => {
    const sandbox = createSandbox();
    const html = sandbox.BlockEditorModule.__test.markdownToHtml([
        "||||",
        "| I/you/we/they **play** | I/you/we/they do not play | Do I/you/we/they play? |",
        "| He/she/it **plays** | He/she/it does not play | Does he/she/it play? |"
    ].join("\n"));
    assert.match(html, /<table class="knowledge-table"><tbody>/);
    assert.doesNotMatch(html, /<thead>/);
    assert.match(html, /<strong>plays<\/strong>/);
});

scenario("markdownToHtml cleans old block feature artifacts before parsing tables", () => {
    const sandbox = createSandbox();
    const html = sandbox.BlockEditorModule.__test.markdownToHtml([
        "::::::::# Hiện tại đơn",
        "::::::::| Khẳng định | Phủ định | Nghi vấn |",
        "::::::::| :--- | :--- | :--- |",
        "::::::::| I/You/We/They **play** | I/You/We/They do not play | Do I/you/we/they play? |"
    ].join("\n"));
    assert.match(html, /<h1>Hiện tại đơn<\/h1>/);
    assert.match(html, /<table class="knowledge-table">/);
    assert.match(html, /<strong>play<\/strong>/);
});

scenario("markdownToHtml continues parsing after single-line blocks before a table", () => {
    const sandbox = createSandbox();
    const html = sandbox.BlockEditorModule.__test.markdownToHtml([
        "# Hiện tại đơn",
        "| Khẳng định | Phủ định | Nghi vấn |",
        "| :--- | :--- | :--- |",
        "| I/You/We/They **play** | I/You/We/They do not play | Do I/you/we/they play? |"
    ].join("\n"));
    assert.match(html, /<h1>Hiện tại đơn<\/h1>/);
    assert.match(html, /<table class="knowledge-table">/);
});

scenario("public block editor markdownToHtml delegates to block transforms only", () => {
    const sandbox = createSandbox();
    const html = sandbox.BlockEditorModule.markdownToHtml([
        "||||",
        "| I/you/we/they **play** | I/you/we/they do not play | Do I/you/we/they play? |"
    ].join("\n"));
    assert.match(html, /<table class="knowledge-table"><tbody>/);
    assert.match(html, /<strong>play<\/strong>/);
});

scenario("markdownToHtml preserves raw html for legacy child blocks without transforms", () => {
    const sandbox = createSandbox();
    const html = sandbox.BlockEditorModule.__test.markdownToHtml([
        '<blockquote><strong>Callout</strong><p>Important note.</p></blockquote>',
        '<div class="gallery-grid"><article><strong>Progress</strong><p>82%</p></article></div>'
    ].join("\n"));
    assert.match(html, /<blockquote><strong>Callout<\/strong><p>Important note\.<\/p><\/blockquote>/);
    assert.match(html, /<div class="gallery-grid"><article><strong>Progress<\/strong><p>82%<\/p><\/article><\/div>/);
});

scenario("table block serializes body-only tables with shorthand declaration", () => {
    const sandbox = createSandbox();
    const markdown = sandbox.BlockPluginRegistry.get("table").transform.toMarkdown({
        querySelectorAll: selector => {
            if (selector === "thead tr") return [];
            if (selector === "tbody tr") {
                return [
                    {
                        cells: [
                            { childNodes: [{ nodeType: 3, textContent: "I/you/we/they " }, { nodeType: 1, tagName: "STRONG", childNodes: [{ nodeType: 3, textContent: "play" }] }] },
                            { textContent: "I/you/we/they do not play" },
                            { textContent: "Do I/you/we/they play?" }
                        ]
                    },
                    {
                        cells: [
                            { childNodes: [{ nodeType: 3, textContent: "He/she/it " }, { nodeType: 1, tagName: "STRONG", childNodes: [{ nodeType: 3, textContent: "plays" }] }] },
                            { textContent: "He/she/it does not play" },
                            { textContent: "Does he/she/it play?" }
                        ]
                    }
                ];
            }
            if (selector === "tr") {
                return [
                    {
                        cells: [
                            { tagName: "TD", childNodes: [{ nodeType: 3, textContent: "I/you/we/they " }, { nodeType: 1, tagName: "STRONG", childNodes: [{ nodeType: 3, textContent: "play" }] }] },
                            { tagName: "TD", textContent: "I/you/we/they do not play" },
                            { tagName: "TD", textContent: "Do I/you/we/they play?" }
                        ]
                    },
                    {
                        cells: [
                            { tagName: "TD", childNodes: [{ nodeType: 3, textContent: "He/she/it " }, { nodeType: 1, tagName: "STRONG", childNodes: [{ nodeType: 3, textContent: "plays" }] }] },
                            { tagName: "TD", textContent: "He/she/it does not play" },
                            { tagName: "TD", textContent: "Does he/she/it play?" }
                        ]
                    }
                ];
            }
            return [];
        }
    }, sandbox.KnowledgeBlockTransform);
    assert.equal(markdown, [
        "||||",
        "| I/you/we/they **play** | I/you/we/they do not play | Do I/you/we/they play? |",
        "| He/she/it **plays** | He/she/it does not play | Does he/she/it play? |"
    ].join("\n"));
});

scenario("todo block serializes checklist", () => {
    const sandbox = createSandbox();
    const plugin = sandbox.BlockPluginRegistry.get("todo");
    const markdown = plugin.transform.toMarkdown({
        querySelectorAll: () => [
            {
                querySelector: selector => {
                    if (selector === 'input[type="checkbox"]') return { checked: true };
                    if (selector === "span") return { textContent: "Việc A" };
                    return null;
                },
                textContent: "Việc A"
            }
        ]
    }, sandbox.KnowledgeBlockTransform);
    assert.equal(markdown, "- [x] Việc A");
});

scenario("toggle block inserts custom syntax", () => {
    const sandbox = createSandbox();
    const plugin = sandbox.BlockPluginRegistry.get("toggle");
    assert.equal(plugin.markdownInsert(), ":::toggle Tiêu đề toggle\nNội dung bên trong\n:::");
});

scenario("complex blocks define explicit toMarkdown", () => {
    const sandbox = createSandbox();
    ["code", "audio", "board-view", "calendar-view", "todo"].forEach(id => {
        assert.equal(typeof sandbox.BlockPluginRegistry.get(id).transform?.toMarkdown, "function");
    });
});

scenario("board view persists as custom syntax", () => {
    const sandbox = createSandbox();
    const markdown = sandbox.BlockPluginRegistry.get("board-view").transform.toMarkdown({
        querySelectorAll: () => [
            {
                querySelector: selector => selector === "strong" ? { textContent: "Todo" } : null,
                querySelectorAll: selector => selector === "p" ? [{ textContent: "Task 1" }, { textContent: "Task 2" }] : []
            }
        ]
    }, sandbox.KnowledgeBlockTransform);
    assert.equal(markdown, ":::board-view\nTodo | Task 1 | Task 2\n:::");
});

scenario("calendar view persists as custom syntax", () => {
    const sandbox = createSandbox();
    const markdown = sandbox.BlockPluginRegistry.get("calendar-view").transform.toMarkdown({
        querySelectorAll: () => [
            { cells: [{ textContent: "Mon" }, { textContent: "Tue" }] },
            { cells: [{ textContent: "Review" }, { textContent: "Practice" }] }
        ]
    }, sandbox.KnowledgeBlockTransform);
    assert.equal(markdown, ":::calendar-view\n| Mon | Tue |\n| Review | Practice |\n:::");
});

const failed = results.filter(result => !result.ok);
results.forEach(result => {
    if (result.ok) {
        console.log(`PASS ${result.name}`);
        return;
    }
    console.error(`FAIL ${result.name}`);
    console.error(result.error);
});

if (failed.length) {
    process.exitCode = 1;
} else {
    console.log(`All ${results.length} block scenarios passed.`);
}
