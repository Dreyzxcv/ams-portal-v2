<?php

namespace Tests\Support;

use App\Contracts\CertificateStorage;
use App\Models\StoredFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FakeCertificateStorage implements CertificateStorage
{
    /** @var list<string> */
    public array $deleted = [];

    public function store(UploadedFile $file, ?int $uploadedBy): StoredFile
    {
        return StoredFile::create([
            'disk' => 'fake',
            'path' => (string) Str::uuid(),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => 'application/pdf',
            'size_bytes' => $file->getSize(),
            'sha256' => hash_file('sha256', $file->getRealPath()),
            'uploaded_by' => $uploadedBy,
        ]);
    }

    public function download(StoredFile $file): StreamedResponse
    {
        return response()->streamDownload(fn () => print ('%PDF-fake'), 'certificate.pdf');
    }

    public function delete(StoredFile $file): void
    {
        $this->deleted[] = $file->path;
    }
}