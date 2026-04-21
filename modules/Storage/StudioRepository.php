<?php
declare(strict_types=1);

namespace App\Storage;

final class StudioRepository
{
    private string $rootPath;

    public function __construct(string $rootPath)
    {
        $this->rootPath = $rootPath;
    }

    public function load(): array
    {
        if ($this->isLegacyFilePath()) {
            if (!file_exists($this->rootPath)) {
                $default = $this->defaultStudio();
                $this->save($default);
                return $default;
            }

            return $this->loadLegacyFile($this->rootPath);
        }

        if (!is_dir($this->rootPath)) {
            $default = $this->defaultStudio();
            $this->save($default);
            return $default;
        }

        $settings = $this->readJson($this->rootPath . DIRECTORY_SEPARATOR . 'settings.json', $this->defaultStudio()['settings']);
        $workspaces = $this->readJson($this->rootPath . DIRECTORY_SEPARATOR . 'workspaces.json', []);
        if (!is_array($workspaces) || !$workspaces) {
            $default = $this->defaultStudio();
            $this->save($default);
            return $default;
        }

        foreach ($workspaces as &$workspace) {
            $workspaceId = (string)($workspace['id'] ?? '');
            $workspace['pages'] = $this->readJson($this->dataFile('trang-hoc', $workspaceId, 'pages.json'), []);
            $workspace['exercises'] = $this->loadExercises($workspaceId);
            $workspace['attempts'] = $this->readJson($this->dataFile('luyen-tap', $workspaceId, 'attempts.json'), []);
            $workspace['mistakes'] = $this->readJson($this->dataFile('phan-tich-loi', $workspaceId, 'mistakes.json'), []);
            $workspace['tests'] = $this->readJson($this->dataFile('bai-tap-tuan', $workspaceId, 'tests.json'), []);
        }

        return $this->normalize([
            'settings' => $settings,
            'workspaces' => $workspaces,
        ]);
    }

    public function save(array $data): void
    {
        $normalized = $this->normalize($data);

        if ($this->isLegacyFilePath()) {
            $this->ensureDir(dirname($this->rootPath));
            $this->writeJson($this->rootPath, $normalized);
            return;
        }

        $this->ensureDir($this->rootPath);
        $settings = $normalized['settings'];
        $workspaces = [];

        foreach ($normalized['workspaces'] as $workspace) {
            $workspaceId = (string)$workspace['id'];
            $workspaces[] = [
                'id' => $workspace['id'],
                'name' => $workspace['name'],
                'language' => $workspace['language'],
            ];

            $this->writeJson($this->dataFile('trang-hoc', $workspaceId, 'pages.json'), array_values($workspace['pages'] ?? []));
            $this->saveExercises($workspaceId, array_values($workspace['exercises'] ?? []));
            $this->writeJson($this->dataFile('luyen-tap', $workspaceId, 'attempts.json'), array_values($workspace['attempts'] ?? []));
            $this->writeJson($this->dataFile('phan-tich-loi', $workspaceId, 'mistakes.json'), array_values($workspace['mistakes'] ?? []));
            $this->writeJson($this->dataFile('bai-tap-tuan', $workspaceId, 'tests.json'), array_values($workspace['tests'] ?? []));
        }

        $this->writeJson($this->rootPath . DIRECTORY_SEPARATOR . 'settings.json', $settings);
        $this->writeJson($this->rootPath . DIRECTORY_SEPARATOR . 'workspaces.json', $workspaces);
        $this->writeJson($this->rootPath . DIRECTORY_SEPARATOR . 'studio.backup.json', $normalized);
    }

    public function defaultStudio(): array
    {
        $now = gmdate('c');

        return [
            'settings' => [
                'dataPath' => 'user_data/studio',
                'aiModel' => 'local-rule-based',
                'learningFontSize' => 14,
                'activeWorkspaceId' => 'ws-english',
            ],
            'workspaces' => [
                [
                    'id' => 'ws-english',
                    'name' => 'English',
                    'language' => 'English',
                    'pages' => [
                        [
                            'id' => 'page-present-perfect',
                            'title' => 'Present perfect notes',
                            'parentId' => null,
                            'folder' => 'Grammar',
                            'tags' => ['grammar', 'speaking'],
                            'markdown' => "# Present perfect\n\nUse `have/has + V3` for experience without a specific time.\n\n- I have visited Seoul twice.\n- She has never tried Japanese curry.",
                            'updatedAt' => $now,
                        ],
                    ],
                    'exercises' => [],
                    'attempts' => [],
                    'mistakes' => [],
                    'tests' => [],
                ],
            ],
        ];
    }

    private function isLegacyFilePath(): bool
    {
        return strtolower(pathinfo($this->rootPath, PATHINFO_EXTENSION)) === 'json';
    }

    private function loadLegacyFile(string $filePath): array
    {
        $content = file_get_contents($filePath);
        $data = json_decode($content ?: '', true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
            throw new \RuntimeException('File studio.json khong phai JSON hop le.');
        }

        return $this->normalize($data);
    }

    private function loadExercises(string $workspaceId): array
    {
        $base = $this->rootPath . DIRECTORY_SEPARATOR . 'luyen-tap' . DIRECTORY_SEPARATOR . $this->safeSegment($workspaceId);
        $skills = ['Grammar', 'Vocabulary', 'Listening', 'Writing', 'Speaking', 'Reading'];
        $items = [];

        foreach ($skills as $skill) {
            $path = $base . DIRECTORY_SEPARATOR . $skill . DIRECTORY_SEPARATOR . 'exercises.json';
            $items = array_merge($items, $this->readJson($path, []));
        }

        return $items;
    }

    private function saveExercises(string $workspaceId, array $exercises): void
    {
        $skills = ['Grammar', 'Vocabulary', 'Listening', 'Writing', 'Speaking', 'Reading'];
        foreach ($skills as $skill) {
            $items = array_values(array_filter($exercises, fn (array $exercise): bool => ($exercise['skill'] ?? 'Grammar') === $skill));
            $this->writeJson($this->dataFile('luyen-tap', $workspaceId, $skill . DIRECTORY_SEPARATOR . 'exercises.json'), $items);
        }
    }

    private function dataFile(string $section, string $workspaceId, string $fileName): string
    {
        return $this->rootPath . DIRECTORY_SEPARATOR . $section . DIRECTORY_SEPARATOR . $this->safeSegment($workspaceId) . DIRECTORY_SEPARATOR . $fileName;
    }

    private function readJson(string $path, array $fallback): array
    {
        if (!file_exists($path)) {
            return $fallback;
        }

        $data = json_decode(file_get_contents($path) ?: '', true);
        return is_array($data) ? $data : $fallback;
    }

    private function writeJson(string $path, array $data): void
    {
        $this->ensureDir(dirname($path));
        $result = file_put_contents($path, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        if ($result === false) {
            throw new \RuntimeException('Khong the ghi file du lieu.');
        }
    }

    private function ensureDir(string $path): void
    {
        if (!is_dir($path)) {
            mkdir($path, 0777, true);
        }
    }

    private function safeSegment(string $value): string
    {
        $safe = preg_replace('/[^A-Za-z0-9_.-]+/', '-', trim($value));
        return trim((string)$safe, '-') ?: 'workspace';
    }

    private function normalize(array $data): array
    {
        $default = $this->defaultStudio();

        if (isset($data['workspaces']) && is_array($data['workspaces'])) {
            return [
                'settings' => array_merge($default['settings'], $data['settings'] ?? []),
                'workspaces' => array_values(array_map(function (array $workspace): array {
                    return [
                        'id' => $workspace['id'] ?? ('ws-' . bin2hex(random_bytes(4))),
                        'name' => $workspace['name'] ?? ($workspace['language'] ?? 'Workspace'),
                        'language' => $workspace['language'] ?? ($workspace['name'] ?? 'English'),
                        'pages' => array_values($workspace['pages'] ?? []),
                        'exercises' => array_values($workspace['exercises'] ?? []),
                        'attempts' => array_values($workspace['attempts'] ?? []),
                        'mistakes' => array_values($workspace['mistakes'] ?? []),
                        'tests' => array_values($workspace['tests'] ?? []),
                    ];
                }, $data['workspaces'])),
            ];
        }

        return $default;
    }
}
