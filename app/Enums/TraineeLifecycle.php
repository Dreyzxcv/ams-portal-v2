<?php

namespace App\Enums;

enum TraineeLifecycle: string
{
    case Active = 'active';
    case Graduated = 'graduated';
    case Discharged = 'discharged';
}
