(function registerTodoBlock() {
    BlockPluginRegistry.register({
        id: "todo",
        order: 50,
        group: "basic",
        label: "To-do list",
        hint: "Checkbox",
        icon: "todoList",
        aliases: ["checklist", "task", "todo"],
        insert: () => '<ul class="checklist-block"><li><label><input type="checkbox"><span>Việc cần làm</span></label></li></ul>',
        markdownInsert: () => "- [ ] Việc cần làm",
        transform: {
            matches: element => element.tagName?.toUpperCase() === "UL" && element.classList.contains("checklist-block"),
            toMarkdown: (element, api) => [...element.querySelectorAll(":scope > li")].map(item => {
                const input = item.querySelector('input[type="checkbox"]');
                const labelText = item.querySelector("span");
                const textValue = api.normalizeInlineText(
                    labelText?.childNodes?.length
                        ? api.inlineHtmlToMarkdown(labelText)
                        : (labelText?.textContent || item.textContent || "")
                );
                return `- [${input?.checked ? "x" : " "}] ${textValue}`;
            }).join("\n"),
            fromMarkdown: ({ lines, index, trimmed, api }) => {
                if (!trimmed.startsWith("- [")) return null;
                const result = api.consumeSequential(lines, index, line => line.match(/^- \[([ xX])\] (.+)$/), match => ({
                    checked: match[1].toLowerCase() === "x",
                    text: match[2]
                }));
                return {
                    matched: true,
                    nextIndex: result.nextIndex,
                    html: `<ul class="checklist-block">${result.items.map(item => `<li><label><input type="checkbox" ${item.checked ? "checked" : ""}><span>${api.renderInlineMarkdown(item.text)}</span></label></li>`).join("")}</ul>`
                };
            }
        }
    });
})();
