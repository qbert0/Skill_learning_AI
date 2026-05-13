<?php
function app_icon(string $name): string
{
    $icons = [
        'menu' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
        'edit' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.5 4 4-.5L19 8.5 15.5 5 4 16.5Z"/><path d="m14 6 4 4"/></svg>',
        'plus' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
        'library' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h7v14H4zM13 5h7v14h-7z"/><path d="M7.5 8h0M16.5 8h0"/></svg>',
        'practice' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16"/><path d="m6 15 9.5-9.5L19 9 9.5 18.5H6z"/></svg>',
        'analysis' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9M12 19V5M19 19v-7"/></svg>',
        'check' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
        'grammar' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14M5 12h10M5 19h7"/><path d="M17 16l2 2 3-4"/></svg>',
        'vocabulary' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h7a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z"/><path d="M20 5h-6a3 3 0 0 0-3 3"/></svg>',
        'listening' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v4a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2M20 13v4a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2"/></svg>',
        'writing' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M6 16l9.5-9.5L19 10 9.5 19.5H6z"/></svg>',
        'speaking' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v3a4 4 0 0 0 4 4Z"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/></svg>',
        'reading' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h7a3 3 0 0 1 3 3v10a3 3 0 0 0-3-3H4z"/><path d="M20 6h-6a3 3 0 0 0-3 3v10"/></svg>',
        'chevron-down' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
        'close' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
        'settings' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7.8 7.8 0 0 0-2-1.2L14.2 3h-4.4l-.4 2.7a7.8 7.8 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7.8 7.8 0 0 0 2 1.2l.4 2.7h4.4l.4-2.7a7.8 7.8 0 0 0 2-1.2l2.4 1 2-3.4-2-1.5c0-.4.1-.8.1-1.2Z"/></svg>',
        'file' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/></svg>',
        'folder' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h7l2 2h9v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
        'more' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h.01M12 12h.01M18 12h.01"/></svg>',
    ];

    return '<span class="app-icon" data-icon="' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '">' . ($icons[$name] ?? $icons['file']) . '</span>';
}
