<?php
declare(strict_types=1);

abstract class SidebarItem extends UiRegion
{
    public function __construct(
        string $id,
        string $templatePath,
        private ?string $targetView,
        private string $label,
        private string $icon,
        private array $data = []
    ) {
        parent::__construct($id, $templatePath);
    }

    public function targetView(): ?string
    {
        return $this->targetView;
    }

    public function label(): string
    {
        return $this->label;
    }

    public function icon(): string
    {
        return $this->icon;
    }

    public function data(): array
    {
        return $this->data;
    }
}
