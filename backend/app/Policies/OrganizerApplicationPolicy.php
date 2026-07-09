<?php

namespace App\Policies;

use App\Models\User;

class OrganizerApplicationPolicy
{
    public function review(User $user): bool
    {
        return $user->role === 'admin';
    }
}
