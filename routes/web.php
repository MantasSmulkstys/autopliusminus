<?php

use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CarModelController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ListingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::prefix('api')->group(function () {
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
