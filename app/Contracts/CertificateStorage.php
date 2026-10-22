<?php

namespace App\Contracts;

use App\Models\StoredFile;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\StreamedResponse;

interface CertificateStorage
{
    /** Stores the upload privately and returns the saved metadata row. */
    public function store(UploadedFile $file, ?int $uploadedBy): StoredFile;

    /** Streams the file through the app. Callers must authorize first. */
    public function download(StoredFile $file): StreamedResponse;

    /** Removes the stored object. */
    public function delete(StoredFile $file): void;
}