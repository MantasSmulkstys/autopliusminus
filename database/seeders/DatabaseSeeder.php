<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed in order: Users -> Brands -> Car Models -> Listings -> Comments
        $this->call([
            UserSeeder::class,
            BrandSeeder::class,
            CarModelSeeder::class,
            ListingSeeder::class,
            CommentSeeder::class,
        ]);

        $this->command->info('✅ Database seeded successfully!');
    }
}
