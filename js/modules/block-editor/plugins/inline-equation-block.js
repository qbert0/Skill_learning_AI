(function registerInlineEquationBlock() {
    BlockPluginRegistry.register({
        id: "inline-equation",
        order: 510,
        group: "inline",
        label: "Inline equation",
        hint: "Equation token",
        icon: "equationBlock",
        aliases: ["equation", "math", "latex"],
        insert: () => "<p><code>E = mc^2</code></p>"
    });
})();
