<?php

require __DIR__.'/../vendor/autoload.php';

if (! file_exists(__DIR__.'/../.env.testing')) {
    fwrite(STDERR, "Refusing to run tests: .env.testing is missing.\n");
    exit(1);
}

$configured = file_get_contents(__DIR__.'/../phpunit.xml');

if (! str_contains($configured, 'name="DB_HOST" value="127.0.0.1" force="true"')) {
    fwrite(STDERR, "Refusing to run tests: phpunit.xml must force DB_HOST to 127.0.0.1.\n");
    exit(1);
}
