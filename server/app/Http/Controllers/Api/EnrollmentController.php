<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnrollmentStoreRequest;
use App\Http\Requests\EnrollmentUpdateRequest;
use App\Services\Contracts\EnrollmentServiceInterface;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnrollmentController extends Controller
{
    private const ROLE_ADMIN = 0;
    private const ROLE_TEACHER = 1;

    public function __construct(
        private readonly EnrollmentServiceInterface $enrollmentService
    ) {}

    /**
     * GET /api/enrollments
     * Lấy danh sách đăng ký dựa trên quyền truy cập.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $role = (int) $user->Role;

        if ($role === self::ROLE_ADMIN) {
            $data = $this->enrollmentService->getAllWithRelations();
        } elseif ($role === self::ROLE_TEACHER) {
            $teacher = TeacherProfile::where('UserID', $user->UserID)->first();
            if (!$teacher) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin giảng viên.'], 404);
            }
            $data = $this->enrollmentService->getByTeacherId($teacher->TeacherID);
        } else {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền truy cập.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * GET /api/enrollments/{id}
     */
    public function show(string $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->enrollmentService->getByIdWithRelations($id),
        ]);
    }

    /**
     * POST /api/enrollments
     */
    public function store(EnrollmentStoreRequest $request): JsonResponse
    {
        try {
            $data = $this->enrollmentService->create($request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Đăng ký học phần thành công.',
                'data' => $data,
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * PUT /api/enrollments/{id}
     */
    public function update(EnrollmentUpdateRequest $request, string $id): JsonResponse
    {
        $data = $this->enrollmentService->update($id, $request->validated());
        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đăng ký thành công.',
            'data' => $data,
        ]);
    }

    /**
     * DELETE /api/enrollments/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $this->enrollmentService->delete($id);
        return response()->json([
            'success' => true,
            'message' => 'Xóa đăng ký học phần thành công.',
        ]);
    }
}
