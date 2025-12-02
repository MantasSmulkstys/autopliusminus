<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserAdminController extends Controller
{
    /**
     * Get all users (admin only).
     */
    public function index(): JsonResponse
    {
        $users = User::all();
        return response()->json($users, 200);
    }

    /**
     * Block a user (admin only).
     */
    public function block(int $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Prevent admin from blocking themselves
        if ($user->id === auth()->guard('api')->id()) {
            return response()->json(['message' => 'You cannot block yourself'], 422);
        }

        $user->forceFill(['is_blocked' => true])->save();

        return response()->json([
            'message' => 'User blocked successfully',
            'user' => $user,
        ], 200);
    }

    /**
     * Unblock a user (admin only).
     */
    public function unblock(int $id): JsonResponse
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->forceFill(['is_blocked' => false])->save();

        return response()->json([
            'message' => 'User unblocked successfully',
            'user' => $user,
        ], 200);
    }
}



