<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\OrganizerApplication;
use App\Models\Post;
use App\Models\Trail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    private function trailData(): array
    {
        return [
            'name' => 'Mandalay Hill Sunrise Trail',
            'location' => 'Mandalay Hill',
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
