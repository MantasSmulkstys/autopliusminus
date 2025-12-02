<?php

use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CarModelController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\UserAdminController;
use Illuminate\Support\Facades\Route;

// JWT authentication endpoints for API / SPA clients
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

/**
 * Public (guest) API endpoints — no authentication required.
 *
 * Neregistruotas naudotojas:
 * - gali naršyti markes, modelius ir patvirtintus skelbimus,
 * - matyti konkretaus skelbimo informaciją su komentarais.
 */

// Brands (read-only for guests)
Route::apiResource('brands', BrandController::class)->only(['index', 'show']);

// Car Models (read-only for guests)
Route::apiResource('car-models', CarModelController::class)->only(['index', 'show']);
Route::get('/brands/{brandId}/car-models', [CarModelController::class, 'byBrand']);

// Listings (read-only for guests)
Route::apiResource('listings', ListingController::class)->only(['index', 'show']);
Route::get('/car-models/{modelId}/listings', [ListingController::class, 'byModel']);

// Comments (read-only for guests)
Route::get('/listings/{listingId}/comments', [CommentController::class, 'byListing'])->name('comments.byListing');
Route::apiResource('comments', CommentController::class)->only(['index', 'show']);

/**
 * Authenticated user endpoints — require valid JWT.
 *
 * Registruotas naudotojas:
 * - gali kurti / redaguoti / šalinti savo skelbimus,
 * - gali kurti / redaguoti / šalinti savo komentarus,
 * - gali atsijungti ir gauti informaciją apie save.
 */
Route::middleware('auth:api')->group(function () {
    // Authenticated user info & logout
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);
    
    // Profile management
    Route::patch('profile', [AuthController::class, 'updateProfile']);
    Route::put('profile/password', [AuthController::class, 'updatePassword']);

    // Listings — create / update / delete own listings
    Route::apiResource('listings', ListingController::class)->only(['store', 'update', 'destroy']);

    // Comments — create / update / delete own comments
    Route::apiResource('comments', CommentController::class)->only(['store', 'update', 'destroy']);

    /**
     * Administrator-only endpoints.
     *
     * Administratorius:
     * - tvirtina / atmeta skelbimus,
     * - šalina skelbimus ir komentarus,
     * - blokuoja naudotojus,
     * - tvarko markių ir modelių sąrašą.
     */
    Route::middleware('check.role:admin')->group(function () {
        // Admin dashboard example
        Route::get('admin/dashboard', function () {
            return response()->json([
                'message' => 'Admin dashboard access granted',
                'role' => auth()->guard('api')->user()->role,
            ]);
        });

        // Get all users
        Route::get('admin/users', [UserAdminController::class, 'index']);

        // Approve / reject listings
        Route::patch('/listings/{id}/approve', [ListingController::class, 'approve']);
        Route::patch('/listings/{id}/reject', [ListingController::class, 'reject']);

        // Admin management for brands & car models
        Route::apiResource('brands', BrandController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('car-models', CarModelController::class)->only(['store', 'update', 'destroy']);

        // Admin moderation for comments & listings (hard delete)
        Route::delete('/admin/listings/{id}', [ListingController::class, 'adminDestroy']);
        Route::delete('/admin/comments/{id}', [CommentController::class, 'adminDestroy']);

        // Admin: block / unblock users
        Route::patch('/admin/users/{id}/block', [UserAdminController::class, 'block']);
        Route::patch('/admin/users/{id}/unblock', [UserAdminController::class, 'unblock']);
    });
});