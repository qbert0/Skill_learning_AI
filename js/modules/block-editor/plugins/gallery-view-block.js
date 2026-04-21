(function registerGalleryViewBlock() {
    BlockPluginRegistry.register({
        id: "gallery-view",
        order: 330,
        group: "view",
        label: "Gallery view",
        hint: "Card gallery layout",
        icon: "galleryBlock",
        aliases: ["galleryview", "cards view"],
        insert: () => '<div class="gallery-grid"><article><strong>Card 1</strong><p>Preview</p></article><article><strong>Card 2</strong><p>Preview</p></article></div><p><br></p>'
    });
})();
