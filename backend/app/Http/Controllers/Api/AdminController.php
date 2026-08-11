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
            'latest_reports' => TrailReport::with(['user:id,name', 'trail:id,name'])->latest()->limit(5)->get(),
            'latest_applications' => OrganizerApplication::with('user:id,name,email,role')->latest()->limit(5)->get(),
            'latest_events' => Event::with(['organizer:id,name,email', 'trail:id,name'])->withCount('participants')->latest()->limit(5)->get(),
        ];
    }

    public function users(Request $request)
    {
        $query = User::with('profile');

        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($request->filled('is_banned')) {
            $query->where('is_banned', filter_var($request->query('is_banned'), FILTER_VALIDATE_BOOL));
        }

        return $query->latest()->paginate(20);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => ['sometimes', 'in:explorer,organizer,admin'],
            'is_banned' => ['sometimes', 'boolean'],
            'is_verified' => ['sometimes', 'boolean'],
        ]);

        $currentAdmin = $request->user();
        $wouldDisableAdmin = ($data['role'] ?? $user->role) !== 'admin' || ($data['is_banned'] ?? $user->is_banned);

        if ($currentAdmin->is($user) && $wouldDisableAdmin) {
            abort(422, 'You cannot ban or demote your own administrator account.');
        }

        if ($user->role === 'admin' && $wouldDisableAdmin) {
            $activeAdmins = User::where('role', 'admin')->where('is_banned', false)->count();

            if ($activeAdmins <= 1) {
                abort(422, 'At least one active administrator must remain.');
            }
        }

        $user->update($data);

        return $user->fresh()->load('profile');
    }

    public function events(Request $request)
    {
        $query = Event::with(['organizer:id,name,email', 'trail:id,name'])->withCount('participants');

        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('destination', 'like', "%{$search}%")
                ->orWhere('meeting_point', 'like', "%{$search}%"));
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $query->latest()->paginate(20);
    }

    public function featureEvent(Event $event)
    {
        $event->update(['status' => 'featured']);

        return $event->fresh();
    }

    public function reports(Request $request)
    {
        $query = TrailReport::with(['user:id,name', 'trail:id,name']);

        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q
                ->where('condition', 'like', "%{$search}%")
                ->orWhere('notes', 'like', "%{$search}%")
                ->orWhereHas('trail', fn ($trail) => $trail->where('name', 'like', "%{$search}%"))
                ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%")));
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $query->latest()->paginate(20);
    }

    public function updateReport(Request $request, TrailReport $report)
    {
        $data = $request->validate(['status' => ['required', 'in:open,reviewed,resolved']]);
        $report->update($data);

        return $report->fresh()->load(['user:id,name', 'trail:id,name']);
    }

    public function posts(Request $request)
    {
        $query = Post::with('user:id,name,email')->withCount('comments');

        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('body', 'like', "%{$search}%")
                ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")));
        }

        return $query->latest()->paginate(20);
    }

    public function deletePost(Post $post)
    {
        $post->delete();

        return response()->noContent();
    }
}
