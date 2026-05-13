<?php
declare(strict_types=1);

abstract class ContentBody extends UiRegion
{
    public function __construct(
        string $id,
        string $templatePath,
        private string $viewKey
    ) {
        parent::__construct($id, $templatePath);
    }

    public function viewKey(): string
    {
        return $this->viewKey;
    }
}
