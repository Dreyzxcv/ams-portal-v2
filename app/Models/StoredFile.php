<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoredFile extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['disk', 'path', 'original_name', 'mime_type', 'size_bytes', 'sha256', 'uploaded_by'];
}
