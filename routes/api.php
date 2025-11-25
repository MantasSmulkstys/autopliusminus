<?php

use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CarModelController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);
    
    Route::middleware('check.role:admin')->group(function () {
        Route::get('admin/dashboard', function () {
            return response()->json([
                'message' => 'Admin dashboard access granted',
                'role' => auth()->user()->role
            ]);
        });
    });
});

// Brands
Route::apiResource('brands', BrandController::class);

// Car Models
Route::apiResource('car-models', CarModelController::class);
Route::get('/brands/{brandId}/car-models', [CarModelController::class, 'byBrand']);

// Listings
Route::apiResource('listings', ListingController::class);
Route::get('/car-models/{modelId}/listings', [ListingController::class, 'byModel']);
Route::patch('/listings/{id}/approve', [ListingController::class, 'approve']);
Route::patch('/listings/{id}/reject', [ListingController::class, 'reject']);

// Comments
Route::apiResource('comments', CommentController::class);
Route::get('/listings/{listingId}/comments', [CommentController::class, 'byListing']);