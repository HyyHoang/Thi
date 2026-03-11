<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    private const ROLE_ADMIN = 0;
    private const ROLE_TEACHER = 1;
    private const ROLE_STUDENT = 2;

    public function index(): JsonResponse
    {
        $users = User::orderByDesc('UserID')->get();

        return response()->json([
            'success' => true,
            'data' => $users->map(fn (User $user) => $this->mapUser($user)),
        ]);
    }

    public function store(UserStoreRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = new User();
        $user->Username = $data['username'];
        $user->Password = $data['password'];
        $user->Email = $data['email'];
        $user->AVT = $data['avt'] ?? null;
        $user->Role = (int) $data['role'];
        $user->CreatedDate = $data['created_date'] ?? now();
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Tạo tài khoản thành công',
            'data' => $this->mapUser($user),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::where('UserID', $id)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $this->mapUser($user, true),
        ]);
    }

    public function update(UserUpdateRequest $request, int $id): JsonResponse
    {
        $user = User::where('UserID', $id)->firstOrFail();
        $data = $request->validated();

        $user->Username = $data['username'];
        $user->Email = $data['email'];
        $user->AVT = $data['avt'] ?? null;
        $user->Role = (int) $data['role'];

        if (!empty($data['password'])) {
            $user->Password = $data['password'];
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật tài khoản thành công',
            'data' => $this->mapUser($user),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::where('UserID', $id)->firstOrFail();
        if ((int) $user->Role === self::ROLE_ADMIN) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa tài khoản có quyền quản trị',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa tài khoản thành công',
        ]);
    }

    private function mapUser(User $user, bool $includePassword = false): array
    {
        $payload = [
            'user_id' => $user->UserID,
            'username' => $user->Username,
            'email' => $user->Email,
            'avt' => $user->AVT,
            'role' => (int) $user->Role,
            'created_date' => $user->CreatedDate,
        ];

        if ($includePassword) {
            $payload['password'] = $user->Password;
        }

        return $payload;
    }
}
