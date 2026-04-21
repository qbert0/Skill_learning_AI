(function registerImageBlock() {
    BlockPluginRegistry.register({
        id: "image",
        order: 210,
        group: "media",
        label: "Image",
        hint: "Image placeholder",
        icon: "imageBlock",
        aliases: ["photo", "picture"],
        insert: () => '<figure><img src="https://placehold.co/960x540?text=Image" alt="Image"><figcaption>Image caption</figcaption></figure><p><br></p>'
    });
})();
