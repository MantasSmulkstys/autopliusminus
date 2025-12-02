<?php

namespace Database\Seeders;

use App\Models\Listing;
use App\Models\User;
use App\Models\CarModel;
use Illuminate\Database\Seeder;

class ListingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('role', 'user')->first();
        
        if (!$user) {
            $this->command->warn('No user found. Please run UserSeeder first.');
            return;
        }

        $carModels = CarModel::all();
        
        if ($carModels->isEmpty()) {
            $this->command->warn('No car models found. Please run CarModelSeeder first.');
            return;
        }

        $listings = [
            [
                'car_model_id' => $carModels->where('name', '3 Series')->first()->id ?? $carModels->random()->id,
                'title' => '2020 BMW 3 Series - Excellent Condition',
                'description' => 'Well-maintained BMW 3 Series with full service history. Single owner, garage kept. All original features working perfectly. No accidents, clean title. Perfect for someone looking for a reliable luxury sedan.',
                'price' => 28500.00,
                'mileage' => 32000,
                'color' => 'Black',
                'status' => 'approved',
                'admin_comment' => 'Verified listing - all documents checked.',
            ],
            [
                'car_model_id' => $carModels->where('name', 'A4')->first()->id ?? $carModels->random()->id,
                'title' => '2020 Audi A4 - Premium Package',
                'description' => 'Beautiful Audi A4 with premium interior and technology package. Regular maintenance performed at authorized dealer. Excellent fuel economy. Ready to drive.',
                'price' => 27500.00,
                'mileage' => 28000,
                'color' => 'Silver',
                'status' => 'approved',
                'admin_comment' => null,
            ],
            [
                'car_model_id' => $carModels->where('name', 'Camry')->first()->id ?? $carModels->random()->id,
                'title' => '2020 Toyota Camry - Low Miles',
                'description' => 'Reliable Toyota Camry with very low mileage. Perfect for daily commuting. Great fuel efficiency. All maintenance up to date. Non-smoker vehicle.',
                'price' => 19500.00,
                'mileage' => 25000,
                'color' => 'White',
                'status' => 'approved',
                'admin_comment' => null,
            ],
            [
                'car_model_id' => $carModels->where('name', 'Civic')->first()->id ?? $carModels->random()->id,
                'title' => '2021 Honda Civic - Sporty and Efficient',
                'description' => 'Sporty Honda Civic with excellent handling. Great for city driving. Low maintenance costs. Clean interior and exterior. Perfect first car or commuter vehicle.',
                'price' => 22000.00,
                'mileage' => 18000,
                'color' => 'Blue',
                'status' => 'approved',
                'admin_comment' => null,
            ],
            [
                'car_model_id' => $carModels->where('name', 'RAV4')->first()->id ?? $carModels->random()->id,
                'title' => '2019 Toyota RAV4 - Family SUV',
                'description' => 'Spacious Toyota RAV4 perfect for families. All-wheel drive capability. Great safety features. Well-maintained with service records. Ready for your next adventure.',
                'price' => 24500.00,
                'mileage' => 45000,
                'color' => 'Gray',
                'status' => 'approved',
                'admin_comment' => null,
            ],
            [
                'car_model_id' => $carModels->where('name', 'Mustang')->first()->id ?? $carModels->random()->id,
                'title' => '2020 Ford Mustang - V8 Power',
                'description' => 'Powerful Ford Mustang with V8 engine. Excellent performance and sound. Well-cared for by enthusiast owner. Perfect for weekend drives and car shows.',
                'price' => 32000.00,
                'mileage' => 22000,
                'color' => 'Red',
                'status' => 'pending',
                'admin_comment' => null,
            ],
            [
                'car_model_id' => $carModels->where('name', 'Q5')->first()->id ?? $carModels->random()->id,
                'title' => '2019 Audi Q5 - Luxury SUV',
                'description' => 'Premium Audi Q5 with all the bells and whistles. Quattro all-wheel drive. Panoramic sunroof. Premium sound system. Perfect condition.',
                'price' => 35000.00,
                'mileage' => 38000,
                'color' => 'Black',
                'status' => 'approved',
                'admin_comment' => 'High-quality listing verified.',
            ],
            [
                'car_model_id' => $carModels->where('name', 'CR-V')->first()->id ?? $carModels->random()->id,
                'title' => '2019 Honda CR-V - Reliable Compact SUV',
                'description' => 'Trusted Honda CR-V with excellent reliability record. Great fuel economy. Spacious cargo area. Perfect for daily use and road trips.',
                'price' => 23500.00,
                'mileage' => 42000,
                'color' => 'White',
                'status' => 'approved',
                'admin_comment' => null,
            ],
            [
                'car_model_id' => $carModels->where('name', 'F-150')->first()->id ?? $carModels->random()->id,
                'title' => '2021 Ford F-150 - Work Ready',
                'description' => 'Capable Ford F-150 pickup truck. Great for work or recreation. Strong towing capacity. Well-maintained. Ready for heavy-duty tasks.',
                'price' => 42000.00,
                'mileage' => 15000,
                'color' => 'Black',
                'status' => 'pending',
                'admin_comment' => null,
            ],
            [
                'car_model_id' => $carModels->where('name', 'E-Class')->first()->id ?? $carModels->random()->id,
                'title' => '2021 Mercedes-Benz E-Class - Executive Luxury',
                'description' => 'Luxurious Mercedes-Benz E-Class with premium features. Comfortable ride quality. Advanced safety systems. Perfect for business or pleasure.',
                'price' => 48000.00,
                'mileage' => 20000,
                'color' => 'Silver',
                'status' => 'approved',
                'admin_comment' => 'Premium listing verified.',
            ],
        ];

        foreach ($listings as $listing) {
            Listing::create([
                'user_id' => $user->id,
                'car_model_id' => $listing['car_model_id'],
                'title' => $listing['title'],
                'description' => $listing['description'],
                'price' => $listing['price'],
                'mileage' => $listing['mileage'],
                'color' => $listing['color'],
                'status' => $listing['status'],
                'admin_comment' => $listing['admin_comment'],
            ]);
        }
    }
}

