<?php
declare(strict_types=1);

namespace App\Domain;

final class SkillSet
{
    public const VOCABULARY = 'Vocabulary';
    public const GRAMMAR = 'Grammar';
    public const LISTENING = 'Listening';
    public const SPEAKING = 'Speaking';
    public const READING = 'Reading';
    public const WRITING = 'Writing';

    public static function all(): array
    {
        return [
            self::VOCABULARY,
            self::GRAMMAR,
            self::LISTENING,
            self::SPEAKING,
            self::READING,
            self::WRITING,
        ];
    }

    public static function normalize(string $skill): string
    {
        foreach (self::all() as $knownSkill) {
            if (strcasecmp($knownSkill, $skill) === 0) {
                return $knownSkill;
            }
        }

        return self::VOCABULARY;
    }
}
