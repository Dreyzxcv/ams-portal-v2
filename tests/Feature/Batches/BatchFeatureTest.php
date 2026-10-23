<?php

use App\Models\Batch;
use App\Models\BatchAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('creates a batch with its end date', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('batches.store'), [
        'name' => 'October cohort',
        'starts_on' => '2026-10-01',
        'ends_on' => '2027-01-31',
    ]);

    $response->assertRedirect();
    $batch = Batch::query()->where('name', 'October cohort')->firstOrFail();

    expect($batch->ends_on->toDateString())->toBe('2027-01-31');
});

it('rejects an end date before the start date', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->from(route('batches.create'))
        ->post(route('batches.store'), [
            'name' => 'Invalid cohort',
            'starts_on' => '2026-10-20',
            'ends_on' => '2026-10-19',
        ])
        ->assertSessionHasErrors([
            'ends_on' => 'The end date must be on or after the start date.',
        ]);

    expect(Batch::query()->where('name', 'Invalid cohort')->exists())->toBeFalse();
});

it('updates the end date of an existing batch', function () {
    $admin = User::factory()->admin()->create();
    $batch = Batch::create(['name' => 'Existing cohort']);

    $this->actingAs($admin)
        ->patch(route('batches.update', $batch), [
            'name' => $batch->name,
            'starts_on' => '2026-10-01',
            'ends_on' => '2027-02-28',
        ])
        ->assertRedirect(route('batches.show', $batch));

    expect($batch->refresh()->ends_on->toDateString())->toBe('2027-02-28');
});

it('shows days left on the batch list from the batch end date', function () {
    $admin = User::factory()->admin()->create();
    Batch::create([
        'name' => 'Ending soon',
        'ends_on' => '2026-10-30',
    ]);
    $this->travelTo('2026-10-23 12:00:00');

    $this->actingAs($admin)
        ->get(route('batches.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('batches/index')
            ->where('batches.data.0.days_left', 7)
            ->where('batches.data.0.is_ended', false)
            ->where('batches.data.0.ends_on', '2026-10-30'));
});

it('uses the assigned batch end date for trainee dashboard days left', function () {
    $trainee = User::factory()->create();
    $batch = Batch::create([
        'name' => 'Current cohort',
        'ends_on' => '2026-10-30',
    ]);
    BatchAssignment::create([
        'batch_id' => $batch->id,
        'user_id' => $trainee->id,
    ]);
    $this->travelTo('2026-10-23 12:00:00');

    $this->actingAs($trainee)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('trainee.remaining_days', 7)
            ->where('trainee.batch_ended', false));
});

it('uses the assigned batch end date for progress list days left', function () {
    $admin = User::factory()->admin()->create();
    $trainee = User::factory()->create();
    $batch = Batch::create([
        'name' => 'Current cohort',
        'ends_on' => '2026-10-30',
    ]);
    BatchAssignment::create([
        'batch_id' => $batch->id,
        'user_id' => $trainee->id,
    ]);
    $this->travelTo('2026-10-23 12:00:00');

    $this->actingAs($admin)
        ->get(route('progress.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('progress/index')
            ->where('trainees.data.0.remaining_days', 7)
            ->where('trainees.data.0.batch_ended', false));
});

it('shows a batch as ended without negative days after its end date', function () {
    $trainee = User::factory()->create();
    $batch = Batch::create([
        'name' => 'Past cohort',
        'ends_on' => '2026-10-22',
    ]);
    BatchAssignment::create([
        'batch_id' => $batch->id,
        'user_id' => $trainee->id,
    ]);
    $this->travelTo('2026-10-23 12:00:00');

    $this->actingAs($trainee)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('trainee.remaining_days', 0)
            ->where('trainee.batch_ended', true));
});
