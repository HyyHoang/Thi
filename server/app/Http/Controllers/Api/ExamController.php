<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExamStoreRequest;
use App\Http\Requests\ExamUpdateRequest;
use App\Services\Contracts\ExamServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function __construct(
        private readonly ExamServiceInterface $examService
    ) {}

    /**
     * GET /api/exams/current-semester
     * Lấy học kỳ đang diễn ra hiện tại.
     */
    public function currentSemester(): JsonResponse
    {
        $semester = $this->examService->getCurrentSemester();

        return response()->json([
            'success' => true,
            'data'    => $semester,
        ]);
    }

    /**
     * GET /api/exams/subjects-for-semester?semester_id=xxx
     * Lấy danh sách môn học có lớp học phần trong học kỳ.
     */
    public function subjectsForSemester(Request $request): JsonResponse
    {
        $request->validate(['semester_id' => 'required|string']);

        $subjects = $this->examService->getSubjectsForSemester($request->semester_id);

        return response()->json([
            'success' => true,
            'data'    => $subjects,
        ]);
    }

    /**
     * GET /api/exams/banks-for-subject/{subjectId}
     * Lấy ngân hàng câu hỏi (kèm chương) theo môn học.
     */
    public function banksForSubject(string $subjectId): JsonResponse
    {
        $banks = $this->examService->getBanksForSubject($subjectId);

        return response()->json([
            'success' => true,
            'data'    => $banks,
        ]);
    }

    /**
     * GET /api/exams
     */
    public function index(Request $request): JsonResponse
    {
        $data = $this->examService->getAllForUser($request->user());

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    /**
     * GET /api/exams/{id}
     */
    public function show(string $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->examService->getDetail($id),
        ]);
    }

    /**
     * POST /api/exams
     */
    public function store(ExamStoreRequest $request): JsonResponse
    {
        try {
            $data = $this->examService->createForUser($request->validated(), $request->user());
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tạo đề thi thành công.',
            'data'    => $data,
        ], 201);
    }

    /**
     * PUT /api/exams/{id}
     */
    public function update(ExamUpdateRequest $request, string $id): JsonResponse
    {
        try {
            $data = $this->examService->updateForUser($id, $request->validated(), $request->user());
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật đề thi thành công.',
            'data'    => $data,
        ]);
    }

    /**
     * DELETE /api/exams/{id}
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $this->examService->deleteForUser($id, $request->user());
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa đề thi thành công.',
        ]);
    }
}
