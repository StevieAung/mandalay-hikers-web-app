<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

#[Fillable(['user_id', 'location', 'phone', 'avatar', 'cover_image', 'bio'])]
class Profile extends Model
{
    public function getAvatarAttribute(?string $value): ?string
    {
        return $this->imageUrl($value);
    }

    public function getCoverImageAttribute(?string $value): ?string
    {
        return $this->imageUrl($value);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    private function imageUrl(?string $value): ?string
    {
        if (! $value || str_starts_with($value, 'http')) {
            return $value;
        }

        return asset(Storage::url($value));
    }
}
