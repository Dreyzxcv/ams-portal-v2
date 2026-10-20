<?php

namespace App\Enums;

enum DiscordDeliveryStatus: string
{
    case NotSent = 'not_sent';
    case Sending = 'sending';
    case Sent = 'sent';
    case Failed = 'failed';
}