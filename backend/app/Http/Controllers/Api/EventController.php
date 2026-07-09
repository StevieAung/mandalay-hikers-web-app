<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::with(['organizer:id,name,role', 'trail:id,name,difficulty'])->withCount('participants');

        if ($request->query('mine')) {
            $query->where('organizer_id', $request->user()->id);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $query->orderBy('starts_at')->paginate(12);
    }

    public function show(Event $event)
    {
        return $event->load(['organizer:id,name', 'trail', 'participants:id,name,email']);
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

        if ($event->participants()->count() >= $event->participant_limit) {
            abort(422, 'This event is already full.');
        }

        $event->participants()->syncWithoutDetaching([$request->user()->id => ['attendance_status' => 'joined']]);

        return ['joined' => true, 'participants_count' => $event->participants()->count()];
    }

    public function leave(Request $request, Event $event)
    {
        $event->participants()->detach($request->user()->id);

        return ['joined' => false, 'participants_count' => $event->participants()->count()];
    }

    public function participants(Request $request, Event $event)
    {
        $this->authorizeOrganizer($request, $event);

        return $event->participants()->select('users.id', 'name', 'email')->get();
    }

    public function attendance(Request $request, Event $event)
    {
        $this->authorizeOrganizer($request, $event);
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'attendance_status' => ['required', 'in:joined,attended,missed'],
        ]);

        $event->participants()->updateExistingPivot($data['user_id'], ['attendance_status' => $data['attendance_status']]);

        return ['updated' => true];
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
            'trail_id' => ['nullable', 'exists:trails,id'],
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
