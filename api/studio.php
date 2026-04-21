<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use App\AI\AiClient;
use App\AI\AiModelRegistry;
use App\Exercises\ExerciseGenerator;
use App\Grading\AnswerGrader;
use App\Storage\StudioRepository;

function normalizeDataFolderInput(string $path): string
{
    $path = trim($path) ?: 'user_data/studio';
    $path = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);

    if (strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'json') {
        $path = preg_replace('/\.json$/i', '', $path) ?: 'user_data/studio';
    }

    return $path;
}

function resolveDataPath(string $path): string
{
    $path = normalizeDataFolderInput($path);

    if (preg_match('/^[A-Za-z]:\\\\/', $path) === 1) {
        return $path;
    }

    return APP_ROOT . DIRECTORY_SEPARATOR . ltrim($path, DIRECTORY_SEPARATOR);
}

function activeDataPath(): string
{
    $configPath = USER_DATA_DIR . DIRECTORY_SEPARATOR . 'config.json';
    if (!file_exists($configPath)) {
        return USER_DATA_DIR . DIRECTORY_SEPARATOR . 'studio';
    }

    $config = json_decode(file_get_contents($configPath) ?: '{}', true);
    $relative = is_array($config) ? (string)($config['dataPath'] ?? 'user_data/studio') : 'user_data/studio';
    return resolveDataPath($relative);
}

function rememberDataPath(string $path): void
{
    $configPath = USER_DATA_DIR . DIRECTORY_SEPARATOR . 'config.json';
    file_put_contents($configPath, json_encode(['dataPath' => normalizeDataFolderInput($path)], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function migrateLegacyStudioIfNeeded(string $folderPath): void
{
    if (is_dir($folderPath)) {
        return;
    }

    $legacyPath = $folderPath . '.json';
    if (!file_exists($legacyPath)) {
        return;
    }

    $legacyRepository = new StudioRepository($legacyPath);
    $folderRepository = new StudioRepository($folderPath);
    $data = $legacyRepository->load();
    $data['settings']['dataPath'] = str_replace(APP_ROOT . DIRECTORY_SEPARATOR, '', $folderPath);
    $folderRepository->save($data);
}

$activePath = activeDataPath();
migrateLegacyStudioIfNeeded($activePath);
$repository = new StudioRepository($activePath);
$modelRegistry = new AiModelRegistry();
$aiClient = new AiClient($modelRegistry);
$exerciseGenerator = new ExerciseGenerator($aiClient);
$answerGrader = new AnswerGrader($aiClient);
$action = $_GET['action'] ?? 'load';

try {
    if ($action === 'load') {
        sendJson([
            'success' => true,
            'data' => $repository->load(),
            'models' => $modelRegistry->all(),
        ]);
    }

    if ($action === 'save') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Method not allowed.'], 405);
        }

        $data = readJsonBody();
        $dataPath = normalizeDataFolderInput((string)($data['settings']['dataPath'] ?? 'user_data/studio'));
        $data['settings']['dataPath'] = $dataPath;
        rememberDataPath($dataPath);

        $targetPath = resolveDataPath($dataPath);
        if (!is_dir($targetPath)) {
            mkdir($targetPath, 0777, true);
        }

        $repository = new StudioRepository($targetPath);
        $repository->save($data);
        sendJson(['success' => true, 'message' => 'Saved studio data.']);
    }

    if ($action === 'models') {
        sendJson(['success' => true, 'models' => $modelRegistry->all()]);
    }

    if ($action === 'generate_exercise') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Method not allowed.'], 405);
        }

        $payload = readJsonBody();
        $studio = $payload['studio'] ?? $repository->load();
        $options = $payload['options'] ?? [];
        $exercise = $exerciseGenerator->generate($studio, $options);

        sendJson(['success' => true, 'exercise' => $exercise]);
    }

    if ($action === 'grade_exercise') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Method not allowed.'], 405);
        }

        $payload = readJsonBody();
        $exercise = $payload['exercise'] ?? [];
        $answers = $payload['answers'] ?? [];
        $model = (string)($payload['model'] ?? 'local-rule-based');
        $result = $answerGrader->grade($exercise, $answers, $model);

        sendJson(['success' => true, 'result' => $result]);
    }

    sendJson(['success' => false, 'message' => 'Action not found.'], 404);
} catch (Throwable $exception) {
    sendJson(['success' => false, 'message' => $exception->getMessage()], 500);
}
