<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function posts(Request $request)
    {
        return $this->feedQuery($request)->latest()->paginate(12);
    }

    public function post(Request $request, Post $post)
    {
        return $this->feedQuery($request)->findOrFail($post->id);
    }

    public function storePost(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:6144'],
        ]);

        $data['user_id'] = $request->user()->id;
        $data['image'] = $this->storeImage($request, 'image', 'posts');

        $post = Post::create($data);

        return response()->json($this->feedQuery($request)->findOrFail($post->id), 201);
    }

    public function comment(Request $request, Post $post)
    {
        $data = $request->validate(['body' => ['required', 'string']]);

        $comment = $post->comments()->create($data + ['user_id' => $request->user()->id]);

        return response()->json(
            $comment->load(['user:id,name,role,is_verified', 'user.profile:id,user_id,avatar']),
            201,
        );
    }

    public function like(Request $request, Post $post)
    {
        $post->likes()->syncWithoutDetaching([$request->user()->id]);

        return ['liked' => true, 'likes_count' => $post->likes()->count()];
    }

    public function unlike(Request $request, Post $post)
    {
        $post->likes()->detach($request->user()->id);

        return ['liked' => false, 'likes_count' => $post->likes()->count()];
    }

    public function deletePost(Request $request, Post $post)
    {
        if ($request->user()->role !== 'admin' && $post->user_id !== $request->user()->id) {
            abort(403);
        }

        $post->delete();

        return response()->noContent();
    }

    public function deleteComment(Request $request, Comment $comment)
    {
        if ($request->user()->role !== 'admin' && $comment->user_id !== $request->user()->id) {
            abort(403);
        }

        $comment->delete();

        return response()->noContent();
    }

    /**
     * Every read path shares this shape so the newsfeed renders the same card
     * whether it came from the list, the permalink, or a fresh publish.
     */
    private function feedQuery(Request $request)
    {
        $viewer = $request->user('sanctum');

        return Post::with([
            'user:id,name,email,role,is_verified',
            'user.profile:id,user_id,avatar',
            'comments' => fn ($query) => $query->oldest(),
            'comments.user:id,name,role,is_verified',
            'comments.user.profile:id,user_id,avatar',
        ])
            ->withCount(['comments', 'likes'])
            ->when($viewer, fn ($query) => $query->withExists([
                'likes as is_liked' => fn ($sub) => $sub->where('users.id', $viewer->id),
            ]));
    }
}
