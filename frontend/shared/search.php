<?php
function app_search(string $id, string $placeholder, string $className = 'component-search'): void
{
    ?>
    <div class="<?php echo htmlspecialchars($className, ENT_QUOTES, 'UTF-8'); ?>" data-search-component>
        <?php echo app_icon('analysis'); ?>
        <input id="<?php echo htmlspecialchars($id, ENT_QUOTES, 'UTF-8'); ?>" type="search" placeholder="<?php echo htmlspecialchars($placeholder, ENT_QUOTES, 'UTF-8'); ?>">
    </div>
    <?php
}
