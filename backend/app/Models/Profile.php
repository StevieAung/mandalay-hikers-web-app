<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'location', 'phone', 'avatar', 'bio'])]
class Profile extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
