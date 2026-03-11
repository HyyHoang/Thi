<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const ROLE_ADMIN = 0;
    private const ROLE_TEACHER = 1;
    private const ROLE_STUDENT = 2;

    /**
     * Đăng nhập trang quản trị (admin hoặc teacher).
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string|max:50',
            'password' => 'required|string',
        ]);

        // Bảng thật trong MySQL là `User` với cột `Username`, `Password`, `Role`, ...
        $user = User::where('Username', $request->username)->first();

        // Mật khẩu dạng thuần (không hash) theo yêu cầu hiện tại của hệ thống.
        if (!$user || $request->password !== $user->Password) {
            throw ValidationException::withMessages([
                'username' => ['Tên đăng nhập hoặc mật khẩu không đúng.'],
            ]);
        }

        $role = (int) $user->Role;
        if ($role !== self::ROLE_ADMIN && $role !== self::ROLE_TEACHER) {
            throw ValidationException::withMessages([
                'username' => ['Bạn không có quyền truy cập trang quản trị.'],
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công.',
            'data' => [
                'token' => $token,
                // Map field trả về theo dạng lowercase cho FE,
                // dù trong DB đang là các cột viết hoa.
                'user' => [
                    'user_id' => $user->UserID,
                    'username' => $user->Username,
                    'email' => $user->Email,
                    'role' => $user->Role,
                ],
            ],
        ]);
    }

    /**
     * Lấy thông tin user đang đăng nhập.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $user->UserID,
                'username' => $user->Username,
                'email' => $user->Email,
                'role' => $user->Role,
            ],
        ]);
    }

    /**
     * Đăng xuất (revoke token hiện tại).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'success' => true,
            'message' => 'Đã đăng xuất.',
        ]);
    }
}
