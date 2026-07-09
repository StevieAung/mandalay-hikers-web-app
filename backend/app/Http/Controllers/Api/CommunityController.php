<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function posts()
    {
        return Post::with(['user:id,name,role', 'comments.user:id,name'])->withCount('comments')->latest()->paginate(12);
    }

    public function storePost(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'image' => ['nullable'],
        ]);

        $data['user_id'] = $request->user()->id;
        $data['image'] = $this->storeImage($request, 'image', 'posts');

        return response()->json(Post::create($data)->load('user:id,name,role'), 201);
    }

    public function comment(Request $request, Post $post)
    {
        $data = $request->validate(['body' => ['required', 'string']]);

        return response()->json($post->comments()->create($data + ['user_id' => $request->user()->id])->load('user:id,name'), 201);
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
}
