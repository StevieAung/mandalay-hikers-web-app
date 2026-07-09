<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\OrganizerApplication;
use App\Models\Post;
use App\Models\Trail;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin Htet',
            'email' => 'admin@mandalayhikes.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $verifiedOrganizer = User::factory()->create([
            'name' => 'May Thu Verified',
            'email' => 'verified.organizer@mandalayhikes.test',
            'password' => Hash::make('password'),
            'role' => 'organizer',
        ]);

        $explorer = User::factory()->create([
            'name' => 'Ko Min Explorer',
            'email' => 'explorer.min@mandalayhikes.test',
            'password' => Hash::make('password'),
            'role' => 'explorer',
        ]);

        foreach ([$admin, $verifiedOrganizer, $explorer] as $user) {
            $user->profile()->create(['location' => 'Mandalay', 'bio' => 'Weekend hiker exploring Mandalay region trails.']);
        }

        OrganizerApplication::create([
            'user_id' => $verifiedOrganizer->id,
            'reason' => 'Experienced weekend hiker ready to lead safe beginner-friendly Mandalay treks.',
            'status' => 'approved',
            'reviewed_by' => $admin->id,
            'review_note' => 'Approved as a verified organizer for seeded testing.',
            'reviewed_at' => now(),
        ]);

        $trails = collect([
            [
                'name' => 'Mandalay Hill Sunrise Trail',
                'location' => 'Mandalay Hill',
                'difficulty' => 'Easy',
                'distance_km' => 4.20,
                'duration' => '2 hours',
                'elevation_m' => 240,
                'cover_image' => 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
                'description' => 'A gentle city-edge hike with sunrise views over Mandalay and temple stops along the route.',
                'required_equipment' => 'Comfortable shoes, water bottle, sun hat',
                'best_season' => 'November to February',
            ],
            [
                'name' => 'Dee Dote Waterfall Route',
                'location' => 'Pyin Oo Lwin Road',
                'difficulty' => 'Moderate',
                'distance_km' => 7.50,
                'duration' => '4 hours',
                'elevation_m' => 420,
                'cover_image' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
                'description' => 'A weekend favorite with rocky paths, blue pools, and shaded rest spots near the waterfall.',
                'required_equipment' => 'Grip shoes, towel, dry bag, snacks',
                'best_season' => 'October to March',
            ],
            [
                'name' => 'Yankin Hill Community Loop',
                'location' => 'Yankin Hill',
                'difficulty' => 'Moderate',
                'distance_km' => 6.30,
                'duration' => '3 hours',
                'elevation_m' => 360,
                'cover_image' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
                'description' => 'A quiet loop with monastery viewpoints and enough climb to feel rewarding for beginners.',
                'required_equipment' => 'Water, light jacket, small first-aid kit',
                'best_season' => 'November to January',
            ],
        ])->map(fn ($trail) => Trail::create($trail));

        Event::create([
            'organizer_id' => $verifiedOrganizer->id,
            'trail_id' => $trails[0]->id,
            'title' => 'Saturday Sunrise Walk',
            'destination' => 'Mandalay Hill',
            'meeting_point' => 'South stairway entrance',
            'starts_at' => now()->addDays(5)->setTime(5, 30),
            'participant_limit' => 18,
            'required_equipment' => 'Water, shoes, light breakfast',
            'description' => 'A beginner-friendly sunrise hike followed by tea near the hill.',
            'cover_image' => $trails[0]->cover_image,
        ]);

        Event::create([
            'organizer_id' => $verifiedOrganizer->id,
            'trail_id' => $trails[1]->id,
            'title' => 'Dee Dote Cool Water Day',
            'destination' => 'Dee Dote Waterfall',
            'meeting_point' => 'Mandalay Palace east gate',
            'starts_at' => now()->addDays(12)->setTime(7, 0),
            'participant_limit' => 12,
            'required_equipment' => 'Grip shoes, dry clothes, packed lunch',
            'description' => 'A moderate day trip for hikers who want rocks, water, and a slower community pace.',
            'cover_image' => $trails[1]->cover_image,
        ]);

        Post::create([
            'user_id' => $explorer->id,
            'title' => 'First sunrise hike at Mandalay Hill',
            'body' => 'The route was friendly for beginners, but starting before sunrise made the view much better. Bring water even for short climbs.',
            'image' => $trails[0]->cover_image,
        ]);
    }
}
