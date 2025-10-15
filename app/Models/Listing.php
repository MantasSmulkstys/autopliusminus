<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Listing",
 *     title="Listing",
 *     description="A listing containing products or services",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="title", type="string", example="Used Toyota Corolla 2018"),
 *     @OA\Property(property="description", type="string", example="A reliable car in great condition."),
 *     @OA\Property(property="price", type="number", format="float", example=8500.00),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-10-14T12:30:00Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-10-14T12:45:00Z"),
 * )
 */
class Listing extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'car_model_id', 'title', 'description', 'price', 'mileage', 'color', 'status', 'admin_comment'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function carModel()
    {
        return $this->belongsTo(CarModel::class, 'car_model_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
