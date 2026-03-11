<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    private const ROLE_ADMIN = 0;

    /**
     * Ensure the authenticated user is an admin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || (int) $user->Role !== self::ROLE_ADMIN) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập trang quản trị',
            ], 403);
        }

        return $next($request);
    }
}
