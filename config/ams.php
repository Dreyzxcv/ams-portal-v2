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
];
