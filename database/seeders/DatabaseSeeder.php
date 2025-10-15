<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Brand;
use App\Models\CarModel;
use App\Models\Listing;
use App\Models\Comment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Sukurti naudotojus (guest, user, admin)
        User::create([
            'name' => 'Guest User',
            'email' => 'guest@example.com',
            'password' => Hash::make('password'),
            'role' => 'guest',
            'credits' => 0,
        ]);

        User::create([
            'name' => 'John Doe',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'credits' => 100,
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'user2@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'credits' => 50,
        ]);

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'credits' => 0,
        ]);

        // 2. Sukurti markes
        Brand::factory(8)->create();

        // 3. Sukurti modelius (3-4 kiekvienai markai)
        CarModel::factory(25)->create();

        // 4. Sukurti skelbimu (15-20)
        Listing::factory(20)->create();

        // 5. Sukurti komentaru (50+)
        Comment::factory(60)->create();

        echo "✅ Database seeded successfully!";
    }
}
