<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            [
                'name' => 'BMW',
                'description' => 'German luxury automobile manufacturer known for performance and engineering excellence.',
            ],
            [
                'name' => 'Audi',
                'description' => 'German luxury car brand recognized for innovative technology and elegant design.',
            ],
            [
                'name' => 'Mercedes-Benz',
                'description' => 'German luxury automotive brand synonymous with prestige and innovation.',
            ],
            [
                'name' => 'Toyota',
                'description' => 'Japanese automotive manufacturer known for reliability and fuel efficiency.',
            ],
            [
                'name' => 'Honda',
                'description' => 'Japanese automaker famous for quality engineering and practical vehicles.',
            ],
            [
                'name' => 'Volkswagen',
                'description' => 'German automotive manufacturer offering practical and reliable vehicles.',
            ],
            [
                'name' => 'Ford',
                'description' => 'American automotive company known for trucks and versatile vehicles.',
            ],
            [
                'name' => 'Nissan',
                'description' => 'Japanese automaker recognized for innovation and value-oriented vehicles.',
            ],
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
}

