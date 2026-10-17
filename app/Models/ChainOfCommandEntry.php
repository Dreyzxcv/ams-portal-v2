<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChainOfCommandEntry extends Model
{
    protected $fillable = ['legacy_id', 'name', 'rank', 'position', 'note', 'image_path', 'sort_order'];
}
