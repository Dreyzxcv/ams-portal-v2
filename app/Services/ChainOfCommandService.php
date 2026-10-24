<?php

namespace App\Services;

use App\Models\ChainOfCommandEntry;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ChainOfCommandService
{
    public const DISK = 'public';

    public function __construct(private readonly AuditLogger $audit) {}

    /** @param array{name: string, rank: string, position: string, note?: ?string, sort_order?: ?int} $data */
    public function create(User $actor, array $data, ?UploadedFile $image): ChainOfCommandEntry
    {
        $path = $image?->store('chain-of-command', self::DISK);

        try {
            return DB::transaction(function () use ($actor, $data, $path) {
                $entry = ChainOfCommandEntry::create([
                    'name' => $data['name'],
                    'rank' => $data['rank'],
                    'position' => $data['position'],
                    'note' => $data['note'] ?? null,
                    'sort_order' => $data['sort_order'] ?? 0,
                    'image_path' => $path,
                ]);

                $this->audit->record('chain.created', $actor, 'chain_entry', $entry->id, [
                    'name' => $entry->name,
                    'position' => $entry->position,
                ]);

                return $entry;
            });
        } catch (Throwable $e) {
            $this->discard($path);

            throw $e;
        }
    }

    /** @param array<string, mixed> $data */
    public function update(
        User $actor,
        ChainOfCommandEntry $entry,
        array $data,
        ?UploadedFile $image,
        bool $removeImage,
    ): void {
        $old = $entry->image_path;
        $new = $old;

        if ($image !== null) {
            $new = $image->store('chain-of-command', self::DISK);
        } elseif ($removeImage) {
            $new = null;
        }

        try {
            DB::transaction(function () use ($actor, $entry, $data, $new) {
                $entry->fill([
                    'name' => $data['name'],
                    'rank' => $data['rank'],
                    'position' => $data['position'],
                    'note' => $data['note'] ?? null,
                    'sort_order' => $data['sort_order'] ?? 0,
                    'image_path' => $new,
                ]);

                $changed = array_keys($entry->getDirty());

                if ($changed === []) {
                    return;
                }

                $entry->save();

                $this->audit->record('chain.updated', $actor, 'chain_entry', $entry->id, ['fields' => $changed]);
            });
        } catch (Throwable $e) {
            if ($new !== $old) {
                $this->discard($new);
            }

            throw $e;
        }

        if ($old !== null && $new !== $old) {
            $this->discard($old);
        }
    }

    public function delete(User $actor, ChainOfCommandEntry $entry): void
    {
        $path = $entry->image_path;

        DB::transaction(function () use ($actor, $entry) {
            $entry->delete();

            $this->audit->record('chain.deleted', $actor, 'chain_entry', $entry->id, [
                'name' => $entry->name,
                'position' => $entry->position,
            ]);
        });

        $this->discard($path);
    }

    private function discard(string|false|null $path): void
    {
        if (! $path) {
            return;
        }

        try {
            Storage::disk(self::DISK)->delete($path);
        } catch (Throwable $e) {
            report($e);
        }
    }
}