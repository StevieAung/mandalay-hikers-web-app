<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['organizer:id,name,role', 'trail:id,name,difficulty'])
            ->withCount(['participants' => fn ($q) => $q->where('event_participants.attendance_status', 'joined')]);

        if ($request->query('mine')) {
            $user = $request->user('sanctum');

            if (! $user) {
                abort(401, 'Authentication is required to view your events.');
            }

            $query->where('organizer_id', $user->id)
                ->withCount(['participants as pending_participants_count' => fn ($q) => $q->where('event_participants.attendance_status', 'pending')]);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $query->orderBy('starts_at')->paginate(12);
    }

    public function show(Request $request, Event $event)
    {
        $event->load(['organizer:id,name,role,is_verified', 'trail', 'participants:id,name'])
            ->loadCount(['participants' => fn ($q) => $q->where('event_participants.attendance_status', 'joined')]);

        $viewer = $request->user('sanctum');
        $participation = $viewer ? $event->participants()->whereKey($viewer->id)->first() : null;
        $status = $participation?->pivot->attendance_status;

        return $event
            ->setAttribute('participation_status', $status)
            ->setAttribute('is_joined', $status === 'joined');
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['organizer_id'] = $request->user()->id;
        $data['cover_image'] = $this->storeImage($request, 'cover_image', 'events');

        return response()->json(Event::create($data)->load('organizer'), 201);
    }

    public function update(Request $request, Event $event)
    {
        $this->authorizeOrganizer($request, $event);
        $data = $this->validated($request, true);

        if ($request->has('cover_image')) {
            $data['cover_image'] = $this->storeImage($request, 'cover_image', 'events');
        }

        $event->update($data);

        return $event->fresh()->load('organizer');
    }

    public function destroy(Request $request, Event $event)
    {
        $this->authorizeOrganizer($request, $event);
        $event->update(['status' => 'cancelled']);

        return $event->fresh();
    }

    public function join(Request $request, Event $event)
    {
        if ($event->status !== 'upcoming') {
            abort(422, 'Only upcoming events are open for joining.');
        }

        $existing = $event->participants()->whereKey($request->user()->id)->first();

        if ($existing && in_array($existing->pivot->attendance_status, ['pending', 'joined'], true)) {
            abort(422, 'You have already requested to join this event.');
        }

        if ($this->joinedCount($event) >= $event->participant_limit) {
            abort(422, 'This event is already full.');
        }

        $event->participants()->syncWithoutDetaching([$request->user()->id => ['attendance_status' => 'pending']]);

        return ['participation_status' => 'pending', 'participants_count' => $this->joinedCount($event)];
    }

    public function leave(Request $request, Event $event)
    {
        $event->participants()->detach($request->user()->id);

        return ['participation_status' => null, 'participants_count' => $this->joinedCount($event)];
    }

    public function participants(Request $request, Event $event)
    {
        $this->authorizeOrganizer($request, $event);

        // Pending requests surface first so the organizer sees what needs a decision.
        return $event->participants()
            ->select('users.id', 'name', 'email')
            ->get()
            ->sortBy(fn ($participant) => match ($participant->pivot->attendance_status) {
                'pending' => 0,
                'joined', 'attended', 'missed' => 1,
                'rejected' => 2,
                default => 3,
            })
            ->values();
    }

    public function attendance(Request $request, Event $event)
    {
        $this->authorizeOrganizer($request, $event);
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'attendance_status' => ['required', 'in:pending,joined,attended,missed,rejected'],
        ]);

        if ($data['attendance_status'] === 'joined') {
            $alreadyJoined = $this->joinedCount($event, exceptUserId: $data['user_id']);

            if ($alreadyJoined >= $event->participant_limit) {
                abort(422, 'This event is already full.');
            }
        }

        $event->participants()->updateExistingPivot($data['user_id'], ['attendance_status' => $data['attendance_status']]);

        return ['updated' => true];
    }

    private function joinedCount(Event $event, ?int $exceptUserId = null): int
    {
        $query = $event->participants()->wherePivot('attendance_status', 'joined');

        if ($exceptUserId) {
            $query->whereKeyNot($exceptUserId);
        }

        return $query->count();
    }

    private function authorizeOrganizer(Request $request, Event $event): void
    {
        if ($request->user()->role !== 'admin' && $event->organizer_id !== $request->user()->id) {
            abort(403, 'You can only manage your own events.');
        }
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'trail_id' => [$required, 'exists:trails,id'],
            'title' => [$required, 'string', 'max:255'],
            'destination' => [$required, 'string', 'max:255'],
            'meeting_point' => [$required, 'string', 'max:255'],
            'starts_at' => [$required, 'date'],
            'participant_limit' => [$required, 'integer', 'min:1'],
            'required_equipment' => ['nullable', 'string'],
            'description' => [$required, 'string'],
            'status' => ['sometimes', 'in:upcoming,completed,cancelled,featured'],
            'cover_image' => ['nullable'],
        ]);
    }
}
