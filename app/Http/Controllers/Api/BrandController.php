<?php

namespace App\Http\Controllers\Api;

use App\Models\Brand;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Brands",
 *     description="API endpoints for managing brands"
 * )
 */
class BrandController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/brands",
     *     tags={"Brands"},
     *     summary="Get list of all brands",
     *     @OA\Response(
     *         response=200,
     *         description="List of brands",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Brand"))
     *     )
     * )
     */
    public function index()
    {
        return response()->json(Brand::all(), 200);
    }

    /**
     * @OA\Post(
     *     path="/api/brands",
     *     tags={"Brands"},
     *     summary="Create a new brand",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/BrandCreateRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Brand created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Brand")
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
            'name' => 'required|string|unique:brands',
            'description' => 'nullable|string'
        ]);

        $brand = Brand::create($validated);
        return response()->json($brand, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/brands/{id}",
     *     tags={"Brands"},
     *     summary="Get a specific brand by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Brand ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Brand details",
     *         @OA\JsonContent(ref="#/components/schemas/Brand")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Brand not found"
     *     )
     * )
     */
    public function show($id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        return response()->json($brand, 200);
    }

    /**
     * @OA\Put(
     *     path="/api/brands/{id}",
     *     tags={"Brands"},
     *     summary="Update an existing brand",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Brand ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/BrandUpdateRequest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Brand updated successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Brand")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Brand not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:brands,name,' . $id,
            'description' => 'nullable|string'
        ]);

        $brand->update($validated);
        return response()->json($brand, 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/brands/{id}",
     *     tags={"Brands"},
     *     summary="Delete a brand by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Brand ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Brand deleted successfully (no content)"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Brand not found"
     *     )
     * )
     */
    public function destroy($id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        $brand->delete();
        return response()->json(null, 204);
    }
}
