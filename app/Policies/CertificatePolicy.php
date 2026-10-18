<?php

namespace App\Policies;

use App\Enums\CertificateStatus;
use App\Models\Certificate;
use App\Models\User;
use App\Support\Permissions;

class CertificatePolicy
{
    public function viewAny(User $user): bool
    {
        return Permissions::allows($user, Permissions::CERTIFICATES_MANAGE);
    }

    /** Trainees see only their own certificate, and only once it is issued. */
    public function view(User $user, Certificate $certificate): bool
    {
        if (Permissions::allows($user, Permissions::CERTIFICATES_MANAGE)) {
            return true;
        }

        return $user->isActive()
            && $certificate->trainee_id === $user->id
            && $certificate->status === CertificateStatus::Issued;
    }

    public function download(User $user, Certificate $certificate): bool
    {
        return $this->view($user, $certificate);
    }

    public function create(User $user): bool
    {
        return Permissions::allows($user, Permissions::CERTIFICATES_MANAGE);
    }

    public function update(User $user, Certificate $certificate): bool
    {
        return Permissions::allows($user, Permissions::CERTIFICATES_MANAGE);
    }
}
