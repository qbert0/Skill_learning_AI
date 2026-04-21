# AI Project Context — Personal Language Learning Studio

This project is a personal language learning application designed for one user only. It is not a platform for schools, not a multi-user learning management system, and not a cloud product intended for team collaboration. The software exists to serve a single learner who wants to build a long-term study environment on their own machine, keep their data private, and use AI as a tool to support practice, correction, review, and progress tracking.

The application should run as a local-first web app. Even though the interface is web-based, the data should be stored directly on the user's device instead of relying on a remote database. This matters because the product is meant to feel personal, lightweight, easy to back up, and easy to control. If the user changes computers, they should be able to move their study data simply by moving exported files or copying a local data folder.

The main purpose of the software is to help the learner study multiple languages in a structured but flexible way. At minimum, the project should support languages such as English, Japanese, Chinese, and Korean. More importantly, it should not treat language learning as just vocabulary memorization. It should support the full learning process, including reading, listening, writing, speaking, and grammar or vocabulary foundation. In practice, this means the software should be able to store knowledge, turn that knowledge into exercises, evaluate the learner’s responses, explain mistakes, and then use those mistakes to create better review material later.

A central idea of this project is that the learner must be able to build their own knowledge base in a way that feels close to Notion. Knowledge should not be limited to a rigid list of flashcards or a fixed textbook structure. The user should be able to create notes, examples, grammar summaries, vocabulary collections, writing patterns, mistake logs, reading passages, listening notes, and other study materials in a flexible workspace. These pieces of knowledge should be organized by language, by skill, by topic, or by level, depending on what makes sense for the learner.

For example, the user might create a note called “English Writing — Academic Linking Phrases”, another note called “Chinese HSK4 — Movement Verbs”, and another called “Japanese N3 — Passive Form”. These notes are not only for storage. They are also meant to become the raw material that AI can later use to generate exercises. In other words, knowledge is not passive content inside the system. It is active input for practice generation, error diagnosis, and review planning.

The project should therefore be understood as having three tightly connected layers. The first layer is the personal knowledge workspace, where the learner stores and organizes what they know or what they are currently studying. The second layer is the AI practice engine, which turns stored knowledge and learning history into exercises. The third layer is the feedback and review layer, where AI checks answers, explains what went wrong, identifies repeated weaknesses, and uses that information to create targeted review tasks. The overall loop is simple in spirit: the learner builds knowledge, AI creates exercises from that knowledge, the learner answers them, AI analyzes the results, and the system uses those results to guide future review.

The exercise generation part should not behave randomly. It should generate tasks based on the learner’s real situation. That includes the knowledge already stored in the app, the topics the learner is currently focusing on, the mistakes they have made recently, the skill areas where they are weak, and the parts of their knowledge that seem unstable or easy to forget. If a learner repeatedly makes errors in English conditionals, the system should respond by generating exercises that target conditional sentences. If the learner struggles with Chinese verbs of movement, the system should generate practice that helps reinforce that exact point rather than giving unrelated material.

For instance, if the learner often writes sentences such as “If I will have time, I will go,” the AI should recognize that the problem is not just that the sentence is wrong, but that the user is confusing the structure of the first conditional. A good response from the system would not only mark the answer as incorrect. It should explain that in the if-clause of a first conditional, present simple is used instead of “will”, show the corrected form “If I have time, I will go,” identify the mistake as a grammar-pattern error, and suggest reviewing the rule for English conditionals. That kind of explanation is much more useful than a simple “wrong answer” message.

This leads to another essential part of the project: AI-based grading and explanation. The system should be able to check the learner’s answers, decide whether they are correct, partially correct, or incorrect, and explain the reason clearly. The explanation should ideally answer several questions at once: what is wrong, why it is wrong, how to fix it, what kind of mistake it is, and what knowledge should be reviewed to avoid repeating it. The tone of the feedback should be direct and practical. The goal is not to produce long academic commentary, but to give the learner fast, usable insight.

Beyond individual exercises, the software should also evaluate the learner’s level of completion or mastery for each topic. A topic should not be treated as “done” just because the user read it once or answered one question correctly. The system should estimate progress using repeated performance. Accuracy matters, but so do consistency, repeated mistakes, response stability over time, and the learner’s ability to apply knowledge in a new context. A topic might be considered weak if the learner keeps repeating the same error. It might be considered fairly stable if results are improving but not yet consistent. It might be considered strong if the learner performs well across several sessions with very few repeated mistakes.

The system should also maintain an internal record of mistakes in a structured way. These mistakes should not just be stored as raw logs. They should be classified so that the software can reason about them later. A mistake may belong to a language, a skill, a topic, a grammar point, a vocabulary group, or a general error type such as grammar misuse, wrong word choice, spelling issue, misunderstanding of context, weak recall, or repeated old error. This structure matters because the software is supposed to do more than react to one exercise at a time. It should be able to notice patterns across time.

For example, if the learner makes the same conditional grammar mistake four times in one week, the system should treat that as a high-priority review signal. If the learner forgets three Chinese verbs repeatedly but performs well in Japanese reading, the weekly review should focus more on English grammar and Chinese vocabulary rather than distributing attention equally. The weekly review feature should therefore be intelligent and selective. Its purpose is to create a short but meaningful review set based on what the learner actually needs, not to generate random mixed exercises.

A typical weekly review could include a few English grammar correction questions, several Chinese vocabulary usage questions, one or two Japanese reading tasks, and perhaps a short writing prompt that forces the learner to use structures they handled poorly during the week. The important point is that review must emerge from the learner’s data. The system should always prefer targeted reinforcement over generic drilling.

From a content-editing perspective, the knowledge workspace should be flexible and extensible. A block-based editor is a good fit for this project, especially because it allows the learner to mix many forms of content inside one note. The editor should feel conceptually similar to Notion: a note is made of blocks, and each block can represent a heading, a paragraph, a quote, a table, a callout, a vocabulary card, a grammar note, an example sentence, an exercise snippet, or even a personal mistake annotation. The core editor should not hardcode every content type in a rigid way. Instead, each block type should behave like a plugin with its own rendering logic and data shape, while the core manages ordering, autosave, serialization, and general interaction patterns. This aligns with the block-oriented architecture described in the original block-editor project note. :contentReference[oaicite:1]{index=1}

That architecture is useful here because the learner’s knowledge is diverse. One note may contain a grammar explanation, a table of examples, a warning about a common mistake, and a mini exercise at the end. Another note may be mostly vocabulary cards with usage examples and tags such as HSK4 or N3. By making the editor block-based, the project can grow naturally over time without needing to redesign the entire content system every time a new learning component is added.

A simple example helps illustrate this. A vocabulary block for Chinese might store the word “提高”, its pinyin “tígāo”, its meaning “to improve, to raise”, and example expressions like “提高效率” or “提高水平”. A grammar note block for English might store the title “First Conditional”, the core rule “If + present simple, will + base verb”, a few correct examples, and one or two common mistakes. These are not just visual blocks; they are semantic learning units that AI can later read and reuse when generating exercises. The original block-editor note already frames blocks as plugin-defined content units with their own rendering and serialization behavior, which is a strong conceptual basis for this product. :contentReference[oaicite:2]{index=2}

Because the project is local-first, storage should remain simple. The data may be kept in LocalStorage, IndexedDB, or local files such as JSON, TXT, or Markdown. The exact technical choice can vary, but the principles should remain the same: the data must be readable, easy to export, easy to restore, and independent from any remote database server. Files such as `knowledge.json`, `mistakes.json`, `exercise_history.json`, `weekly_review.json`, and `settings.json` are good examples of what such a system might persist. Import and export should ideally support Markdown with YAML frontmatter, because that format is both machine-friendly and human-readable. It also matches well with the block-editor model from the earlier project description, where content can be serialized into Markdown while preserving metadata. :contentReference[oaicite:3]{index=3}

A typical user flow in this project should feel natural. The learner starts by creating or importing notes. They organize them by language, topic, or skill. Then they either choose a practice mode manually or let AI generate a task set. After completing the tasks, they receive scoring and explanation. The system stores the results, updates the learner’s progress status, records mistakes, and gradually builds a profile of what is stable and what is weak. At the end of the week, the software generates a new review set shaped by that profile. Over time, the application becomes not just a place to keep notes and not just a place to answer questions, but a personal language training environment that learns from the learner’s own history.

When AI is asked to assist inside this project, it should behave less like a generic chatbot and more like a focused language tutor inside a structured study system. It should generate exercises that are relevant to the learner’s actual content, explain answers in a concise but useful way, identify repeated errors rather than treating each answer in isolation, and support long-term review planning. It should avoid producing random material unrelated to the learner’s knowledge unless that is explicitly requested.

In essence, this project is a private, long-term, AI-assisted language learning studio. Its value does not come from having massive amounts of content or serving many users. Its value comes from the fact that the learner builds their own knowledge, AI transforms that knowledge into practice, the system understands the learner’s mistakes, and future review is driven by real learning data instead of guesswork.


Current implementation structure (PHP + vanilla JS)

```text
public/
├── index.php
├── api/
├── assets/
│   └── style.css
├── components/
│   ├── cards/
│   │   └── learning-pages-panel.php
│   ├── editor/
│   │   ├── block-editor.php
│   │   └── page-outline.php
│   ├── layout/
│   │   └── sidebar.php
│   ├── overlays/
│   │   ├── page-menu.php
│   │   └── settings-modal.php
│   ├── pages/
│   │   ├── learning-page.php
│   │   ├── practice-page.php
│   │   └── status-pages.php
│   └── shared/
│       ├── icon-button-config.php
│       ├── icon-button.php
│       ├── icons.php
│       └── search.php
└── js/
    ├── app.js
    ├── components/
    │   ├── cards/
    │   │   └── page-tree-item.js
    │   └── shared/
    │       ├── accordion-component.js
    │       ├── icon-button-config.js
    │       ├── icon-button.js
    │       ├── icon-registry.js
    │       └── search-component.js
    └── modules/
        ├── block-editor.js
        ├── exercise-ui.js
        └── block-editor/
            ├── registry.js
            └── plugins/
                ├── bulleted-list-block.js
                ├── divider-block.js
                ├── gallery-block.js
                ├── heading1-block.js
                ├── heading2-block.js
                ├── heading3-block.js
                ├── numbered-list-block.js
                ├── page-link-block.js
                ├── paragraph-block.js
                ├── table-block.js
                ├── todo-block.js
                └── toggle-block.js
```

Architecture note

- `app.js` is the application manager:
  - manages workspace state and page selection
  - persists local-first data
  - owns page-level undo/redo
  - wires the editor to the page model
- `BlockPluginRegistry` is the single source of truth for registered block types.
- Each block plugin lives in its own file under `js/modules/block-editor/plugins/`.
- `block-editor.js` is the editor runtime:
  - slash menu
  - outline extraction
  - table tools
  - block insertion
  - markdown conversion used by the current editor
- `learning-page.php` should stay as a composition layer, not a place for editor business logic.

Comparison with the original Notion-style target

- The current codebase already matches the intended plugin-based block architecture better than the old monolithic page approach.
- The documentation was behind the code in one important area: the real implementation is PHP component composition plus vanilla JS modules, not a React-style tree.
- The current code is the stronger reference for file structure.
- The architectural intent from this document is still useful for direction:
  - block plugins should stay isolated
  - page state should stay local-first
  - editor infrastructure should keep moving out of page templates

Recommended next architecture upgrades

1. Split markdown parsing and serialization out of `block-editor.js` into dedicated modules.
2. Move page undo/redo from `app.js` into a small history manager if the editor grows further.
3. Keep component-specific CSS close to its PHP component. `assets/style.css` should keep only:
   - design tokens
   - reset/base rules
   - shared layout primitives
   - shared utility classes

Conceptual model

```text
APP MANAGER
  |- workspace state
  |- page selection
  |- local persistence
  |- page history (undo/redo)
  `- editor wiring

BLOCK EDITOR CORE
  |- slash menu
  |- outline builder
  |- table tools
  `- plugin dispatch

BLOCK PLUGINS
  |- paragraph
  |- heading
  |- todo
  |- table
  |- gallery
  `- other block types
```

Terms

| Term | Meaning |
| --- | --- |
| Block | Smallest content unit, such as paragraph, heading, table, or toggle. |
| BlockPlugin | Defines how one block type is inserted, identified, and rendered. |
| BlockRegistry | Central registry for all block plugins. |
| Document | Ordered collection of blocks that make up one learning page. |
| SlashCommand | Menu that appears when the user types `/` and filters block types. |
| Outline | Derived navigation tree from headings in the current page. |
