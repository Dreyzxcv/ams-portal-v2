<?php

namespace App\Enums;

enum OtpPurpose: string
{
    case Login = 'login';
    case PasswordReset = 'password_reset';
    case EmailVerification = 'email_verification';
    case PasswordChange = 'password_change';
}
