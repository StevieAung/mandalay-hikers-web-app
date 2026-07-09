<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['organizer_id', 'trail_id', 'title', 'destination', 'meeting_point', 'starts_at', 'participant_limit', 'required_equipment', 'description', 'status', 'cover_image'])]
class Event extends Model
{
    protected function casts(): array
    {
        return ['starts_at' => 'datetime'];
    }

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function trail()
    {
        return $this->belongsTo(Trail::class);
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'event_participants')->withPivot('attendance_status')->withTimestamps();
    }
}
