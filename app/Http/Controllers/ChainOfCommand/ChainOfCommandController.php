<?php

namespace App\Http\Controllers\ChainOfCommand;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChainOfCommand\ChainOfCommandEntryRequest;
use App\Models\ChainOfCommandEntry;
use App\Services\ChainOfCommandService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ChainOfCommandController extends Controller
{
    public function __construct(private readonly ChainOfCommandService $chain) {}

    /** Public page. Only display fields, never account data. */
    public function index(): Response
    {
        return Inertia::render('chain-of-command/index', [
            'entries' => $this->ordered()->map(fn (ChainOfCommandEntry $e) => $this->present($e)),
        ]);
    }

    public function manage(): Response
    {
        Gate::authorize('viewAny', ChainOfCommandEntry::class);

        return Inertia::render('chain-of-command/manage', [
            'entries' => $this->ordered()->map(fn (ChainOfCommandEntry $e) => $this->present($e)),
        ]);
    }

    public function store(ChainOfCommandEntryRequest $request): RedirectResponse
    {
        $this->chain->create(
            $request->user(),
            Arr::only($request->validated(), ['name', 'rank', 'position', 'note', 'sort_order']),
            $request->file('image'),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Entry added.')]);

        return to_route('chain.manage');
    }

    public function update(ChainOfCommandEntryRequest $request, ChainOfCommandEntry $entry): RedirectResponse
    {
        $this->chain->update(
            $request->user(),
            $entry,
            Arr::only($request->validated(), ['name', 'rank', 'position', 'note', 'sort_order']),
            $request->file('image'),
            $request->boolean('remove_image'),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Entry updated.')]);

        return to_route('chain.manage');
    }

    public function destroy(Request $request, ChainOfCommandEntry $entry): RedirectResponse
    {
        Gate::authorize('delete', $entry);

        $this->chain->delete($request->user(), $entry);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Entry removed.')]);

        return to_route('chain.manage');
    }

    /** @return \Illuminate\Database\Eloquent\Collection<int, ChainOfCommandEntry> */
    private function ordered()
    {
        return ChainOfCommandEntry::query()->orderBy('sort_order')->orderBy('id')->get();
    }

    /** @return array<string, mixed> */
    private function present(ChainOfCommandEntry $e): array
    {
        return [
            'id' => $e->id,
            'name' => $e->name,
            'rank' => $e->rank,
            'position' => $e->position,
            'note' => $e->note,
            'sort_order' => $e->sort_order,
            'image_url' => $e->image_path
                ? Storage::disk(ChainOfCommandService::DISK)->url($e->image_path)
                : null,
        ];
    }
}