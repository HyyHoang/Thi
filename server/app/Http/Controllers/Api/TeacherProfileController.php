<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeacherProfileStoreRequest;
use App\Http\Requests\TeacherProfileUpdateRequest;
use App\Services\Contracts\TeacherProfileServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherProfileController extends Controller
{
    public function __construct(
        private readonly TeacherProfileServiceInterface $teacherProfileService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->teacherProfileService->getAllFormatted(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data'    => $this->teacherProfileService->getByIdFormatted($id),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }
    }

    public function store(TeacherProfileStoreRequest $request): JsonResponse
    {
        try {
            $data = $this->teacherProfileService->create($request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Tạo hồ sơ giảng viên thành công',
                'data'    => $data,
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function update(TeacherProfileUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $this->teacherProfileService->update($id, $request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật hồ sơ thành công',
                'data'    => $data,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->teacherProfileService->delete($id);
            return response()->json([
                'success' => true,
                'message' => 'Xóa hồ sơ thành công',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function myProfile(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->UserID;
            return response()->json([
                'success' => true,
                'data'    => $this->teacherProfileService->getByUserIdFormatted($userId),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }
    }

    public function updateMyProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'gender' => 'nullable|string|max:10',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:15',
            'avt' => 'nullable|string|max:255',
        ]);

        try {
            $userId = $request->user()->UserID;
            $data = $this->teacherProfileService->updateMyProfile($userId, $validated);
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thông tin thành công',
                'data'    => $data,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }
    }
}
