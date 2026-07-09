<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['trail_id', 'image_path'])]
class TrailImage extends Model
{
    public function trail()
    {
        return $this->belongsTo(Trail::class);
    }
}
