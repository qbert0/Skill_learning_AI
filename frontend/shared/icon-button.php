<?php
require_once __DIR__ . '/icons.php';
require_once __DIR__ . '/icon-button-config.php';

function app_icon_button(string $action, array $attrs = []): string
{
    $config = ICON_BUTTON_CONFIG['actions'][$action] ?? [];
    $base = ICON_BUTTON_CONFIG['base'];
    $icon = $attrs['icon'] ?? $config['icon'] ?? 'plus';
    $size = $attrs['size'] ?? $config['size'] ?? $base['size'];
    $variant = $attrs['variant'] ?? $config['variant'] ?? $base['variant'];
    $class = trim(($attrs['class'] ?? '') . ' ' . $base['class'] . ' ' . $base['class'] . '--' . $size . ' ' . $base['class'] . '--' . $variant);
    $title = $attrs['title'] ?? $config['title'] ?? '';
    $id = isset($attrs['id']) ? ' id="' . htmlspecialchars((string)$attrs['id'], ENT_QUOTES, 'UTF-8') . '"' : '';
    $type = htmlspecialchars((string)($attrs['type'] ?? 'button'), ENT_QUOTES, 'UTF-8');
    $extra = '';

    foreach (($attrs['data'] ?? []) as $key => $value) {
        $extra .= ' data-' . htmlspecialchars((string)$key, ENT_QUOTES, 'UTF-8') . '="' . htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8') . '"';
    }

    return '<button' . $id . ' class="' . htmlspecialchars($class, ENT_QUOTES, 'UTF-8') . '" type="' . $type . '" title="' . htmlspecialchars((string)$title, ENT_QUOTES, 'UTF-8') . '"' . $extra . '>' . app_icon($icon) . '</button>';
}
