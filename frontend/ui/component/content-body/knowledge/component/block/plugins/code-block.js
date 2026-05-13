(function registerCodeBlock() {
    BlockPluginRegistry.register({
        id: "code",
        order: 240,
        group: "media",
        label: "Code",
        hint: "Code snippet",
        icon: "codeBlock",
        aliases: ["snippet", "pre"],
        insert: () => "<pre><code>// code</code></pre><p><br></p>",
        transform: {
            matches: element => element.tagName?.toUpperCase() === "PRE",
            toMarkdown: element => `\`\`\`\n${(element.textContent || "").trim()}\n\`\`\``,
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith("```")) return null;
                const codeLines = [];
                let cursor = index + 1;
                while (cursor < lines.length && !lines[cursor].trim().startsWith("```")) {
                    codeLines.push(lines[cursor]);
                    cursor += 1;
                }
                return {
                    matched: true,
                    nextIndex: cursor,
                    html: `<pre><code>${api.escapeHtml(codeLines.join("\n"))}</code></pre>`
                };
            }
        }
    });
})();
