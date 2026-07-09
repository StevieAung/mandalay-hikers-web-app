<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\OrganizerApplicationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TrailController;
use Illuminate\Support\Facades\Route;

Route::get('/trails', [TrailController::class, 'index']);
Route::get('/trails/{trail}', [TrailController::class, 'show']);
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);
Route::get('/posts', [CommunityController::class, 'posts']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'not.banned'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::post('/trails/{trail}/favorite', [TrailController::class, 'favorite']);
    Route::delete('/trails/{trail}/favorite', [TrailController::class, 'unfavorite']);
    Route::post('/trails/{trail}/ratings', [TrailController::class, 'rate']);
    Route::post('/trails/{trail}/reports', [TrailController::class, 'report']);

    Route::post('/events/{event}/join', [EventController::class, 'join']);
    Route::delete('/events/{event}/join', [EventController::class, 'leave']);

    Route::post('/posts', [CommunityController::class, 'storePost']);
    Route::post('/posts/{post}/comments', [CommunityController::class, 'comment']);
    Route::delete('/posts/{post}', [CommunityController::class, 'deletePost']);
    Route::delete('/comments/{comment}', [CommunityController::class, 'deleteComment']);

    Route::post('/organizer-applications', [OrganizerApplicationController::class, 'store']);

    Route::middleware('role:organizer,admin')->group(function () {
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{event}', [EventController::class, 'update']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);
        Route::get('/events/{event}/participants', [EventController::class, 'participants']);
        Route::put('/events/{event}/attendance', [EventController::class, 'attendance']);
    });

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::patch('/users/{user}', [AdminController::class, 'updateUser']);
        Route::apiResource('/trails', TrailController::class)->except(['index', 'show']);
        Route::get('/events', [AdminController::class, 'events']);
        Route::patch('/events/{event}/feature', [AdminController::class, 'featureEvent']);
        Route::get('/organizer-applications', [OrganizerApplicationController::class, 'index']);
        Route::patch('/organizer-applications/{application}', [OrganizerApplicationController::class, 'review']);
        Route::get('/reports', [AdminController::class, 'reports']);
        Route::patch('/reports/{report}', [AdminController::class, 'updateReport']);
        Route::get('/posts', [AdminController::class, 'posts']);
    });
});
