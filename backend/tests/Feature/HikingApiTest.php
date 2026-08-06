<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\OrganizerApplication;
use App\Models\Post;
use App\Models\Rating;
use App\Models\Trail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HikingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_login_and_read_profile(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'May',
            'email' => 'may@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertCreated()->assertJsonPath('user.role', 'explorer')->assertJsonStructure(['token']);

        $login = $this->postJson('/api/auth/login', [
            'email' => 'may@example.test',
            'password' => 'password',
        ])->assertOk()->json('token');

        $this->withToken($login)->getJson('/api/auth/me')->assertOk()->assertJsonPath('email', 'may@example.test');
    }

    public function test_explorer_cannot_create_events_but_organizer_can(): void
    {
        $trail = Trail::create($this->trailData());
        $explorer = User::factory()->create();
        $organizer = User::factory()->create(['role' => 'organizer']);

        $payload = $this->eventData($trail);

        $this->actingAs($explorer)->postJson('/api/events', $payload)->assertForbidden();
        $this->actingAs($organizer)->postJson('/api/events', $payload)->assertCreated()->assertJsonPath('title', 'Saturday Sunrise Walk');
    }

    public function test_join_event_enforces_capacity_and_prevents_duplicates(): void
    {
        $trail = Trail::create($this->trailData());
        $organizer = User::factory()->create(['role' => 'organizer']);
        $event = Event::create(array_merge($this->eventData($trail), ['organizer_id' => $organizer->id, 'participant_limit' => 1]));
        $first = User::factory()->create();
        $second = User::factory()->create();

        $this->actingAs($first)->postJson("/api/events/{$event->id}/join")->assertOk()->assertJsonPath('participants_count', 1);
        $this->actingAs($first)->postJson("/api/events/{$event->id}/join")->assertUnprocessable();
        $this->actingAs($second)->postJson("/api/events/{$event->id}/join")->assertUnprocessable();
    }

    public function test_admin_approval_turns_explorer_into_organizer(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $explorer = User::factory()->create();
        $application = OrganizerApplication::create(['user_id' => $explorer->id, 'reason' => 'I lead safe weekend hikes around Mandalay.']);

        $this->actingAs($admin)->patchJson("/api/admin/organizer-applications/{$application->id}", [
            'status' => 'approved',
            'review_note' => 'Good local experience.',
        ])->assertOk()->assertJsonPath('user.role', 'organizer');

        $this->assertSame('organizer', $explorer->fresh()->role);
    }

    public function test_authenticated_users_can_favorite_rate_report_and_post(): void
    {
        $trail = Trail::create($this->trailData());
        $user = User::factory()->create();

        $this->actingAs($user)->postJson("/api/trails/{$trail->id}/favorite")->assertOk()->assertJsonPath('favorited', true);
        $this->actingAs($user)->postJson("/api/trails/{$trail->id}/ratings", ['score' => 5, 'review' => 'Great beginner trail.'])->assertOk();
        $this->actingAs($user)->postJson("/api/trails/{$trail->id}/reports", ['condition' => 'Clear', 'notes' => 'Dry steps today.'])->assertCreated();

        $post = $this->actingAs($user)->postJson('/api/posts', [
            'title' => 'Good morning climb',
            'body' => 'Short, bright, and friendly for beginners.',
        ])->assertCreated()->json();

        $this->actingAs($user)->postJson("/api/posts/{$post['id']}/comments", ['body' => 'Thanks for the notes.'])->assertCreated();
        $this->assertDatabaseHas(Post::class, ['title' => 'Good morning climb']);
    }

    public function test_trail_reviews_require_authentication_and_validate_payloads(): void
    {
        $trail = Trail::create($this->trailData());
        $user = User::factory()->create();

        $this->postJson("/api/trails/{$trail->id}/ratings", ['score' => 5])->assertUnauthorized();
        $this->deleteJson("/api/trails/{$trail->id}/ratings")->assertUnauthorized();

        $this->actingAs($user)->postJson("/api/trails/{$trail->id}/ratings", ['score' => 0])->assertUnprocessable();
        $this->actingAs($user)->postJson("/api/trails/{$trail->id}/ratings", ['score' => 6])->assertUnprocessable();
        $this->actingAs($user)->postJson("/api/trails/{$trail->id}/ratings", [
            'score' => 5,
            'review' => str_repeat('a', 1001),
        ])->assertUnprocessable();

        $this->actingAs($user)->postJson("/api/trails/{$trail->id}/ratings", [
            'score' => 4,
            'review' => null,
        ])->assertOk()->assertJsonPath('score', 4)->assertJsonPath('review', null);
    }

    public function test_user_can_create_and_update_one_review_per_trail(): void
    {
        $trail = Trail::create($this->trailData());
        $user = User::factory()->create();

        $this->actingAs($user)->postJson("/api/trails/{$trail->id}/ratings", [
            'score' => 3,
            'review' => 'Rocky but manageable.',
        ])->assertOk();

        $this->actingAs($user)->postJson("/api/trails/{$trail->id}/ratings", [
            'score' => 5,
            'review' => 'Even better on the second visit.',
        ])->assertOk()->assertJsonPath('score', 5);

        $this->assertDatabaseCount(Rating::class, 1);
        $this->assertDatabaseHas(Rating::class, [
            'trail_id' => $trail->id,
            'user_id' => $user->id,
            'score' => 5,
            'review' => 'Even better on the second visit.',
        ]);
    }

    public function test_trail_detail_returns_rating_aggregates_and_newest_reviews_first(): void
    {
        $trail = Trail::create($this->trailData());
        $olderUser = User::factory()->create(['name' => 'Older Reviewer']);
        $newerUser = User::factory()->create(['name' => 'Newer Reviewer', 'role' => 'organizer']);

        $older = $trail->ratings()->create(['user_id' => $olderUser->id, 'score' => 3, 'review' => 'First review.']);
        $older->forceFill(['created_at' => now()->subDay(), 'updated_at' => now()->subDay()])->save();
        $newer = $trail->ratings()->create(['user_id' => $newerUser->id, 'score' => 5, 'review' => 'Latest review.']);
        $newer->forceFill(['created_at' => now(), 'updated_at' => now()])->save();

        $this->getJson("/api/trails/{$trail->id}")
            ->assertOk()
            ->assertJsonPath('ratings_count', 2)
            ->assertJsonPath('ratings_avg_score', 4)
            ->assertJsonPath('ratings.0.review', 'Latest review.')
            ->assertJsonPath('ratings.0.user.name', 'Newer Reviewer')
            ->assertJsonPath('ratings.0.user.role', 'organizer')
            ->assertJsonPath('ratings.1.review', 'First review.');

        $this->getJson('/api/trails')->assertOk()->assertJsonPath('data.0.ratings_count', 2);
    }

    public function test_user_can_delete_only_their_own_trail_review(): void
    {
        $trail = Trail::create($this->trailData());
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();
        $trail->ratings()->create(['user_id' => $firstUser->id, 'score' => 5, 'review' => 'Mine.']);
        $trail->ratings()->create(['user_id' => $secondUser->id, 'score' => 4, 'review' => 'Keep this.']);

        $this->actingAs($firstUser)->deleteJson("/api/trails/{$trail->id}/ratings")->assertNoContent();

        $this->assertDatabaseMissing(Rating::class, ['trail_id' => $trail->id, 'user_id' => $firstUser->id]);
        $this->assertDatabaseHas(Rating::class, ['trail_id' => $trail->id, 'user_id' => $secondUser->id]);
        $this->actingAs($firstUser)->deleteJson("/api/trails/{$trail->id}/ratings")->assertNoContent();
    }

    public function test_admin_can_upload_and_manage_trail_images(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $cover = UploadedFile::fake()->image('cover.jpg');
        $galleryOne = UploadedFile::fake()->image('gallery-one.png');
        $galleryTwo = UploadedFile::fake()->image('gallery-two.webp');

        $created = $this->actingAs($admin)->post('/api/admin/trails', array_merge($this->trailData(), [
            'cover_image' => $cover,
            'gallery_images' => [$galleryOne, $galleryTwo],
        ]))->assertCreated()->assertJsonCount(2, 'images')->json();

        $trail = Trail::findOrFail($created['id']);
        $this->assertStringStartsWith('trails/', $trail->getRawOriginal('cover_image'));
        Storage::disk('public')->assertExists($trail->getRawOriginal('cover_image'));
        $this->assertCount(2, $trail->images);
        $this->assertStringContainsString('/storage/trails/', $created['cover_image']);
        $this->assertStringContainsString('/storage/trails/gallery/', $created['images'][0]['image_path']);

        $this->actingAs($admin)->putJson("/api/admin/trails/{$trail->id}", [
            'name' => 'Updated trail name',
        ])->assertOk();
        $this->assertSame($trail->getRawOriginal('cover_image'), $trail->fresh()->getRawOriginal('cover_image'));

        $gallery = $trail->images()->firstOrFail();
        $galleryPath = $gallery->getRawOriginal('image_path');
        $this->actingAs($admin)->delete("/api/admin/trails/{$trail->id}/images/{$gallery->id}")
            ->assertNoContent();
        $this->assertDatabaseMissing('trail_images', ['id' => $gallery->id]);
        Storage::disk('public')->assertMissing($galleryPath);
    }

    public function test_admin_trail_coordinates_are_required_validated_and_persisted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/admin/trails', array_diff_key($this->trailData(), [
            'latitude' => true,
            'longitude' => true,
        ]))->assertUnprocessable()->assertJsonValidationErrors(['latitude', 'longitude']);

        $this->actingAs($admin)->postJson('/api/admin/trails', array_merge($this->trailData(), [
            'latitude' => 95,
            'longitude' => 96.109715,
        ]))->assertUnprocessable()->assertJsonValidationErrors('latitude');

        $created = $this->actingAs($admin)->postJson('/api/admin/trails', $this->trailData())
            ->assertCreated()
            ->assertJsonPath('latitude', '22.0019060')
            ->assertJsonPath('longitude', '96.1097150')
            ->json();

        $this->actingAs($admin)->putJson("/api/admin/trails/{$created['id']}", [
            'latitude' => 21.930625,
        ])->assertUnprocessable()->assertJsonValidationErrors(['latitude', 'longitude']);

        $this->actingAs($admin)->putJson("/api/admin/trails/{$created['id']}", [
            'latitude' => 21.930625,
            'longitude' => 96.143089,
        ])->assertOk()->assertJsonPath('latitude', '21.9306250')->assertJsonPath('longitude', '96.1430890');
    }

    public function test_legacy_trails_without_coordinates_can_still_be_read_and_updated(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $trail = Trail::forceCreate(array_diff_key($this->trailData(), [
            'latitude' => true,
            'longitude' => true,
        ]));

        $this->getJson("/api/trails/{$trail->id}")
            ->assertOk()
            ->assertJsonPath('latitude', null)
            ->assertJsonPath('longitude', null);

        $this->actingAs($admin)->putJson("/api/admin/trails/{$trail->id}", [
            'name' => 'Legacy trail renamed',
        ])->assertOk()->assertJsonPath('name', 'Legacy trail renamed');
    }

    public function test_only_admins_can_upload_trail_images_and_uploads_must_be_images(): void
    {
        Storage::fake('public');
        $explorer = User::factory()->create();

        $this->actingAs($explorer)->post('/api/admin/trails', array_merge($this->trailData(), [
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
        ]))->assertForbidden();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->post('/api/admin/trails', array_merge($this->trailData(), [
            'cover_image' => UploadedFile::fake()->create('notes.pdf', 64, 'application/pdf'),
        ]))->assertUnprocessable()->assertJsonValidationErrors('cover_image');
    }

    private function trailData(): array
    {
        return [
            'name' => 'Mandalay Hill Sunrise Trail',
            'location' => 'Mandalay Hill',
            'latitude' => 22.001906,
            'longitude' => 96.109715,
            'difficulty' => 'Easy',
            'distance_km' => 4.2,
            'duration' => '2 hours',
            'elevation_m' => 240,
            'description' => 'A gentle route with city views.',
            'required_equipment' => 'Water and shoes',
            'best_season' => 'November to February',
        ];
    }

    private function eventData(Trail $trail): array
    {
        return [
            'trail_id' => $trail->id,
            'title' => 'Saturday Sunrise Walk',
            'destination' => 'Mandalay Hill',
            'meeting_point' => 'South stairway entrance',
            'starts_at' => now()->addWeek()->toDateTimeString(),
            'participant_limit' => 12,
            'required_equipment' => 'Water and shoes',
            'description' => 'A beginner-friendly morning hike.',
        ];
    }
}
