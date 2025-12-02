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
     *     summary="Get all approved listings with optional filtering",
     *     tags={"Listings"},
     *     @OA\Parameter(
     *         name="brand_id",
     *         in="query",
     *         required=false,
     *         description="Filter by brand ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="car_model_id",
     *         in="query",
     *         required=false,
     *         description="Filter by car model ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="min_price",
     *         in="query",
     *         required=false,
     *         description="Minimum price filter",
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="max_price",
     *         in="query",
     *         required=false,
     *         description="Maximum price filter",
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         required=false,
     *         description="Search in title and description",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of approved listings"
     *     )
     * )
     */
    public function index(Request $request)
    {
        // Check if user is authenticated and is admin
        $user = auth('api')->user();
        $isAdmin = $user && $user->role === 'admin';

        // Admins see all listings, guests/users see only approved
        $query = Listing::with(['carModel.brand', 'user']);
        
        if (!$isAdmin) {
            $query->where('status', 'approved');
        }

        // Filter by brand
        if ($request->has('brand_id')) {
            $query->whereHas('carModel', function ($q) use ($request) {
                $q->where('brand_id', $request->brand_id);
            });
        }

        // Filter by car model
        if ($request->has('car_model_id')) {
            $query->where('car_model_id', $request->car_model_id);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Search in title and description
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        $listings = $query->orderBy('created_at', 'desc')->get();
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
        if (! auth('api')->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (auth('api')->user()->is_blocked ?? false) {
            return response()->json(['message' => 'User is blocked'], 403);
        }

        $validated = $request->validate([
            'car_model_id' => 'required|exists:car_models,id',
            'title' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'mileage' => 'required|integer',
            'color' => 'required|string'
        ]);

        $validated['user_id'] = auth('api')->id();
        $validated['status'] = 'pending'; // default: waiting for admin approval

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
        $listing = Listing::with(['carModel.brand', 'user', 'comments.user'])->find($id);

        if (!$listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        // Guests can only see approved listings
        // Authenticated users can see their own listings or approved ones
        $user = auth('api')->user();
        if (!$user || $user->role !== 'admin') {
            if ($listing->status !== 'approved' && (!$user || $listing->user_id !== $user->id)) {
                return response()->json(['message' => 'Listing not found'], 404);
            }
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

        $user = auth('api')->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->is_blocked ?? false) {
            return response()->json(['message' => 'User is blocked'], 403);
        }

        // Owner or admin can update a listing
        if ($listing->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'mileage' => 'sometimes|integer',
            'color' => 'sometimes|string',
            'status' => 'sometimes|in:pending,sold,reserved' // Users can mark as sold or reserved
        ]);

        // Only owners can change status, admins use separate approve/reject endpoints
        if (isset($validated['status']) && $listing->user_id !== $user->id) {
            return response()->json(['message' => 'Only the owner can change listing status'], 403);
        }

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

        $user = auth('api')->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->is_blocked ?? false) {
            return response()->json(['message' => 'User is blocked'], 403);
        }

        // Owner or admin can delete a listing
        if ($listing->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
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
        $user = auth('api')->user();

        if (! $user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

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
        $user = auth('api')->user();

        if (! $user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

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

    /**
     * Hard delete listing as admin (regardless of owner).
     */
    public function adminDestroy($id)
    {
        $listing = Listing::find($id);

        if (! $listing) {
            return response()->json(['message' => 'Listing not found'], 404);
        }

        $listing->delete();

        return response()->json(null, 204);
    }
}
