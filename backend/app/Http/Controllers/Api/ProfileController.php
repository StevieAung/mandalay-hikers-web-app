<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:60'],
            'bio' => ['nullable', 'string'],
            'avatar' => ['nullable'],
        ]);

        $user = $request->user();
        $user->update(['name' => $data['name']]);
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'location' => $data['location'] ?? null,
                'phone' => $data['phone'] ?? null,
                'bio' => $data['bio'] ?? null,
                'avatar' => $this->storeImage($request, 'avatar', 'profiles'),
            ],
        );

        return $user->fresh()->load('profile');
    }
}
