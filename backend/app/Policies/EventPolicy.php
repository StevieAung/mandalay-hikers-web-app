<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function create(User $user): bool
    {
        return in_array($user->role, ['organizer', 'admin'], true);
    }

    public function manage(User $user, Event $event): bool
    {
        return $user->role === 'admin' || $event->organizer_id === $user->id;
    }
}
