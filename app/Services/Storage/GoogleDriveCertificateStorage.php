<?php

namespace App\Services\Storage;

use App\Contracts\CertificateStorage;
use App\Models\StoredFile;
use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GoogleDriveCertificateStorage implements CertificateStorage
{
    public const DISK = 'google';

    private const ALLOWED = [
        'application/pdf' => 'pdf',
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    private const MAX_BYTES = 5 * 1024 * 1024;

    private ?Drive $drive = null;

    public function store(UploadedFile $file, ?int $uploadedBy): StoredFile
    {
        $mime = $this->assertAllowed($file);

        $contents = (string) file_get_contents($file->getRealPath());

        // App-generated name; the user's filename is kept only as metadata.
        $driveName = (string) Str::uuid().'.'.self::ALLOWED[$mime];

        $meta = new DriveFile([
            'name' => $driveName,
            'parents' => [$this->folderId()],
        ]);

        $created = $this->drive()->files->create($meta, [
            'data' => $contents,
            'mimeType' => $mime,
            'uploadType' => 'multipart',
            'fields' => 'id',
            'supportsAllDrives' => true,
        ]);

        return StoredFile::create([
            'disk' => self::DISK,
            'path' => $created->id,
            'original_name' => Str::limit(basename($file->getClientOriginalName()), 255, ''),
            'mime_type' => $mime,
            'size_bytes' => strlen($contents),
            'sha256' => hash('sha256', $contents),
            'uploaded_by' => $uploadedBy,
        ]);
    }

    public function download(StoredFile $file): StreamedResponse
    {
        $this->assertOwnDisk($file);

        $response = $this->drive()->files->get($file->path, [
            'alt' => 'media',
            'supportsAllDrives' => true,
        ]);

        $stream = $response->getBody();
        $name = Str::ascii($file->original_name) ?: 'certificate';

        return response()->streamDownload(function () use ($stream) {
            while (! $stream->eof()) {
                echo $stream->read(8192);
            }
        }, $name, [
            'Content-Type' => $file->mime_type,
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
        ]);
    }

    public function delete(StoredFile $file): void
    {
        $this->assertOwnDisk($file);

        $this->drive()->files->delete($file->path, ['supportsAllDrives' => true]);
    }

    private function assertAllowed(UploadedFile $file): string
    {
        if (! $file->isValid() || $file->getSize() > self::MAX_BYTES) {
            throw new RuntimeException('Invalid or oversized upload.');
        }

        // Detected from the real content, not the client-supplied type or extension.
        $mime = (string) $file->getMimeType();

        if (! isset(self::ALLOWED[$mime])) {
            throw new RuntimeException('Only PDF, JPG, PNG or WebP files are allowed.');
        }

        if ($mime === 'application/pdf'
            && ! str_starts_with((string) file_get_contents($file->getRealPath(), false, null, 0, 5), '%PDF-')) {
            throw new RuntimeException('Only PDF, JPG, PNG or WebP files are allowed.');
        }

        return $mime;
    }

    private function assertOwnDisk(StoredFile $file): void
    {
        if ($file->disk !== self::DISK) {
            throw new RuntimeException('File is not stored on the '.self::DISK.' disk.');
        }
    }

    private function folderId(): string
    {
        $id = (string) config('services.google_drive.folder_id');

        if ($id === '') {
            throw new RuntimeException('Google Drive folder is not configured.');
        }

        return $id;
    }

    private function drive(): Drive
    {
        if ($this->drive !== null) {
            return $this->drive;
        }

        $cfg = config('services.google_drive');

        if (! $cfg['client_id'] || ! $cfg['client_secret'] || ! $cfg['refresh_token']) {
            throw new RuntimeException('Google Drive credentials are not configured.');
        }

        $client = new Client;
        $client->setClientId($cfg['client_id']);
        $client->setClientSecret($cfg['client_secret']);
        $client->setScopes([Drive::DRIVE]);

        $token = $client->fetchAccessTokenWithRefreshToken($cfg['refresh_token']);

        if (isset($token['error'])) {
            throw new RuntimeException('Google Drive authorization failed: '.$token['error']);
        }

        return $this->drive = new Drive($client);
    }
}