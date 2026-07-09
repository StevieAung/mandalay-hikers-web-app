<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('location')->nullable();
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->text('bio')->nullable();
            $table->timestamps();
        });

        Schema::create('organizer_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('reason');
            $table->string('status')->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('trails', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location');
            $table->string('difficulty');
            $table->decimal('distance_km', 6, 2);
            $table->string('duration');
            $table->integer('elevation_m')->default(0);
            $table->string('cover_image')->nullable();
            $table->text('description');
            $table->text('required_equipment')->nullable();
            $table->string('best_season')->nullable();
            $table->timestamps();
        });

        Schema::create('trail_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trail_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->timestamps();
        });

        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('trail_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'trail_id']);
        });

        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('trail_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('score');
            $table->text('review')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'trail_id']);
        });

        Schema::create('trail_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('trail_id')->constrained()->cascadeOnDelete();
            $table->string('condition');
            $table->text('notes')->nullable();
            $table->string('status')->default('open');
            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('trail_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('destination');
            $table->string('meeting_point');
            $table->dateTime('starts_at');
            $table->unsignedInteger('participant_limit');
            $table->text('required_equipment')->nullable();
            $table->text('description');
            $table->string('status')->default('upcoming');
            $table->string('cover_image')->nullable();
            $table->timestamps();
        });

        Schema::create('event_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('attendance_status')->default('joined');
            $table->timestamps();
            $table->unique(['event_id', 'user_id']);
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('image')->nullable();
            $table->timestamps();
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('event_participants');
        Schema::dropIfExists('events');
        Schema::dropIfExists('trail_reports');
        Schema::dropIfExists('ratings');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('trail_images');
        Schema::dropIfExists('trails');
        Schema::dropIfExists('organizer_applications');
        Schema::dropIfExists('profiles');
    }
};
