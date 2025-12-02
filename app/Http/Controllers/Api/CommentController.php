<?php

namespace App\Http\Controllers\Api;

use App\Models\Comment;
use App\Models\Listing;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Listing comments",
 *     description="API endpoints for managing comments"
 * )
 */
class CommentController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/listings/{listingId}/comments",
     *     summary="Get comments by listing",
     *     tags={"Comments"},
     *     @OA\Parameter(
     *         name="listingId",
     *         in="path",
     *         required=true,
     *         description="Listing ID to fetch comments for",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="List of comments"),
     *     @OA\Response(response=404, description="Listing not found")
     * )
     */
    public function byListing($listingId)
    {
        $listing = Listing::find($listingId);

        if (!$listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        $comments = $listing->comments()->with('user')->get();
        return response()->json($comments, 200);
    }

    /**
     * @OA\Get(
     *     path="/api/comments",
     *     summary="Get all comments",
     *     tags={"Comments"},
     *     @OA\Response(response=200, description="List of comments")
     * )
     */
    public function index()
    {
        $comments = Comment::with('user', 'listing')->get();
        return response()->json($comments, 200);
    }

    /**
     * @OA\Post(
     *     path="/api/comments",
     *     summary="Create a new comment",
     *     tags={"Comments"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"listing_id", "content"},
     *             @OA\Property(property="listing_id", type="integer", example=1),
     *             @OA\Property(property="content", type="string", example="Great listing!")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Comment created"),
     *     @OA\Response(response=422, description="Validation failed")
     * )
     */
    public function store(Request $request)
    {
        if (! auth('api')->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (auth('api')->user()->is_blocked ?? false) {
            return response()->json(['message' => 'User is blocked'], 403);
        }

        $validated = $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'content' => 'required|string|min:1'
        ]);

        $validated['user_id'] = auth('api')->id();

        $comment = Comment::create($validated);
        return response()->json($comment, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/comments/{id}",
     *     summary="Get comment details",
     *     tags={"Comments"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Comment ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Comment details"),
     *     @OA\Response(response=404, description="Comment not found")
     * )
     */
    public function show($id)
    {
        $comment = Comment::with('user', 'listing')->find($id);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        return response()->json($comment, 200);
    }

    /**
     * @OA\Put(
     *     path="/api/comments/{id}",
     *     summary="Update an existing comment",
     *     tags={"Comments"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Comment ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"content"},
     *             @OA\Property(property="content", type="string", example="Updated comment text")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Comment updated"),
     *     @OA\Response(response=404, description="Comment not found"),
     *     @OA\Response(response=422, description="Validation failed")
     * )
     */
    public function update(Request $request, $id)
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        $user = auth('api')->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->is_blocked ?? false) {
            return response()->json(['message' => 'User is blocked'], 403);
        }

        // Only owner or admin can edit a comment
        if ($comment->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|min:1'
        ]);

        $comment->update($validated);
        return response()->json($comment, 200);
    }


    /**
     * @OA\Delete(
     *     path="/api/comments/{id}",
     *     summary="Delete a comment",
     *     tags={"Comments"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Comment ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=204, description="Comment deleted"),
     *     @OA\Response(response=404, description="Comment not found")
     * )
     */
    public function destroy($id)
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        $user = auth('api')->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->is_blocked ?? false) {
            return response()->json(['message' => 'User is blocked'], 403);
        }

        // Only owner or admin can delete a comment
        if ($comment->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $comment->delete();
        return response()->json(null, 204);
    }

    /**
     * Admin-only: delete any comment by ID.
     */
    public function adminDestroy($id)
    {
        $comment = Comment::find($id);

        if (! $comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        $comment->delete();

        return response()->json(null, 204);
    }
}
