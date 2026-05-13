<?php
declare(strict_types=1);

require_once __DIR__ . '/core/UiRegion.php';
require_once __DIR__ . '/core/SidebarFrame.php';
require_once __DIR__ . '/core/SidebarItem.php';
require_once __DIR__ . '/core/SidebarHeader.php';
require_once __DIR__ . '/core/SidebarFooter.php';
require_once __DIR__ . '/core/ContentBody.php';
require_once __DIR__ . '/core/ContentHeader.php';
require_once __DIR__ . '/core/OverlayView.php';

final class WorkspaceSidebarHeader extends SidebarHeader
{
}

final class DefaultSidebarFooter extends SidebarFooter
{
}

final class KnowledgeSidebarFrame extends SidebarFrame
{
}

final class ExerciseSidebarFrame extends SidebarFrame
{
    public function __construct(
        string $id,
        string $templatePath,
        string $title,
        private string $panelLabel,
        private string $panelIcon,
        array $items = []
    ) {
        parent::__construct($id, $templatePath, $title, $items);
    }

    public function panelLabel(): string
    {
        return $this->panelLabel;
    }

    public function panelIcon(): string
    {
        return $this->panelIcon;
    }
}

final class StatusSidebarFrame extends SidebarFrame
{
}

final class DefaultSidebarItem extends SidebarItem
{
}

final class DefaultContentBody extends ContentBody
{
}

final class DefaultOverlayView extends OverlayView
{
}

final class DefaultContentHeader extends ContentHeader
{
}

function ui_sidebar_header(): WorkspaceSidebarHeader
{
    return new WorkspaceSidebarHeader(
        'sidebar-header-workspace',
        __DIR__ . '/component/sidebar-header/workspace/view.php'
    );
}

function ui_sidebar_footer(): DefaultSidebarFooter
{
    return new DefaultSidebarFooter(
        'sidebar-footer-default',
        __DIR__ . '/component/sidebar-footer/default/view.php'
    );
}

function ui_sidebar_frames(): array
{
    $exerciseItemTemplate = __DIR__ . '/component/sidebar-frame/exercise-frame/item.php';
    $statusItemTemplate = __DIR__ . '/component/sidebar-frame/status-frame/item.php';
    return [
        new KnowledgeSidebarFrame(
            'knowledge-frame',
            __DIR__ . '/component/sidebar-frame/knowledge-frame/view.php',
            'Khung kiến thức',
            []
        ),
        new ExerciseSidebarFrame(
            'exercise-frame',
            __DIR__ . '/component/sidebar-frame/exercise-frame/view.php',
            'Khung bài tập',
            'Luyện tập',
            'practice',
            [
                new DefaultSidebarItem('practice-foundation', $exerciseItemTemplate, 'practice', 'Ngữ pháp & từ vựng', 'grammar', ['practice-skill' => 'Foundation', 'select-practice-skill' => 'Foundation']),
                new DefaultSidebarItem('practice-listening', $exerciseItemTemplate, 'practice', 'Nghe', 'listening', ['practice-skill' => 'Listening', 'select-practice-skill' => 'Listening']),
                new DefaultSidebarItem('practice-writing', $exerciseItemTemplate, 'practice', 'Viết', 'writing', ['practice-skill' => 'Writing', 'select-practice-skill' => 'Writing']),
                new DefaultSidebarItem('practice-speaking', $exerciseItemTemplate, 'practice', 'Nói', 'speaking', ['practice-skill' => 'Speaking', 'select-practice-skill' => 'Speaking']),
                new DefaultSidebarItem('practice-reading', $exerciseItemTemplate, 'practice', 'Đọc', 'reading', ['practice-skill' => 'Reading', 'select-practice-skill' => 'Reading']),
            ]
        ),
        new StatusSidebarFrame(
            'status-frame',
            __DIR__ . '/component/sidebar-frame/status-frame/view.php',
            'Khung trạng thái',
            [
                new DefaultSidebarItem('analysis-item', $statusItemTemplate, 'analysis', 'Phân tích lỗi', 'analysis'),
                new DefaultSidebarItem('tests-item', $statusItemTemplate, 'tests', 'Bài kiểm tra', 'check'),
            ]
        ),
    ];
}

function ui_content_headers(): array
{
    return [
        new DefaultContentHeader(
            'content-header-breadcrumb',
            __DIR__ . '/component/content-header/breadcrumb/view.php'
        ),
    ];
}

function ui_content_bodies(): array
{
    return [
        new DefaultContentBody(
            'knowledge-page',
            __DIR__ . '/component/content-body/knowledge/view.php',
            'knowledge'
        ),
        new DefaultContentBody(
            'exercise-list-page',
            __DIR__ . '/component/content-body/practice/view.php',
            'practice'
        ),
        new DefaultContentBody(
            'status-pages',
            __DIR__ . '/component/content-body/status/view.php',
            'status-pages'
        ),
    ];
}

function ui_overlay_views(): array
{
    return [
        new DefaultOverlayView(
            'settings-modal',
            __DIR__ . '/component/overlay/settings-modal/view.php'
        ),
        new DefaultOverlayView(
            'ai-chat-modal',
            __DIR__ . '/component/overlay/ai-chat-modal/view.php'
        ),
        new DefaultOverlayView(
            'page-menu',
            __DIR__ . '/component/overlay/page-menu/view.php'
        ),
    ];
}
