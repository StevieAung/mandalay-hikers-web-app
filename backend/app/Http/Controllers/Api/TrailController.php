<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trail;
use App\Models\TrailImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class TrailController extends Controller
{
    public function index(Request $request)
    {
        $query = Trail::query()
            ->withAvg('ratings', 'score')
            ->withCount(['events', 'favorites', 'ratings']);

        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('location', 'like', "%{$search}%"));
        }

        if ($difficulty = $request->query('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        // "Popular" cascades through the strongest signals that a trail is actually
        // walked: saves first, then reviews written, then organised hikes.
        if ($request->query('sort') === 'popular') {
            $query->orderByDesc('favorites_count')
                ->orderByDesc('ratings_count')
                ->orderByDesc('events_count');
        } else {
            // Seeded trails share a created_at, so tie-break on id to keep "newest" stable.
            $query->latest()->orderByDesc('id');
        }

        return $query->paginate(12);
    }

    public function show(Request $request, Trail $trail)
    {
        $trail
            ->loadAvg('ratings', 'score')
            ->loadCount('ratings')
            ->load([
                'images',
                'ratings' => fn ($query) => $query
                    ->latest()
                    ->with('user:id,name,role'),
                'events.organizer:id,name',
            ]);

        $viewer = $request->user('sanctum');

        return $trail->setAttribute(
            'is_favorited',
            $viewer ? $viewer->favorites()->whereKey($trail->id)->exists() : false,
        );
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['cover_image'] = $this->storeImage($request, 'cover_image', 'trails');

        $trail = Trail::create($data);
        $this->storeGalleryImages($request, $trail);

        return response()->json($trail->load('images'), 201);
    }

    public function update(Request $request, Trail $trail)
    {
        $data = $this->validated($request, true);

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $this->storeImage($request, 'cover_image', 'trails');
        }

        $trail->update($data);
        $this->storeGalleryImages($request, $trail);

        return $trail->fresh()->load('images');
    }

    public function destroy(Trail $trail)
    {
        $trail->delete();

        return response()->noContent();
    }

    public function destroyImage(Trail $trail, TrailImage $image)
    {
        abort_unless($image->trail_id === $trail->id, 404);

        $path = $image->getRawOriginal('image_path');
        $image->delete();

        if ($path && ! str_starts_with($path, 'http')) {
            Storage::disk('public')->delete($path);
        }

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
            'review' => ['nullable', 'string', 'max:1000'],
        ]);

        return response()->json($trail->ratings()->updateOrCreate(['user_id' => $request->user()->id], $data));
    }

    public function deleteRating(Request $request, Trail $trail)
    {
        $trail->ratings()->where('user_id', $request->user()->id)->delete();

        return response()->noContent();
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

        $data = $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'location' => [$required, 'string', 'max:255'],
            'latitude' => [$required, 'numeric', 'between:-90,90'],
            'longitude' => [$required, 'numeric', 'between:-180,180'],
            'difficulty' => [$required, 'in:Easy,Moderate,Hard'],
            'status' => ['sometimes', 'in:open,closed,maintenance'],
            'distance_km' => [$required, 'numeric', 'min:0'],
            'duration' => [$required, 'string', 'max:120'],
            'elevation_m' => ['sometimes', 'integer', 'min:0'],
            'cover_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:6144'],
            'gallery_images' => ['nullable', 'array'],
            'gallery_images.*' => ['image', 'mimes:jpeg,jpg,png,webp', 'max:6144'],
            'description' => [$required, 'string'],
            'required_equipment' => ['nullable', 'string'],
            'best_season' => ['nullable', 'string', 'max:120'],
        ]);

        if ($request->has('latitude') xor $request->has('longitude')) {
            throw ValidationException::withMessages([
                'latitude' => 'Latitude and longitude must be provided together.',
                'longitude' => 'Latitude and longitude must be provided together.',
            ]);
        }

        return $data;
    }

    private function storeGalleryImages(Request $request, Trail $trail): void
    {
        foreach ($request->file('gallery_images', []) as $image) {
            $trail->images()->create([
                'image_path' => $image->store('trails/gallery', 'public'),
            ]);
        }
    }
}
