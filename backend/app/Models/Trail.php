<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

#[Fillable(['name', 'location', 'difficulty', 'distance_km', 'duration', 'elevation_m', 'cover_image', 'description', 'required_equipment', 'best_season'])]
class Trail extends Model
{
    protected function casts(): array
    {
        return [
            'distance_km' => 'decimal:2',
        ];
    }

    public function getCoverImageAttribute(?string $value): ?string
    {
        if (! $value || str_starts_with($value, 'http')) {
            return $value;
        }

        return asset(Storage::url($value));
    }

    public function images()
    {
        return $this->hasMany(TrailImage::class);
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function reports()
    {
        return $this->hasMany(TrailReport::class);
    }
}
