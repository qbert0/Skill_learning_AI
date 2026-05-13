<?php
declare(strict_types=1);

namespace App\Domain;

final class SkillSet
{
    public const FOUNDATION = 'Foundation';
    public const LISTENING = 'Listening';
    public const SPEAKING = 'Speaking';
    public const READING = 'Reading';
    public const WRITING = 'Writing';

    public static function all(): array
    {
        return [
            self::FOUNDATION,
            self::LISTENING,
            self::SPEAKING,
            self::READING,
            self::WRITING,
        ];
    }

    public static function normalize(string $skill): string
    {
        if (strcasecmp($skill, 'Grammar') === 0 || strcasecmp($skill, 'Vocabulary') === 0) {
            return self::FOUNDATION;
        }

        foreach (self::all() as $knownSkill) {
            if (strcasecmp($knownSkill, $skill) === 0) {
                return $knownSkill;
            }
        }

        return self::FOUNDATION;
    }

    public static function exerciseTypes(string $skill): array
    {
        return self::normalize($skill) === self::FOUNDATION
            ? ['multiple_choice_blank', 'rewrite_sentence']
            : [];
    }
}
