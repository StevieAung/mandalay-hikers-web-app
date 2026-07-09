<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizerApplication;
use Illuminate\Http\Request;

class OrganizerApplicationController extends Controller
{
    public function index()
    {
        return OrganizerApplication::with('user:id,name,email,role')->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:20']]);

        if ($request->user()->role !== 'explorer') {
            abort(422, 'Only explorers need to apply for organizer access.');
        }

        $existing = OrganizerApplication::where('user_id', $request->user()->id)->where('status', 'pending')->exists();

        if ($existing) {
            abort(422, 'You already have a pending organizer application.');
        }

        return response()->json($request->user()->organizerApplications()->create($data), 201);
    }

    public function review(Request $request, OrganizerApplication $application)
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'review_note' => ['nullable', 'string'],
        ]);

        $application->update($data + [
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        if ($data['status'] === 'approved') {
            $application->user()->update(['role' => 'organizer']);
        }

        return $application->fresh()->load('user:id,name,email,role');
    }
}
