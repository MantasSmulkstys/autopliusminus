<?php

use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CarModelController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ListingController;
use Illuminate\Support\Facades\Route;

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
