<?php

namespace App\Http\Controllers\Api;

use App\Models\Listing;
use App\Models\CarModel;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/listings",
     *     summary="Get all approved listings",
     *     tags={"Listings"},
     *     @OA\Response(
     *         response=200,
     *         description="List of approved listings"
     *     )
     * )
     */
    public function index()
    {
        $listings = Listing::where('status', 'approved')->with('carModel', 'user')->get();
        return response()->json($listings, 200);
    }

    /**
     * @OA\Get(
     *     path="/api/car-models/{modelId}/listings",
     *     summary="Get listings by car model",
     *     tags={"Listings"},
     *     @OA\Parameter(
     *         name="modelId",
     *         in="path",
     *         required=true,
     *         description="Car model ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="List of listings for the given model"),
     *     @OA\Response(response=404, description="Car model not found")
     * )
     */
    public function byModel($modelId)
    {
        $carModel = CarModel::find($modelId);

        if (!$carModel) {
            return response()->json(['message' => 'Car model not found'], 404);
        }

        $listings = $carModel->listings()->where('status', 'approved')->with('user')->get();
        return response()->json($listings, 200);
    }

    /**
     * @OA\Post(
     *     path="/api/listings",
     *     summary="Create a new listing",
     *     tags={"Listings"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"car_model_id","title","description","price","mileage","color"},
     *             @OA\Property(property="car_model_id", type="integer", example=2),
     *             @OA\Property(property="title", type="string", example="2016 Toyota Corolla"),
     *             @OA\Property(property="description", type="string", example="Well-maintained, low mileage car."),
     *             @OA\Property(property="price", type="number", format="float", example=8500),
     *             @OA\Property(property="mileage", type="integer", example=120000),
     *             @OA\Property(property="color", type="string", example="Red")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Listing created successfully"),
     *     @OA\Response(response=422, description="Validation failed")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'car_model_id' => 'required|exists:car_models,id',
            'title' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'mileage' => 'required|integer',
            'color' => 'required|string'
        ]);

        $validated['user_id'] = auth()->id() ?? 1; // Placeholder, jei nėra auth
        $validated['status'] = 'pending'; // Numatyta - pending

        $listing = Listing::create($validated);
        return response()->json($listing, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/listings/{id}",
     *     summary="Get listing details (with comments)",
     *     tags={"Listings"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Listing ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Listing details with related data"),
     *     @OA\Response(response=404, description="Listing not found")
     * )
     */
    public function show($id)
    {
        $listing = Listing::with('carModel', 'user', 'comments.user')->find($id);

        if (!$listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        return response()->json($listing, 200);
    }

    /**
     * @OA\Put(
     *     path="/api/listings/{id}",
     *     summary="Update listing (owner only)",
     *     tags={"Listings"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Listing ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Updated car title"),
     *             @OA\Property(property="description", type="string", example="Updated description"),
     *             @OA\Property(property="price", type="number", example=9500),
     *             @OA\Property(property="mileage", type="integer", example=130000),
     *             @OA\Property(property="color", type="string", example="Blue")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Listing updated successfully"),
     *     @OA\Response(response=403, description="Unauthorized"),
     *     @OA\Response(response=404, description="Listing not found"),
     *     @OA\Response(response=422, description="Validation failed")
     * )
     */
    public function update(Request $request, $id)
    {
        $listing = Listing::find($id);

        if (!$listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        // Paprastas check - turėtum naudoti Policy
        if ($listing->user_id != auth()->id() && auth()->id() != 1) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'mileage' => 'sometimes|integer',
            'color' => 'sometimes|string'
        ]);

        $listing->update($validated);
        return response()->json($listing, 200);
    }


    /**
     * @OA\Delete(
     *     path="/api/listings/{id}",
     *     summary="Delete listing",
     *     tags={"Listings"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Listing ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=204, description="Listing deleted successfully"),
     *     @OA\Response(response=404, description="Listing not found")
     * )
     */
    public function destroy($id)
    {
        $listing = Listing::find($id);

        if (!$listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        $listing->delete();
        return response()->json(null, 204);
    }


    /**
     * @OA\Patch(
     *     path="/api/listings/{id}/approve",
     *     summary="Approve listing (admin only)",
     *     tags={"Listings"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Listing ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Listing approved successfully"),
     *     @OA\Response(response=404, description="Listing not found")
     * )
     */
    public function approve($id)
    {
        $listing = Listing::find($id);

        if (!$listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        $listing->update(['status' => 'approved']);
        return response()->json($listing, 200);
    }

    /**
     * @OA\Patch(
     *     path="/api/listings/{id}/reject",
     *     summary="Reject listing (admin only)",
     *     tags={"Listings"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Listing ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="admin_comment", type="string", example="Listing rejected due to incomplete info")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Listing rejected successfully"),
     *     @OA\Response(response=404, description="Listing not found")
     * )
     */
    public function reject(Request $request, $id)
    {
        $listing = Listing::find($id);

        if (!$listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        $validated = $request->validate([
            'admin_comment' => 'nullable|string'
        ]);

        $listing->update(['status' => 'rejected', 'admin_comment' => $validated['admin_comment'] ?? null]);
        return response()->json($listing, 200);
    }
}
