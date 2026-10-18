<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    /**
     * Last line of defence: refuse to run any test (and so to wipe any database)
     * unless the connection that will actually be used is the local test database.
     */
    protected function setUpTraits()
    {
        $connection = (string) config('database.default');
        $config = (array) config("database.connections.{$connection}");

        $host = (string) ($config['host'] ?? '');
        $database = (string) ($config['database'] ?? '');

        if ($connection !== 'pgsql' || ! in_array($host, ['127.0.0.1', 'localhost'], true) || $database !== 'ams_test') {
            throw new RuntimeException(
                "Refusing to run tests: they must use pgsql on a local host with database 'ams_test' "
                ."(got connection '{$connection}', database '{$database}'). Check .env.testing and phpunit.xml."
            );
        }

        return parent::setUpTraits();
    }
}
