(function registerGalleryBlock() {
    BlockPluginRegistry.register({
        id: "gallery",
        order: 100,
        group: "basic",
        label: "Gallery",
        hint: "Lưới thẻ hình hoặc nội dung",
        icon: "galleryBlock",
        aliases: ["cards", "gallery grid"],
        insert: () => '<div class="gallery-grid"><article><strong>Thẻ 1</strong><p>Nội dung</p></article><article><strong>Thẻ 2</strong><p>Nội dung</p></article></div>'
    });
})();
