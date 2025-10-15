<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @OA\Schema(
 *     schema="Brand",
 *     type="object",
 *     title="Brand",
 *     required={"id", "name"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Nike"),
 *     @OA\Property(property="description", type="string", example="Sportswear brand")
 * )
 *
 * @OA\Schema(
 *     schema="BrandCreateRequest",
 *     type="object",
 *     required={"name"},
 *     @OA\Property(property="name", type="string", example="Adidas"),
 *     @OA\Property(property="description", type="string", example="German sports company")
 * )
 *
 * @OA\Schema(
 *     schema="BrandUpdateRequest",
 *     type="object",
 *     required={"name"},
 *     @OA\Property(property="name", type="string", example="Adidas Updated"),
 *     @OA\Property(property="description", type="string", example="Updated brand description")
 * )
 */
class Brand extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
    ];

    public function carModels()
    {
        return $this->hasMany(CarModel::class);
    }
}
