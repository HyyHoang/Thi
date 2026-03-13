<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminOrTeacher
{
    private const ROLE_ADMIN = 0;
    private const ROLE_TEACHER = 1;

    /**
     * Ensure the authenticated user is admin or teacher.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $role = $user ? (int) $user->Role : null;

        if ($role !== self::ROLE_ADMIN && $role !== self::ROLE_TEACHER) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập hệ thống',
            ], 403);
        }

        return $next($request);
    }
}
