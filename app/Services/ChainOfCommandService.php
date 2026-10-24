<?php

namespace App\Services;

use App\Models\ChainOfCommandEntry;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChainOfCommandService
{
    public function __construct(private readonly AuditLogger $audit) {}

    /** @param array{name: string, rank: string, position: string, note?: ?string, image_url?: ?string, sort_order?: ?int} $data */
    public function create(User $actor, array $data): ChainOfCommandEntry
    {
        return DB::transaction(function () use ($actor, $data) {
            $entry = ChainOfCommandEntry::create([
                'name' => $data['name'],
                'rank' => $data['rank'],
                'position' => $data['position'],
                'note' => $data['note'] ?? null,
                'image_url' => $data['image_url'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
            ]);

            $this->audit->record('chain.created', $actor, 'chain_entry', $entry->id, [
                'name' => $entry->name,
                'position' => $entry->position,
            ]);

            return $entry;
        });
    }

    /** @param array<string, mixed> $data */
    public function update(User $actor, ChainOfCommandEntry $entry, array $data): void
    {
        DB::transaction(function () use ($actor, $entry, $data) {
            $entry->fill([
                'name' => $data['name'],
                'rank' => $data['rank'],
                'position' => $data['position'],
                'note' => $data['note'] ?? null,
                'image_url' => $data['image_url'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
            ]);

            $changed = array_keys($entry->getDirty());

            if ($changed === []) {
                return;
            }

            $entry->save();

            $this->audit->record('chain.updated', $actor, 'chain_entry', $entry->id, ['fields' => $changed]);
        });
    }

    public function delete(User $actor, ChainOfCommandEntry $entry): void
    {
        DB::transaction(function () use ($actor, $entry) {
            $entry->delete();

            $this->audit->record('chain.deleted', $actor, 'chain_entry', $entry->id, [
                'name' => $entry->name,
                'position' => $entry->position,
            ]);
        });
    }
}