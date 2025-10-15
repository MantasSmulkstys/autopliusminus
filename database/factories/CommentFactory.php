<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Listing;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'listing_id' => Listing::inRandomOrder()->first()->id ?? 1,
            'user_id' => User::inRandomOrder()->first()->id ?? 1,
            'content' => $this->faker->paragraph(),
        ];
    }
}
