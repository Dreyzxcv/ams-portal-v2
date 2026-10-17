<?php

namespace App\Enums;

enum Role: string
{
    case Admin = 'admin';
    case HeadInstructor = 'head_instructor';
    case Instructor = 'instructor';
    case LogisticOfficer = 'logistic_officer';
    case Trainee = 'trainee';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::HeadInstructor => 'Head Instructor',
            self::Instructor => 'Instructor',
            self::LogisticOfficer => 'Logistic Officer',
            self::Trainee => 'Trainee',
        };
    }

    public function isStaff(): bool
    {
        return $this !== self::Trainee;
    }
}
