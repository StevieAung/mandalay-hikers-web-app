<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

#[Fillable(['user_id', 'title', 'body', 'image'])]
class Post extends Model
{
    public function getImageAttribute(?string $value): ?string
    {
        if (! $value || str_starts_with($value, 'http')) {
            return $value;
        }

        return asset(Storage::url($value));
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->belongsToMany(User::class, 'post_likes')->withTimestamps();
    }
}
