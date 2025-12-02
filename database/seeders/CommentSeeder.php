<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $listings = Listing::all();
        $users = User::all();
        
        if ($listings->isEmpty()) {
            $this->command->warn('No listings found. Please run ListingSeeder first.');
            return;
        }
        
        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        $listingIds = $listings->pluck('id')->toArray();
        $userUser = $users->where('role', 'user')->first() ?? $users->first();
        $guestUser = $users->where('role', 'guest')->first() ?? $users->first();

        $comments = [
            [
                'listing_id' => $listingIds[0] ?? $listings->first()->id,
                'user_id' => $userUser->id,
                'content' => 'Great car! Is it still available? I\'m very interested.',
            ],
            [
                'listing_id' => $listingIds[0] ?? $listings->first()->id,
                'user_id' => $guestUser->id,
                'content' => 'Could you provide more details about the service history?',
            ],
            [
                'listing_id' => $listingIds[1] ?? $listings->first()->id,
                'user_id' => $userUser->id,
                'content' => 'Beautiful vehicle! What\'s the best price you can offer?',
            ],
            [
                'listing_id' => $listingIds[2] ?? $listings->first()->id,
                'user_id' => $guestUser->id,
                'content' => 'Is financing available for this car?',
            ],
            [
                'listing_id' => $listingIds[3] ?? $listings->first()->id,
                'user_id' => $userUser->id,
                'content' => 'Excellent condition! When can I come for a test drive?',
            ],
            [
                'listing_id' => $listingIds[4] ?? $listings->first()->id,
                'user_id' => $guestUser->id,
                'content' => 'Does this vehicle have any accidents on record?',
            ],
            [
                'listing_id' => $listingIds[5] ?? $listings->first()->id,
                'user_id' => $userUser->id,
                'content' => 'Very nice car! What\'s the fuel economy like?',
            ],
            [
                'listing_id' => $listingIds[6] ?? $listings->first()->id,
                'user_id' => $guestUser->id,
                'content' => 'Interested in purchasing. Can you send more photos?',
            ],
            [
                'listing_id' => $listingIds[7] ?? $listings->first()->id,
                'user_id' => $userUser->id,
                'content' => 'Perfect for my needs! Is the price negotiable?',
            ],
            [
                'listing_id' => $listingIds[8] ?? $listings->first()->id,
                'user_id' => $guestUser->id,
                'content' => 'Great listing! What warranty comes with this vehicle?',
            ],
            [
                'listing_id' => $listingIds[9] ?? $listings->first()->id,
                'user_id' => $userUser->id,
                'content' => 'Looks amazing! Are there any known issues I should be aware of?',
            ],
            [
                'listing_id' => $listingIds[0] ?? $listings->first()->id,
                'user_id' => $userUser->id,
                'content' => 'I\'ve been looking for exactly this model. Very interested!',
            ],
        ];

        foreach ($comments as $comment) {
            Comment::create($comment);
        }
    }
}

