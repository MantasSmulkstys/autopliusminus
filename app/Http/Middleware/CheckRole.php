<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = auth()->guard('api')->user();
        
        if (!$user || $user->role !== $role) {
            return response()->json(['error' => 'Unauthorized - Insufficient permissions'], 403);
        }
        
        return $next($request);
    }
}