<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(User $user)
    {
        return $this->profilePayload($user);
    }

    public function dashboard(Request $request)
    {
        return $this->profilePayload($request->user(), true);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:60'],
            'bio' => ['nullable', 'string'],
            'avatar' => ['nullable', 'image', 'max:4096'],
            'cover_image' => ['nullable', 'image', 'max:6144'],
        ]);

        $user = $request->user();
        $profile = $user->profile;
        $user->update(['name' => $data['name']]);
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'location' => $data['location'] ?? null,
                'phone' => $data['phone'] ?? null,
                'bio' => $data['bio'] ?? null,
                'avatar' => $request->hasFile('avatar')
                    ? $this->storeImage($request, 'avatar', 'profiles')
                    : $profile?->avatar,
                'cover_image' => $request->hasFile('cover_image')
                    ? $this->storeImage($request, 'cover_image', 'profile-covers')
                    : $profile?->cover_image,
            ],
        );

        return $this->profilePayload($user->fresh());
    }

    private function profilePayload(User $user, bool $includeOwnerOnly = false)
    {
        $user->load('profile')
            ->loadCount(['favorites', 'joinedEvents', 'posts']);

        $favorites = $user->favorites()
            ->latest('favorites.created_at')
            ->limit(6)
            ->get(['trails.id', 'name', 'difficulty', 'distance_km', 'elevation_m', 'cover_image']);

        $joinedEvents = $user->joinedEvents()
            ->with(['trail:id,name,difficulty'])
            ->withCount('participants')
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->limit(6)
            ->get();

        $posts = $user->posts()
            ->latest()
            ->withCount('comments')
            ->limit(6)
            ->get(['id', 'title', 'body', 'image', 'user_id', 'created_at']);

        $hostedEvents = $user->events()
            ->with(['trail:id,name,difficulty'])
            ->withCount('participants')
            ->orderBy('starts_at')
            ->limit(6)
            ->get();

        $approvedApplication = $user->organizerApplications()
            ->where('status', 'approved')
            ->latest('reviewed_at')
            ->first();

        $payload = [
            'user' => $this->presentUser($user),
            'favorites' => $favorites,
            'joined_events' => $joinedEvents,
            'posts' => $posts,
            'hosted_events' => $hostedEvents,
            'approved_organizer_application' => $approvedApplication,
        ];

        if ($includeOwnerOnly) {
            $payload['latest_organizer_application'] = $user->organizerApplications()->latest()->first();
        }

        return $payload;
    }

    private function presentUser(User $user): array
    {
        $profile = $user->profile;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'favorites_count' => $user->favorites_count ?? 0,
            'joined_events_count' => $user->joined_events_count ?? 0,
            'posts_count' => $user->posts_count ?? 0,
            'profile' => $profile ? [
                'id' => $profile->id,
                'location' => $profile->location,
                'phone' => $profile->phone,
                'avatar' => $this->imageUrl($profile->avatar),
                'cover_image' => $this->imageUrl($profile->cover_image),
                'bio' => $profile->bio,
            ] : null,
        ];
    }
}
