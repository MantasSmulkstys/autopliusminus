<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarModelFactory extends Factory
{
    public function definition(): array
    {
        $models = [
            'BMW' => ['X5', '3 Series', 'M440', 'i8'],
            'Audi' => ['A4', 'A6', 'Q5', 'RS6'],
            'Volkswagen' => ['Golf', 'Passat', 'Tiguan', 'Beetle'],
            'Mercedes' => ['C-Class', 'E-Class', 'GLE', 'AMG'],
            'Toyota' => ['Camry', 'Corolla', 'RAV4', 'Highlander'],
            'Honda' => ['Accord', 'Civic', 'CR-V', 'Odyssey'],
            'Nissan' => ['Altima', 'Sentra', 'Rogue', 'Pathfinder'],
            'Ford' => ['Mustang', 'F-150', 'Escape', 'Explorer'],
        ];

        $brand = Brand::inRandomOrder()->first();
        $brandName = $brand->name;
        $modelList = $models[$brandName] ?? ['Model A', 'Model B'];

        return [
            'brand_id' => $brand->id,
            'name' => $this->faker->randomElement($modelList),
            'year' => $this->faker->numberBetween(2010, 2024),
            'description' => $this->faker->sentence(),
        ];
    }
}
