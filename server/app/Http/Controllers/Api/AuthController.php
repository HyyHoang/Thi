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
    private const STATUS_ACTIVE = 1;

    /**
     * Đăng nhập trang quản trị (chỉ admin, status active).
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string|max:50',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        // Mật khẩu dạng thuần (không hash) theo yêu cầu hiện tại của hệ thống.
        if (!$user || $request->password !== $user->password) {
            throw ValidationException::withMessages([
                'username' => ['Tên đăng nhập hoặc mật khẩu không đúng.'],
            ]);
        }

        if ((int) $user->status !== self::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'username' => ['Tài khoản đã bị vô hiệu hóa.'],
            ]);
        }

        if ((int) $user->role !== self::ROLE_ADMIN) {
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
                'user' => [
                    'user_id' => $user->user_id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role,
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
                'user_id' => $user->user_id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
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
