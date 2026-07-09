<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\OrganizerApplication;
use App\Models\Post;
use App\Models\Trail;
use App\Models\TrailReport;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        return [
            'total_users' => User::count(),
            'total_organizers' => User::where('role', 'organizer')->count(),
            'upcoming_events' => Event::where('status', 'upcoming')->count(),
            'popular_trails' => Trail::withCount('events')->orderByDesc('events_count')->limit(5)->get(),
            'reports' => TrailReport::where('status', 'open')->count(),
            'latest_registrations' => User::latest()->limit(5)->get(['id', 'name', 'email', 'role', 'created_at']),
            'pending_applications' => OrganizerApplication::where('status', 'pending')->count(),
        ];
    }

    public function users()
    {
        return User::with('profile')->latest()->paginate(20);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => ['sometimes', 'in:explorer,organizer,admin'],
            'is_banned' => ['sometimes', 'boolean'],
        ]);

        $user->update($data);

        return $user->fresh()->load('profile');
    }

    public function events()
    {
        return Event::with(['organizer:id,name,email', 'trail:id,name'])->withCount('participants')->latest()->paginate(20);
    }

    public function featureEvent(Event $event)
    {
        $event->update(['status' => 'featured']);

        return $event->fresh();
    }

    public function reports()
    {
        return TrailReport::with(['user:id,name', 'trail:id,name'])->latest()->paginate(20);
    }

    public function updateReport(Request $request, TrailReport $report)
    {
        $data = $request->validate(['status' => ['required', 'in:open,reviewed,resolved']]);
        $report->update($data);

        return $report->fresh()->load(['user:id,name', 'trail:id,name']);
    }

    public function posts()
    {
        return Post::with('user:id,name,email')->withCount('comments')->latest()->paginate(20);
    }
}
