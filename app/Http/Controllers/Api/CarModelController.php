<?php

namespace App\Http\Controllers\Api;

use App\Models\CarModel;
use App\Models\Brand;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Car Models",
 *     description="API endpoints for managing car models"
 * )
 */
class CarModelController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/car-models",
     *     tags={"Car Models"},
     *     summary="Get list of all car models",
     *     @OA\Response(
     *         response=200,
     *         description="List of car models",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/CarModel"))
     *     )
     * )
     */
    public function index()
    {
        return response()->json(CarModel::all(), 200);
    }


    /**
     * @OA\Get(
     *     path="/api/brands/{brandId}/car-models",
     *     tags={"Car Models"},
     *     summary="Get car models for a specific brand",
     *     @OA\Parameter(
     *         name="brandId",
     *         in="path",
     *         required=true,
     *         description="ID of the brand",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of car models belonging to the brand",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/CarModel"))
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Brand not found"
     *     )
     * )
     */
    public function byBrand($brandId)
    {
        $brand = Brand::find($brandId);

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        return response()->json($brand->carModels, 200);
    }

    /**
     * @OA\Post(
     *     path="/api/car-models",
     *     tags={"Car Models"},
     *     summary="Create a new car model",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CarModelCreateRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Car model created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/CarModel")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand_id' => 'required|exists:brands,id',
            'name' => 'required|string',
            'year' => 'required|integer',
            'description' => 'nullable|string'
        ]);

        $carModel = CarModel::create($validated);
        return response()->json($carModel, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/car-models/{id}",
     *     tags={"Car Models"},
     *     summary="Get details of a specific car model",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Car model ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Car model details",
     *         @OA\JsonContent(ref="#/components/schemas/CarModel")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car model not found"
     *     )
     * )
     */
    public function show($id)
    {
        $carModel = CarModel::find($id);

        if (!$carModel) {
            return response()->json(['message' => 'Car model not found'], 404);
        }

        return response()->json($carModel, 200);
    }

    /**
     * @OA\Put(
     *     path="/api/car-models/{id}",
     *     tags={"Car Models"},
     *     summary="Update an existing car model",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Car model ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CarModelUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Car model updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/CarModel")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car model not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $carModel = CarModel::find($id);

        if (!$carModel) {
            return response()->json(['message' => 'Car model not found'], 404);
        }

        $validated = $request->validate([
            'brand_id' => 'required|exists:brands,id',
            'name' => 'required|string',
            'year' => 'required|integer',
            'description' => 'nullable|string'
        ]);

        $carModel->update($validated);
        return response()->json($carModel, 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/car-models/{id}",
     *     tags={"Car Models"},
     *     summary="Delete a car model by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Car model ID",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Car model deleted successfully"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Car model not found"
     *     )
     * )
     */
    public function destroy($id)
    {
        $carModel = CarModel::find($id);

        if (!$carModel) {
            return response()->json(['message' => 'Car model not found'], 404);
        }

        $carModel->delete();
        return response()->json(null, 204);
    }
}
