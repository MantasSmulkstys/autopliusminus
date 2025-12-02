<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Public routes - accessible to everyone (guests)
 */
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('listings', function () {
    return Inertia::render('listings/index');
})->name('listings.page');

Route::get('listings/{id}', function ($id) {
    return Inertia::render('listings/show', ['id' => $id]);
})->name('listings.detail');

/**
 * Authentication pages (for Inertia frontend)
 * These pages will call the JWT API endpoints
 */
Route::middleware('guest')->group(function () {
    Route::get('login', function () {
        return Inertia::render('auth/login');
    })->name('login');

    Route::get('register', function () {
        return Inertia::render('auth/register');
    })->name('register');
});

/**
 * Authenticated routes - these pages will check JWT on the frontend
 */
Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->name('dashboard');

Route::get('profile', function () {
    return Inertia::render('profile');
})->name('profile');

Route::get('admin', function () {
    return Inertia::render('admin/dashboard');
})->name('admin.dashboard');

require __DIR__.'/settings.php';
