<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Comment",
 *     title="Comment",
 *     description="User comment on a listing",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="listing_id", type="integer", example=12),
 *     @OA\Property(property="user_id", type="integer", example=3),
 *     @OA\Property(property="content", type="string", example="This is a great listing!"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-10-14T12:30:00Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-10-14T12:45:00Z"),
 * )
 */
class Comment extends Model
{
    use HasFactory;

    protected $fillable = ['listing_id', 'user_id', 'content'];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
