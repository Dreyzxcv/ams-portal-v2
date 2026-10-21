<?php

return [
    'otp' => [
        // Always on in production, whatever the environment says.
        'required' => env('APP_ENV') === 'production' ? true : (bool) env('AMS_OTP_REQUIRED', true),
        'ttl_minutes' => 5,
        'max_attempts' => 5,
        'resend_seconds' => 60,
        'pending_minutes' => 15,
        'trusted_device_days' => 30,
        'max_trusted_devices' => 10,
    ],
    'progress' => [
        // Phases a trainee can be in (matches the grade components: 1, 2, 3, 4). Confirm with the organization.
        'max_phase' => 4,
        // Total program length in days. Remaining days are computed from this; null = not configured.
        'program_days' => env('AMS_PROGRAM_DAYS') !== null ? (int) env('AMS_PROGRAM_DAYS') : null,
    ],
    'intake' => [
        'messages' => [
            'open' => 'Recruitment is now open.',
            'closed' => 'Recruitment is now closed. A batch is currently ongoing.',
        ],
    ],
];
