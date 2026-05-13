<?php
$attributes = '';
foreach ($item->data() as $name => $value) {
    $attributes .= ' data-' . htmlspecialchars((string)$name, ENT_QUOTES, 'UTF-8') . '="' . htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8') . '"';
}
?>
<button
    class="nav-item <?php echo (($activeView ?? 'knowledge') === ($item->targetView() ?? '')) ? 'active' : ''; ?>"
    <?php if ($item->targetView() !== null): ?>
        data-view="<?php echo htmlspecialchars($item->targetView(), ENT_QUOTES, 'UTF-8'); ?>"
    <?php endif; ?>
    <?php echo $attributes; ?>
    title="<?php echo htmlspecialchars($item->label(), ENT_QUOTES, 'UTF-8'); ?>"
>
    <?php echo app_icon($item->icon()); ?>
    <span><?php echo htmlspecialchars($item->label(), ENT_QUOTES, 'UTF-8'); ?></span>
</button>
