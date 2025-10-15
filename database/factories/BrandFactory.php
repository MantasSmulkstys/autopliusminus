<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BrandFactory extends Factory
{
    public function definition(): array
    {
        $brands = ['BMW', 'Audi', 'Volkswagen', 'Mercedes', 'Toyota', 'Honda', 'Nissan', 'Ford'];

        return [
            'name' => $this->faker->unique()->randomElement($brands),
            'description' => $this->faker->sentence(),
        ];
    }
}
