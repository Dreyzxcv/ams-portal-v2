<?php

namespace App\Http\Controllers\Certificates;

use App\Contracts\CertificateStorage;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Certificates\IssueCertificateRequest;
use App\Http\Requests\Certificates\RevokeCertificateRequest;
use App\Models\Certificate;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\CertificateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class CertificateController extends Controller
{
    public function __construct(private readonly CertificateService $certificates) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Certificate::class);

        $search = trim((string) $request->query('search', ''));

        $trainees = User::query()
            ->where('role', Role::Trainee->value)
            ->with('certificate')
            ->when($search !== '', function ($query) use ($search) {
                $term = '%'.addcslashes(mb_strtolower($search), '%_\\').'%';
                $query->where(function ($q) use ($term) {
                    $q->whereRaw('lower(name) like ?', [$term])
                        ->orWhereRaw('lower(username) like ?', [$term]);
                });
            })
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'username' => $t->username,
                'status' => $t->status?->value,
                'certificate' => $t->certificate === null ? null : [
                    'id' => $t->certificate->id,
                    'status' => $t->certificate->status->value,
                    'number' => $t->certificate->certificate_number,
                    'issued_at' => $t->certificate->issued_at?->toIso8601String(),
                    'has_file' => $t->certificate->file_id !== null,
                ],
            ]);

        return Inertia::render('certificates/index', [
            'trainees' => $trainees,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(IssueCertificateRequest $request, User $trainee): RedirectResponse
    {
        abort_unless($trainee->role === Role::Trainee, 404);

        $this->certificates->issue($request->user(), $trainee, $request->file('file'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Certificate issued.')]);

        return to_route('certificates.index');
    }

    public function revoke(RevokeCertificateRequest $request, Certificate $certificate): RedirectResponse
    {
        $this->certificates->revoke($request->user(), $certificate, $request->validated('reason'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Certificate revoked.')]);

        return to_route('certificates.index');
    }

    public function download(
        Request $request,
        Certificate $certificate,
        CertificateStorage $storage,
        AuditLogger $audit,
    ): StreamedResponse {
        Gate::authorize('download', $certificate);

        $certificate->loadMissing('file');
        abort_if($certificate->file === null, 404);

        $audit->record('certificate.downloaded', $request->user(), 'certificate', $certificate->id);

        try {
            return $storage->download($certificate->file);
        } catch (Throwable $e) {
            report($e);

            abort(502, 'The certificate file is temporarily unavailable.');
        }
    }
}