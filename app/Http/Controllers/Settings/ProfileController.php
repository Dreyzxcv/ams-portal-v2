<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's display name. Email, username, role and status are not
     * editable here; they are managed by administrators.
     */
    public function update(ProfileUpdateRequest $request, AuditLogger $audit): RedirectResponse
    {
        $user = $request->user();

        $user->fill($request->validated());
        $changed = $user->isDirty('name');
        $user->save();

        if ($changed) {
            $audit->record('profile.updated', $user, 'user', $user->id, ['fields' => ['name']]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }
}
