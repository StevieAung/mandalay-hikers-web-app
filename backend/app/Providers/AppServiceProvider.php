<?php

namespace App\Providers;

use App\Models\Event;
use App\Models\OrganizerApplication;
use App\Models\Post;
use App\Models\Trail;
use App\Policies\EventPolicy;
use App\Policies\OrganizerApplicationPolicy;
use App\Policies\PostPolicy;
use App\Policies\TrailPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Event::class, EventPolicy::class);
        Gate::policy(OrganizerApplication::class, OrganizerApplicationPolicy::class);
        Gate::policy(Post::class, PostPolicy::class);
        Gate::policy(Trail::class, TrailPolicy::class);
    }
}
