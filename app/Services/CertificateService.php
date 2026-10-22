<?php

namespace App\Services;

use App\Contracts\CertificateStorage;
use App\Enums\CertificateStatus;
use App\Enums\Role;
use App\Models\Certificate;
use App\Models\StoredFile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class CertificateService
{
    private const NUMBER_LOCK = 740001;

    public function __construct(
        private readonly CertificateStorage $storage,
        private readonly AuditLogger $audit,
    ) {}

    public function issue(User $actor, User $trainee, UploadedFile $file): Certificate
    {
        if ($trainee->role !== Role::Trainee || ! $trainee->isActive()) {
            throw ValidationException::withMessages(['file' => 'Certificates can only be issued to active trainees.']);
        }

        $this->assertNotAlreadyIssued($trainee);

        try {
            $stored = $this->storage->store($file, $actor->id);
        } catch (RuntimeException $e) {
            report($e);

            throw ValidationException::withMessages(['file' => 'The file could not be stored. Please try again.']);
        }

        try {
            return DB::transaction(function () use ($actor, $trainee, $stored) {
                // Re-check under a row lock so two admins cannot issue at once.
                $certificate = Certificate::query()
                    ->where('trainee_id', $trainee->id)
                    ->lockForUpdate()
                    ->first();

                if ($certificate?->status === CertificateStatus::Issued) {
                    throw ValidationException::withMessages(['file' => 'This trainee already has an issued certificate.']);
                }

                $number = $this->nextNumber();

                $certificate ??= new Certificate(['trainee_id' => $trainee->id]);
                $certificate->fill([
                    'status' => CertificateStatus::Issued,
                    'certificate_number' => $number,
                    'issued_at' => now(),
                    'issued_by' => $actor->id,
                    'file_id' => $stored->id,
                    'revoked_at' => null,
                    'revoked_by' => null,
                ])->save();

                $this->audit->record('certificate.issued', $actor, 'certificate', $certificate->id, [
                    'trainee_id' => $trainee->id,
                    'certificate_number' => $number,
                    'file_sha256' => $stored->sha256,
                ]);

                return $certificate;
            });
        } catch (Throwable $e) {
            // The DB write failed, so the uploaded object would be orphaned.
            $this->discard($stored);

            throw $e;
        }
    }

    public function revoke(User $actor, Certificate $certificate, ?string $reason): void
    {
        DB::transaction(function () use ($actor, $certificate, $reason) {
            $locked = Certificate::query()->whereKey($certificate->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== CertificateStatus::Issued) {
                throw ValidationException::withMessages(['reason' => 'Only issued certificates can be revoked.']);
            }

            $locked->forceFill([
                'status' => CertificateStatus::Revoked,
                'revoked_at' => now(),
                'revoked_by' => $actor->id,
            ])->save();

            // The file is kept for the record; only access is removed (see CertificatePolicy).
            $this->audit->record('certificate.revoked', $actor, 'certificate', $locked->id, array_filter([
                'trainee_id' => $locked->trainee_id,
                'certificate_number' => $locked->certificate_number,
                'reason' => $reason !== null && trim($reason) !== '' ? trim($reason) : null,
            ]));
        });
    }

    private function assertNotAlreadyIssued(User $trainee): void
    {
        $issued = Certificate::query()
            ->where('trainee_id', $trainee->id)
            ->where('status', CertificateStatus::Issued->value)
            ->exists();

        if ($issued) {
            throw ValidationException::withMessages(['file' => 'This trainee already has an issued certificate.']);
        }
    }

    /** Must run inside a transaction: the advisory lock is released at commit. */
    private function nextNumber(): string
    {
        DB::select('select pg_advisory_xact_lock(?)', [self::NUMBER_LOCK]);

        $prefix = 'AMS-'.now()->year.'-';

        $last = Certificate::query()
            ->where('certificate_number', 'like', $prefix.'%')
            ->orderByDesc('certificate_number')
            ->value('certificate_number');

        $next = $last === null ? 1 : ((int) substr($last, strlen($prefix))) + 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    private function discard(StoredFile $stored): void
    {
        try {
            $this->storage->delete($stored);
            $stored->delete();
        } catch (Throwable $e) {
            report($e);
        }
    }
}