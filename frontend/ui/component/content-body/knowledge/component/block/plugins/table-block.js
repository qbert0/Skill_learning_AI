(function registerTableBlock() {
    function serializeCell(cell, api) {
        if (!cell) return "";
        if (cell.childNodes?.length) {
            return api.normalizeInlineText(api.inlineHtmlToMarkdown(cell));
        }
        return api.normalizeInlineText(cell.textContent || "");
    }

    function normalizeRowLength(row, columnCount) {
        const values = [...row];
        while (values.length < columnCount) values.push("");
        return values.slice(0, columnCount);
    }

    function buildCells(cells, tagName, api) {
        return cells.map(cell => `<${tagName}>${api.renderInlineMarkdown(cell)}</${tagName}>`).join("");
    }

    function buildTableHtml(sections) {
        return `<table class="knowledge-table">${sections.join("")}</table>`;
    }

    BlockPluginRegistry.register({
        id: "table",
        order: 90,
        group: "basic",
        label: "Table",
        hint: "Bảng có thể thêm/xóa dòng cột",
        icon: "tableBlock",
        aliases: ["grid", "sheet"],
        insert: () => `${buildTableHtml([
            "<thead><tr><th>Cột 1</th><th>Cột 2</th><th>Ghi chú</th></tr></thead>",
            "<tbody><tr><td>Nội dung</td><td>Nội dung</td><td>Nội dung</td></tr><tr><td>Nội dung</td><td>Nội dung</td><td>Nội dung</td></tr></tbody>"
        ])}<p><br></p>`,
        markdownInsert: () => [
            "| Cột 1 | Cột 2 | Ghi chú |",
            "| --- | --- | --- |",
            "| Nội dung | Nội dung | Nội dung |"
        ].join("\n"),
        transform: {
            matches: element => element.tagName?.toUpperCase() === "TABLE",
            toMarkdown: (element, api) => {
                const headRows = [...(element.querySelectorAll?.("thead tr") || [])];
                const bodyRows = [...(element.querySelectorAll?.("tbody tr") || [])];
                const allRows = [...(element.querySelectorAll?.("tr") || [])];
                const rows = (headRows.length || bodyRows.length ? [...headRows, ...bodyRows] : allRows)
                    .map(row => [...(row.cells || [])].map(cell => serializeCell(cell, api)))
                    .filter(row => row.length);

                if (!rows.length) return "";

                const hasHeader = headRows.length > 0 || [...(allRows[0]?.cells || [])].every(cell => cell.tagName?.toUpperCase?.() === "TH");
                const columnCount = Math.max(...rows.map(row => row.length));
                const normalizedRows = rows.map(row => normalizeRowLength(row, columnCount));

                if (hasHeader) {
                    const [header, ...body] = normalizedRows;
                    const separator = header.map(() => ":---");
                    return [
                        `| ${header.join(" | ")} |`,
                        `| ${separator.join(" | ")} |`,
                        ...body.map(row => `| ${row.join(" | ")} |`)
                    ].join("\n");
                }

                return [
                    "|".repeat(columnCount + 1),
                    ...normalizedRows.map(row => `| ${row.join(" | ")} |`)
                ].join("\n");
            },
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (api.isMarkdownTableDeclaration(trimmed)) {
                    const columnCount = trimmed.replace(/\s/g, "").length - 1;
                    const rows = [];
                    let cursor = index + 1;

                    while (cursor < lines.length && api.isMarkdownTableRow(lines[cursor].trim())) {
                        rows.push(normalizeRowLength(api.splitMarkdownTableRow(lines[cursor].trim()), columnCount));
                        cursor += 1;
                    }

                    if (!rows.length) return null;

                    return {
                        matched: true,
                        nextIndex: cursor - 1,
                        html: buildTableHtml([
                            `<tbody>${rows.map(row => `<tr>${buildCells(row, "td", api)}</tr>`).join("")}</tbody>`
                        ])
                    };
                }

                if (!(api.isMarkdownTableRow(trimmed) && api.isMarkdownTableSeparator(lines[index + 1]?.trim() || ""))) return null;

                const header = api.splitMarkdownTableRow(trimmed);
                const columnCount = header.length;
                const body = [];
                let cursor = index + 2;

                while (cursor < lines.length && api.isMarkdownTableRow(lines[cursor].trim())) {
                    body.push(normalizeRowLength(api.splitMarkdownTableRow(lines[cursor].trim()), columnCount));
                    cursor += 1;
                }

                return {
                    matched: true,
                    nextIndex: cursor - 1,
                    html: buildTableHtml([
                        `<thead><tr>${buildCells(header, "th", api)}</tr></thead>`,
                        `<tbody>${body.map(row => `<tr>${buildCells(row, "td", api)}</tr>`).join("")}</tbody>`
                    ])
                };
            }
        }
    });
})();
