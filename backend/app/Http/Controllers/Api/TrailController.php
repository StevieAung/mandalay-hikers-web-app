<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trail;
use Illuminate\Http\Request;

class TrailController extends Controller
{
    public function index(Request $request)
    {
        $query = Trail::query()->withAvg('ratings', 'score')->withCount('events');

        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('location', 'like', "%{$search}%"));
        }

        if ($difficulty = $request->query('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        return $query->latest()->paginate(12);
    }

    public function show(Trail $trail)
    {
        return $trail->load(['images', 'ratings.user:id,name', 'events.organizer:id,name']);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['cover_image'] = $this->storeImage($request, 'cover_image', 'trails');

        return response()->json(Trail::create($data), 201);
    }

    public function update(Request $request, Trail $trail)
    {
        $data = $this->validated($request, true);

        if ($request->has('cover_image')) {
            $data['cover_image'] = $this->storeImage($request, 'cover_image', 'trails');
        }

        $trail->update($data);

        return $trail->fresh();
    }

    public function destroy(Trail $trail)
    {
        $trail->delete();

        return response()->noContent();
    }

    public function favorite(Request $request, Trail $trail)
    {
        $request->user()->favorites()->syncWithoutDetaching([$trail->id]);

        return ['favorited' => true];
    }

    public function unfavorite(Request $request, Trail $trail)
    {
        $request->user()->favorites()->detach($trail->id);

        return ['favorited' => false];
    }

    public function rate(Request $request, Trail $trail)
    {
        $data = $request->validate([
            'score' => ['required', 'integer', 'between:1,5'],
            'review' => ['nullable', 'string'],
        ]);

        return response()->json($trail->ratings()->updateOrCreate(['user_id' => $request->user()->id], $data));
    }

    public function report(Request $request, Trail $trail)
    {
        $data = $request->validate([
            'condition' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        return response()->json($trail->reports()->create($data + ['user_id' => $request->user()->id]), 201);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'location' => [$required, 'string', 'max:255'],
            'difficulty' => [$required, 'in:Easy,Moderate,Hard'],
            'distance_km' => [$required, 'numeric', 'min:0'],
            'duration' => [$required, 'string', 'max:120'],
            'elevation_m' => ['sometimes', 'integer', 'min:0'],
            'cover_image' => ['nullable'],
            'description' => [$required, 'string'],
            'required_equipment' => ['nullable', 'string'],
            'best_season' => ['nullable', 'string', 'max:120'],
        ]);
    }
}
