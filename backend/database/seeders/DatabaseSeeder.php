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
            'is_verified' => true,
        ]);

        $explorer = User::factory()->create([
            'name' => 'Ko Min Explorer',
            'email' => 'explorer.min@mandalayhikes.test',
            'password' => Hash::make('password'),
            'role' => 'explorer',
        ]);

        $phoneByUserId = [
            $admin->id => '+95 9 111 222 333',
            $verifiedOrganizer->id => '+95 9 222 333 444',
            $explorer->id => '+95 9 333 444 555',
        ];

        foreach ([$admin, $verifiedOrganizer, $explorer] as $user) {
            $user->profile()->create([
                'location' => 'Mandalay',
                'bio' => 'Weekend hiker exploring Mandalay region trails.',
                'phone' => $phoneByUserId[$user->id],
            ]);
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
                'latitude' => 22.0019060,
                'longitude' => 96.1097150,
                'difficulty' => 'Easy',
                'distance_km' => 4.20,
                'duration' => '2 hours',
                'elevation_m' => 240,
                'cover_image' => 'trails/mock/trailA.jpg',
                'description' => 'A gentle city-edge hike with sunrise views over Mandalay and temple stops along the route.',
                'required_equipment' => 'Comfortable shoes, water bottle, sun hat',
                'best_season' => 'November to February',
            ],
            [
                'name' => 'Dee Dote Waterfall Route',
                'location' => 'Pyin Oo Lwin Road',
                'latitude' => 21.9634360,
                'longitude' => 96.3070610,
                'difficulty' => 'Moderate',
                'distance_km' => 7.50,
                'duration' => '4 hours',
                'elevation_m' => 420,
                'cover_image' => 'trails/mock/trailB.jpg',
                'description' => 'A weekend favorite with rocky paths, blue pools, and shaded rest spots near the waterfall.',
                'required_equipment' => 'Grip shoes, towel, dry bag, snacks',
                'best_season' => 'October to March',
            ],
            [
                'name' => 'Yankin Hill Community Loop',
                'location' => 'Yankin Hill',
                'latitude' => 21.9306250,
                'longitude' => 96.1430890,
                'difficulty' => 'Moderate',
                'distance_km' => 6.30,
                'duration' => '3 hours',
                'elevation_m' => 360,
                'cover_image' => 'trails/mock/trailC.jpg',
                'description' => 'A quiet loop with monastery viewpoints and enough climb to feel rewarding for beginners.',
                'required_equipment' => 'Water, light jacket, small first-aid kit',
                'best_season' => 'November to January',
            ],
        ])->map(fn ($trail) => Trail::create($trail));

        $galleryImages = [
            ['detailGallery1.jpg', 'detailGallery2.jpg', 'detailGallery3.jpg'],
            ['deeDoke.jpg', 'eventForest.jpg', 'detailGallery2.jpg'],
            ['mandalayRidge.jpg', 'detailHero.jpg', 'topoTable.jpg'],
        ];

        foreach ($trails as $index => $trail) {
            foreach ($galleryImages[$index] as $image) {
                $trail->images()->create(['image_path' => "trails/mock/{$image}"]);
            }
        }

        $trails[0]->ratings()->create([
            'user_id' => $verifiedOrganizer->id,
            'score' => 5,
            'review' => 'A rewarding sunrise route with clear steps and excellent city views.',
        ]);

        $trails[1]->ratings()->create([
            'user_id' => $explorer->id,
            'score' => 4,
            'review' => 'Beautiful pools and shaded rest stops. Grip shoes are essential on the rocks.',
        ]);

        // The explorer deliberately has no application, so the apply form can be
        // submitted from a clean state during a demo.

        $explorer->favorites()->attach([$trails[0]->id, $trails[1]->id]);

        $trails[1]->reports()->create([
            'user_id' => $explorer->id,
            'condition' => 'muddy',
            'notes' => 'The last descent to the pools is slippery after the weekend rain. Grip shoes are essential right now.',
            'status' => 'open',
        ]);

        $sunriseWalk = Event::create([
            'organizer_id' => $verifiedOrganizer->id,
            'trail_id' => $trails[0]->id,
            'title' => 'Saturday Sunrise Walk',
            'destination' => 'Mandalay Hill',
            'meeting_point' => 'South stairway entrance',
            'starts_at' => now()->addDays(5)->setTime(5, 30),
            'participant_limit' => 18,
            'required_equipment' => 'Water, shoes, light breakfast',
            'description' => 'A beginner-friendly sunrise hike followed by tea near the hill.',
            'cover_image' => $trails[0]->getRawOriginal('cover_image'),
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
            'cover_image' => $trails[1]->getRawOriginal('cover_image'),
        ]);

        $sunriseWalk->participants()->attach($explorer->id, ['attendance_status' => 'joined']);

        $sunrisePost = Post::create([
            'user_id' => $explorer->id,
            'title' => 'First sunrise hike at Mandalay Hill',
            'body' => 'The route was friendly for beginners, but starting before sunrise made the view much better. Bring water even for short climbs.',
            'image' => $trails[0]->getRawOriginal('cover_image'),
            'created_at' => now()->subDays(6),
            'updated_at' => now()->subDays(6),
        ]);

        $sunrisePost->comments()->create([
            'user_id' => $verifiedOrganizer->id,
            'body' => 'Glad it went well. The south stairway is the easiest start if you bring first-time hikers along.',
        ]);

        $sunrisePost->likes()->attach([$verifiedOrganizer->id, $admin->id]);

        $waterfallPost = Post::create([
            'user_id' => $verifiedOrganizer->id,
            'title' => 'Dee Dote is running high after the weekend rain',
            'body' => 'Checked the waterfall route this morning. The pools are full and the last descent is slick, so grip shoes are not optional right now. I am keeping group sizes small until the rocks dry out.',
            'image' => $trails[1]->getRawOriginal('cover_image'),
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ]);

        $waterfallPost->comments()->create([
            'user_id' => $explorer->id,
            'body' => 'Matches what I saw on Sunday. I slipped twice on the way down even with decent shoes.',
        ]);

        $waterfallPost->comments()->create([
            'user_id' => $admin->id,
            'body' => 'Thanks for flagging it. I have left the trail report open until conditions improve.',
        ]);

        $waterfallPost->likes()->attach([$explorer->id, $admin->id]);

        $gearPost = Post::create([
            'user_id' => $explorer->id,
            'title' => 'What is actually worth carrying on a Yankin Hill loop?',
            'body' => 'Three litres of water felt like too much for a three hour loop. I would swap one bottle for electrolyte sachets and a proper hat next time. Curious what everyone else packs.',
            'image' => null,
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);

        $gearPost->comments()->create([
            'user_id' => $verifiedOrganizer->id,
            'body' => 'Two litres plus sachets is what I brief my groups on. Add a small first-aid kit and you are set for the loop.',
        ]);

        $gearPost->likes()->attach([$verifiedOrganizer->id]);
    }
}
