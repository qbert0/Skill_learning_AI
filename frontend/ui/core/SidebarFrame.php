<?php
declare(strict_types=1);

abstract class SidebarFrame extends UiRegion
{
    public function __construct(
        string $id,
        string $templatePath,
        private string $title,
        private array $items = []
    ) {
        parent::__construct($id, $templatePath);
    }

    public function title(): string
    {
        return $this->title;
    }

    public function items(): array
    {
        return $this->items;
    }
}
