<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Contracts\ResultServiceInterface;
use Illuminate\Http\JsonResponse;

class ResultController extends Controller
{
    public function __construct(
        private readonly ResultServiceInterface $resultService
    ) {}

    /**
     * GET /api/results
     * Lấy danh sách kết quả bài làm của sinh viên (hiển thị cho Admin/Khoa).
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->resultService->getAllWithDetails(),
        ]);
    }

    /**
     * GET /api/results/{id}
     * Lấy chi tiết điểm số, thông tin học sinh và danh sách các câu đã làm (chi tiết từng StudentAnswer).
     */
    public function show(string $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->resultService->getDetails($id),
        ]);
    }
    /**
     * GET /api/results/by-attempt/{attemptId}
     * Lấy chi tiết thông qua AttemptID
     */
    public function byAttempt(string $attemptId): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data'    => $this->resultService->getDetailsByAttempt($attemptId),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
