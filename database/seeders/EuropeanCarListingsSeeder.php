<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Brand;
use App\Models\CarModel;
use App\Models\Listing;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EuropeanCarListingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Popular European car brands and their models
        $europeanCars = [
            'Volkswagen' => [
                ['name' => 'Golf', 'years' => [2018, 2019, 2020, 2021]],
                ['name' => 'Passat', 'years' => [2017, 2018, 2019, 2020]],
                ['name' => 'Tiguan', 'years' => [2019, 2020, 2021, 2022]],
                ['name' => 'Polo', 'years' => [2018, 2019, 2020]],
            ],
            'BMW' => [
                ['name' => '3 Series', 'years' => [2018, 2019, 2020, 2021]],
                ['name' => '5 Series', 'years' => [2017, 2018, 2019, 2020]],
                ['name' => 'X3', 'years' => [2019, 2020, 2021, 2022]],
                ['name' => 'X5', 'years' => [2018, 2019, 2020, 2021]],
            ],
            'Mercedes-Benz' => [
                ['name' => 'C-Class', 'years' => [2018, 2019, 2020, 2021]],
                ['name' => 'E-Class', 'years' => [2017, 2018, 2019, 2020]],
                ['name' => 'GLC', 'years' => [2019, 2020, 2021, 2022]],
                ['name' => 'A-Class', 'years' => [2018, 2019, 2020]],
            ],
            'Audi' => [
                ['name' => 'A4', 'years' => [2018, 2019, 2020, 2021]],
                ['name' => 'A6', 'years' => [2017, 2018, 2019, 2020]],
                ['name' => 'Q5', 'years' => [2019, 2020, 2021, 2022]],
                ['name' => 'A3', 'years' => [2018, 2019, 2020]],
            ],
            'Peugeot' => [
                ['name' => '308', 'years' => [2018, 2019, 2020]],
                ['name' => '3008', 'years' => [2019, 2020, 2021]],
                ['name' => '208', 'years' => [2018, 2019, 2020]],
            ],
            'Renault' => [
                ['name' => 'Clio', 'years' => [2018, 2019, 2020]],
                ['name' => 'Megane', 'years' => [2017, 2018, 2019]],
                ['name' => 'Captur', 'years' => [2019, 2020, 2021]],
            ],
            'Volvo' => [
                ['name' => 'XC60', 'years' => [2018, 2019, 2020, 2021]],
                ['name' => 'XC90', 'years' => [2017, 2018, 2019, 2020]],
                ['name' => 'V60', 'years' => [2018, 2019, 2020]],
            ],
            'Skoda' => [
                ['name' => 'Octavia', 'years' => [2018, 2019, 2020, 2021]],
                ['name' => 'Superb', 'years' => [2017, 2018, 2019]],
                ['name' => 'Kodiaq', 'years' => [2019, 2020, 2021]],
            ],
            'SEAT' => [
                ['name' => 'Leon', 'years' => [2018, 2019, 2020]],
                ['name' => 'Ibiza', 'years' => [2018, 2019, 2020]],
                ['name' => 'Ateca', 'years' => [2019, 2020, 2021]],
            ],
            'Opel' => [
                ['name' => 'Astra', 'years' => [2018, 2019, 2020]],
                ['name' => 'Corsa', 'years' => [2018, 2019, 2020]],
                ['name' => 'Crossland', 'years' => [2019, 2020, 2021]],
            ],
            'Fiat' => [
                ['name' => '500', 'years' => [2018, 2019, 2020]],
                ['name' => 'Panda', 'years' => [2018, 2019, 2020]],
                ['name' => 'Tipo', 'years' => [2017, 2018, 2019]],
            ],
            'Porsche' => [
                ['name' => '911', 'years' => [2018, 2019, 2020, 2021]],
                ['name' => 'Cayenne', 'years' => [2019, 2020, 2021, 2022]],
                ['name' => 'Macan', 'years' => [2018, 2019, 2020]],
            ],
        ];

        // Get or create users
        $users = User::where('role', 'user')->get();
        if ($users->isEmpty()) {
            $users = User::factory(3)->create(['role' => 'user']);
        }

        $listingsCreated = 0;
        $targetListings = 35; // Aim for 35 listings

        // Create brands and car models, then listings
        foreach ($europeanCars as $brandName => $models) {
            // Get or create brand
            $brand = Brand::firstOrCreate(
                ['name' => $brandName],
                ['description' => "Popular European car brand: {$brandName}"]
            );

            foreach ($models as $modelData) {
                foreach ($modelData['years'] as $year) {
                    // Get or create car model
                    $carModel = CarModel::firstOrCreate(
                        [
                            'brand_id' => $brand->id,
                            'name' => $modelData['name'],
                            'year' => $year,
                        ],
                        [
                            'description' => "{$year} {$brandName} {$modelData['name']} - A popular European car model."
                        ]
                    );

                    // Create 1-2 listings per car model to reach ~35 total
                    $listingsPerModel = ($listingsCreated < $targetListings) ? rand(1, 2) : 0;
                    
                    for ($i = 0; $i < $listingsPerModel && $listingsCreated < $targetListings; $i++) {
                        $this->createListing($carModel, $users->random(), $brandName, $modelData['name'], $year);
                        $listingsCreated++;
                    }

                    if ($listingsCreated >= $targetListings) {
                        break 3; // Break out of all loops
                    }
                }
            }
        }

        echo "✅ Created {$listingsCreated} European car listings!\n";
    }

    private function createListing($carModel, $user, $brandName, $modelName, $year)
    {
        $colors = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown'];
        $statuses = ['approved', 'pending', 'approved', 'approved']; // More approved than pending
        
        // Price ranges based on brand prestige
        $priceRanges = [
            'Porsche' => [45000, 120000],
            'BMW' => [25000, 75000],
            'Mercedes-Benz' => [25000, 80000],
            'Audi' => [22000, 70000],
            'Volvo' => [20000, 60000],
            'Volkswagen' => [15000, 45000],
            'Peugeot' => [12000, 35000],
            'Renault' => [10000, 30000],
            'Skoda' => [12000, 35000],
            'SEAT' => [10000, 30000],
            'Opel' => [10000, 30000],
            'Fiat' => [8000, 25000],
        ];

        $priceRange = $priceRanges[$brandName] ?? [10000, 40000];
        $price = rand($priceRange[0], $priceRange[1]);
        
        // Mileage based on year (newer cars have less mileage)
        $currentYear = date('Y');
        $age = $currentYear - $year;
        $baseMileage = $age * 15000; // Average 15k km per year
        $mileage = rand(max(1000, $baseMileage - 20000), $baseMileage + 30000);

        $descriptions = [
            "Excellent condition {$year} {$brandName} {$modelName}. Well maintained, full service history available.",
            "Beautiful {$year} {$brandName} {$modelName} in great condition. One owner, garage kept.",
            "Stunning {$year} {$brandName} {$modelName}. Low mileage, excellent value for money.",
            "Immaculate {$year} {$brandName} {$modelName}. All original, no accidents, perfect condition.",
            "Well-cared-for {$year} {$brandName} {$modelName}. Regular servicing, ready to drive.",
            "Fantastic {$year} {$brandName} {$modelName}. Great fuel economy, reliable and comfortable.",
            "Premium {$year} {$brandName} {$modelName}. Loaded with features, excellent condition.",
        ];

        Listing::create([
            'user_id' => $user->id,
            'car_model_id' => $carModel->id,
            'title' => "{$year} {$brandName} {$modelName}",
            'description' => $descriptions[array_rand($descriptions)],
            'price' => $price,
            'mileage' => $mileage,
            'color' => $colors[array_rand($colors)],
            'status' => $statuses[array_rand($statuses)],
            'admin_comment' => null,
        ]);
    }
}


