<?php

namespace App\Enums;

enum OtpPurpose: string
{
    case Login = 'login';
    case PasswordReset = 'password_reset';
    case PasswordChange = 'password_change';
}
