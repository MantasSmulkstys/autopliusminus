<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\CarModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class ListingFactory extends Factory
{
    public function definition(): array
    {
        $statuses = ['pending', 'approved', 'rejected', 'sold'];

        return [
            'user_id' => User::inRandomOrder()->first()->id ?? 1,
            'car_model_id' => CarModel::inRandomOrder()->first()->id ?? 1,
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->numberBetween(5000, 50000),
            'mileage' => $this->faker->numberBetween(1000, 200000),
            'color' => $this->faker->colorName(),
            'status' => $this->faker->randomElement($statuses),
            'admin_comment' => $this->faker->optional()->sentence(),
        ];
    }
}
