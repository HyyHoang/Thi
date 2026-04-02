<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExamAttemptStoreRequest;
use App\Http\Requests\ExamAttemptUpdateRequest;
use App\Services\Contracts\ExamAttemptServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamAttemptController extends Controller
{
    public function __construct(
        private readonly ExamAttemptServiceInterface $attemptService
    ) {}

    /**
     * GET /api/exam-attempts
     * Toàn bộ lượt làm (Admin xem tất cả).
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->attemptService->getAll(),
        ]);
    }

    /**
     * GET /api/exam-attempts/by-exam/{examId}
     * Lượt làm theo đề thi cụ thể.
     */
    public function byExam(string $examId): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->attemptService->getAllByExam($examId),
        ]);
    }

    /**
     * GET /api/exam-attempts/by-student/{studentId}
     * Lượt làm theo sinh viên cụ thể.
     */
    public function byStudent(string $studentId): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->attemptService->getAllByStudent($studentId),
        ]);
    }

    /**
     * GET /api/exam-attempts/{id}
     * Chi tiết một lượt làm.
     */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->attemptService->getDetail($id),
        ]);
    }

    /**
     * POST /api/exam-attempts
     * Tạo lượt làm mới (Admin/Teacher ghi nhận).
     */
    public function store(ExamAttemptStoreRequest $request): JsonResponse
    {
        $data = $this->attemptService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Tạo lượt làm bài thành công.',
            'data'    => $data,
        ], 201);
    }

    /**
     * PUT /api/exam-attempts/{id}
     * Cập nhật trạng thái lượt làm (Admin only).
     */
    public function update(ExamAttemptUpdateRequest $request, int $id): JsonResponse
    {
        try {
            $data = $this->attemptService->updateAttempt($id, $request->validated(), $request->user());
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật lượt làm bài thành công.',
            'data'    => $data,
        ]);
    }

    /**
     * DELETE /api/exam-attempts/{id}
     * Xóa lượt làm bài (Admin only).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->attemptService->deleteAttempt($id, $request->user());
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa lượt làm bài thành công.',
        ]);
    }
}
