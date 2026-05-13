<?php
declare(strict_types=1);

abstract class UiRegion
{
    public function __construct(
        private string $id,
        private string $templatePath
    ) {
    }

    public function id(): string
    {
        return $this->id;
    }

    public function templatePath(): string
    {
        return $this->templatePath;
    }

    public function render(array $context = []): void
    {
        extract($context, EXTR_SKIP);
        require $this->templatePath();
    }
}

