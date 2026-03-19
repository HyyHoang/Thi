<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InstituteStoreRequest;
use App\Http\Requests\InstituteUpdateRequest;
use App\Services\Contracts\InstituteServiceInterface;
use Illuminate\Http\JsonResponse;

class InstituteController extends Controller
{
    public function __construct(
        private readonly InstituteServiceInterface $instituteService
    ) {}

    /**
     * GET /api/institutes
     * Lấy danh sách tất cả viện.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->instituteService->getAllFormatted(),
        ]);
    }

    /**
     * GET /api/institutes/{id}
     * Lấy chi tiết 1 viện.
     */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->instituteService->getByIdFormatted($id),
        ]);
    }

    /**
     * POST /api/institutes
     * Tạo mới viện.
     */
    public function store(InstituteStoreRequest $request): JsonResponse
    {
        $data = $this->instituteService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Thêm viện thành công',
            'data'    => $data,
        ], 201);
    }

    /**
     * PUT /api/institutes/{id}
     * Cập nhật thông tin viện.
     */
    public function update(InstituteUpdateRequest $request, int $id): JsonResponse
    {
        $data = $this->instituteService->update($id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật viện thành công',
            'data'    => $data,
        ]);
    }

    /**
     * DELETE /api/institutes/{id}
     * Xóa viện.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->instituteService->delete($id);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa viện thành công',
        ]);
    }
}
