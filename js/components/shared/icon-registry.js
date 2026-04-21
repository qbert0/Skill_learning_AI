window.IconRegistry = (() => {
    const icons = {
        chevronRight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
        chevronDown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
        file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/></svg>',
        folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h7l2 2h9v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
        more: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h.01M12 12h.01M18 12h.01"/></svg>',
        plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
        check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
        grammar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14M5 12h10M5 19h7"/><path d="M17 16l2 2 3-4"/></svg>',
        vocabulary: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h7a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z"/><path d="M20 5h-6a3 3 0 0 0-3 3"/></svg>',
        listening: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v4a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2M20 13v4a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2"/></svg>',
        writing: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M6 16l9.5-9.5L19 10 9.5 19.5H6z"/></svg>',
        speaking: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v3a4 4 0 0 0 4 4Z"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4"/></svg>',
        reading: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h7a3 3 0 0 1 3 3v10a3 3 0 0 0-3-3H4z"/><path d="M20 6h-6a3 3 0 0 0-3 3v10"/></svg>',
        settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7.8 7.8 0 0 0-2-1.2L14.2 3h-4.4l-.4 2.7a7.8 7.8 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7.8 7.8 0 0 0 2 1.2l.4 2.7h4.4l.4-2.7a7.8 7.8 0 0 0 2-1.2l2.4 1 2-3.4-2-1.5c0-.4.1-.8.1-1.2Z"/></svg>'
        ,
        paragraph: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h10"/></svg>',
        heading1: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6v12M11 6v12M5 12h6"/><path d="M17 8v8M16 16h3"/></svg>',
        heading2: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6v12M11 6v12M5 12h6"/><path d="M16 10c0-1.1.9-2 2-2s2 .9 2 2c0 .7-.3 1.2-.9 1.8L16 16h4"/></svg>',
        heading3: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6v12M11 6v12M5 12h6"/><path d="M16 9.5c.4-.8 1.1-1.5 2-1.5 1.1 0 2 .9 2 2 0 .8-.4 1.4-1.1 1.8.8.3 1.4 1 1.4 2 0 1.2-.9 2.2-2.2 2.2-1 0-1.9-.6-2.3-1.5"/></svg>',
        heading4: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6v12M11 6v12M5 12h6"/><path d="M18 8v8M15 13h6"/></svg>',
        todoList: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 7 2 2 3-3"/><path d="M11 7h9M11 12h9M11 17h9"/><path d="m4 16 2 2 3-3"/></svg>',
        bulletedList: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7h11M8 12h11M8 17h11"/><circle cx="4.5" cy="7" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17" r="1"/></svg>',
        numberedList: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 7h10M10 12h10M10 17h10"/><path d="M4 7h1v4"/><path d="M3.8 12.5h2.4L4 15l2.2 2"/><path d="M3.8 17.2c.3-.5.8-.8 1.4-.8.8 0 1.4.5 1.4 1.2 0 .6-.3 1-.9 1.2.6.2 1 .6 1 1.2 0 .8-.7 1.4-1.6 1.4-.7 0-1.2-.2-1.6-.7"/></svg>',
        toggleBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 6 8 6-8 6"/><path d="M5 6h2M5 18h2"/></svg>',
        pageBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/><path d="M10 12h5M10 16h4"/></svg>',
        calloutBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v4M12 17h.01"/></svg>',
        quoteBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9H4v5h4V9Zm12 0h-4v5h4V9Z"/><path d="M8 14c0 2-1.3 3.4-3.5 4M20 14c0 2-1.3 3.4-3.5 4"/></svg>',
        tableBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="1"/><path d="M4 10h16M10 5v14M15 5v14"/></svg>',
        galleryBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="7" height="6" rx="1"/><rect x="13" y="5" width="7" height="6" rx="1"/><rect x="4" y="13" width="7" height="6" rx="1"/><rect x="13" y="13" width="7" height="6" rx="1"/></svg>',
        dividerBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16"/><path d="M4 8h3M17 8h3M4 16h3M17 16h3"/></svg>',
        pageLink: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a4 4 0 0 1 0-6l1.5-1.5a4 4 0 0 1 5.6 5.6L16 12"/><path d="M14 11a4 4 0 0 1 0 6l-1.5 1.5a4 4 0 1 1-5.6-5.6L8 12"/></svg>',
        imageBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="1"/><circle cx="9" cy="10" r="1.5"/><path d="m7 17 4-4 3 3 3-2 3 3"/></svg>',
        videoBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="2"/><path d="m17 10 4-2v8l-4-2z"/></svg>',
        audioBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14a3 3 0 0 0 3 3h1l5 4V3L10 7H9a3 3 0 0 0-3 3v4Z"/><path d="M18 9a4 4 0 0 1 0 6"/></svg>',
        codeBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/></svg>',
        fileBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/><path d="M10 12h5M10 16h4"/></svg>',
        boardView: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="4" height="14" rx="1"/><rect x="10" y="8" width="4" height="11" rx="1"/><rect x="16" y="6" width="4" height="13" rx="1"/></svg>',
        listView: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7h12M8 12h12M8 17h12"/><circle cx="4.5" cy="7" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17" r="1"/></svg>',
        feedView: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="4" rx="1"/><rect x="4" y="11" width="16" height="4" rx="1"/><rect x="4" y="17" width="10" height="2" rx="1"/></svg>',
        dashboardView: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="4" rx="1"/><rect x="13" y="10" width="7" height="10" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/></svg>',
        calendarView: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="1"/><path d="M4 10h16M8 3v4M16 3v4"/></svg>',
        timelineView: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><circle cx="7" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="17" cy="12" r="2"/></svg>',
        mapView: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18-5 2V6l5-2 6 2 5-2v14l-5 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>',
        barChartVertical: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16"/><rect x="6" y="11" width="3" height="8"/><rect x="11" y="7" width="3" height="12"/><rect x="16" y="4" width="3" height="15"/></svg>',
        barChartHorizontal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5v14"/><rect x="7" y="6" width="11" height="3"/><rect x="7" y="11" width="8" height="3"/><rect x="7" y="16" width="13" height="3"/></svg>',
        lineChart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h16"/><path d="m5 15 4-4 4 2 6-7"/></svg>',
        numberChart: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M9 9h6M9 13h4"/></svg>',
        equationBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12M6 16h12M8 12h8"/></svg>',
        emojiBlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01"/><path d="M8.5 15c1 .9 2.1 1.5 3.5 1.5s2.5-.6 3.5-1.5"/></svg>'
    };

    function svg(name) {
        return `<span class="app-icon">${icons[name] || icons.file}</span>`;
    }

    function replaceTextIcons(root = document) {
        root.querySelectorAll("[data-icon]").forEach(target => {
            const name = target.dataset.icon;
            if (icons[name]) target.innerHTML = icons[name];
        });
    }

    return { svg, replaceTextIcons };
})();
