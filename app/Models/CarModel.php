<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="CarModel",
 *     title="CarModel",
 *     description="Represents a car model",
 *     required={"id", "brand_id", "name", "year"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="brand_id", type="integer", example=2),
 *     @OA\Property(property="name", type="string", example="Corolla"),
 *     @OA\Property(property="year", type="integer", example=2018),
 *     @OA\Property(property="description", type="string", example="Reliable and fuel-efficient sedan"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-10-14T12:30:00Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-10-14T12:45:00Z")
 * )
 *
 * @OA\Schema(
 *     schema="CarModelCreateRequest",
 *     title="CarModelCreateRequest",
 *     description="Request body for creating a CarModel",
 *     required={"brand_id", "name", "year"},
 *     @OA\Property(property="brand_id", type="integer", example=2),
 *     @OA\Property(property="name", type="string", example="Corolla"),
 *     @OA\Property(property="year", type="integer", example=2018),
 *     @OA\Property(property="description", type="string", example="Reliable and fuel-efficient sedan")
 * )
 *
 * @OA\Schema(
 *     schema="CarModelUpdateRequest",
 *     title="CarModelUpdateRequest",
 *     description="Request body for updating a CarModel",
 *     required={"brand_id", "name", "year"},
 *     @OA\Property(property="brand_id", type="integer", example=2),
 *     @OA\Property(property="name", type="string", example="Corolla"),
 *     @OA\Property(property="year", type="integer", example=2018),
 *     @OA\Property(property="description", type="string", example="Reliable and fuel-efficient sedan")
 * )
 */
class CarModel extends Model
{
    use HasFactory;

    protected $table = 'car_models';
    protected $fillable = ['brand_id', 'name', 'year', 'description'];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function listings()
    {
        return $this->hasMany(Listing::class, 'car_model_id');
    }
}
