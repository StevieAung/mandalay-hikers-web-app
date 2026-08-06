<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

#[Fillable(['trail_id', 'image_path'])]
class TrailImage extends Model
{
    public function getImagePathAttribute(?string $value): ?string
    {
        if (! $value || str_starts_with($value, 'http')) {
            return $value;
        }

        return asset(Storage::url($value));
    }

    public function trail()
    {
        return $this->belongsTo(Trail::class);
    }
}
