<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\CarModel;
use Illuminate\Database\Seeder;

class CarModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $models = [
            'BMW' => [
                ['name' => '3 Series', 'year' => 2020, 'description' => 'Compact executive sedan with sporty handling and premium features.'],
                ['name' => '5 Series', 'year' => 2021, 'description' => 'Midsize luxury sedan offering comfort and performance.'],
                ['name' => 'X5', 'year' => 2019, 'description' => 'Luxury midsize SUV with powerful engines and spacious interior.'],
                ['name' => 'X3', 'year' => 2022, 'description' => 'Compact luxury SUV perfect for urban driving and adventures.'],
            ],
            'Audi' => [
                ['name' => 'A4', 'year' => 2020, 'description' => 'Premium compact sedan with advanced technology and refined design.'],
                ['name' => 'A6', 'year' => 2021, 'description' => 'Executive sedan combining luxury and performance seamlessly.'],
                ['name' => 'Q5', 'year' => 2019, 'description' => 'Versatile compact SUV with quattro all-wheel drive system.'],
                ['name' => 'Q7', 'year' => 2022, 'description' => 'Full-size luxury SUV with three rows and premium amenities.'],
            ],
            'Mercedes-Benz' => [
                ['name' => 'C-Class', 'year' => 2020, 'description' => 'Compact luxury sedan with elegant styling and advanced features.'],
                ['name' => 'E-Class', 'year' => 2021, 'description' => 'Midsize luxury sedan known for comfort and sophisticated technology.'],
                ['name' => 'GLE', 'year' => 2019, 'description' => 'Midsize luxury SUV offering space, comfort, and capability.'],
                ['name' => 'GLC', 'year' => 2022, 'description' => 'Compact luxury SUV with sporty character and premium interior.'],
            ],
            'Toyota' => [
                ['name' => 'Camry', 'year' => 2020, 'description' => 'Reliable midsize sedan with excellent fuel economy and comfort.'],
                ['name' => 'Corolla', 'year' => 2021, 'description' => 'Compact sedan known for reliability and low maintenance costs.'],
                ['name' => 'RAV4', 'year' => 2019, 'description' => 'Popular compact SUV with great fuel efficiency and practicality.'],
                ['name' => 'Highlander', 'year' => 2022, 'description' => 'Midsize SUV with three rows, perfect for families.'],
            ],
            'Honda' => [
                ['name' => 'Accord', 'year' => 2020, 'description' => 'Midsize sedan with excellent reliability and fuel efficiency.'],
                ['name' => 'Civic', 'year' => 2021, 'description' => 'Compact sedan offering great value and fun-to-drive character.'],
                ['name' => 'CR-V', 'year' => 2019, 'description' => 'Compact SUV with spacious interior and excellent resale value.'],
                ['name' => 'Pilot', 'year' => 2022, 'description' => 'Midsize SUV with three rows and Honda reliability.'],
            ],
            'Volkswagen' => [
                ['name' => 'Golf', 'year' => 2020, 'description' => 'Compact hatchback with European styling and practicality.'],
                ['name' => 'Passat', 'year' => 2021, 'description' => 'Midsize sedan with comfortable ride and spacious cabin.'],
                ['name' => 'Tiguan', 'year' => 2019, 'description' => 'Compact SUV with German engineering and modern features.'],
                ['name' => 'Atlas', 'year' => 2022, 'description' => 'Full-size SUV with three rows and impressive cargo space.'],
            ],
            'Ford' => [
                ['name' => 'Mustang', 'year' => 2020, 'description' => 'Iconic sports car with powerful engines and classic styling.'],
                ['name' => 'F-150', 'year' => 2021, 'description' => 'Full-size pickup truck known for towing and payload capacity.'],
                ['name' => 'Escape', 'year' => 2019, 'description' => 'Compact SUV with good fuel economy and modern technology.'],
                ['name' => 'Explorer', 'year' => 2022, 'description' => 'Midsize SUV with three rows and powerful engine options.'],
            ],
            'Nissan' => [
                ['name' => 'Altima', 'year' => 2020, 'description' => 'Midsize sedan with comfortable ride and good fuel economy.'],
                ['name' => 'Sentra', 'year' => 2021, 'description' => 'Compact sedan offering value and modern features.'],
                ['name' => 'Rogue', 'year' => 2019, 'description' => 'Compact SUV with comfortable interior and good safety ratings.'],
                ['name' => 'Pathfinder', 'year' => 2022, 'description' => 'Midsize SUV with three rows and strong V6 engine.'],
            ],
        ];

        foreach ($models as $brandName => $modelList) {
            $brand = Brand::where('name', $brandName)->first();
            
            if ($brand) {
                foreach ($modelList as $model) {
                    CarModel::create([
                        'brand_id' => $brand->id,
                        'name' => $model['name'],
                        'year' => $model['year'],
                        'description' => $model['description'],
                    ]);
                }
            }
        }
    }
}

