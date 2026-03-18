<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DepartmentStoreRequest;
use App\Http\Requests\DepartmentUpdateRequest;
use App\Services\Contracts\DepartmentServiceInterface;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    public function __construct(
        private readonly DepartmentServiceInterface $departmentService
    ) {}

    /**
     * GET /api/departments
     * Lấy danh sách tất cả khoa kèm thông tin viện.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->departmentService->getAllWithInstitute(),
        ]);
    }

    /**
     * GET /api/departments/{id}
     * Lấy chi tiết 1 khoa kèm thông tin viện.
     */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->departmentService->getByIdWithInstitute($id),
        ]);
    }

    /**
     * POST /api/departments
     * Tạo mới khoa.
     */
    public function store(DepartmentStoreRequest $request): JsonResponse
    {
        $data = $this->departmentService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Thêm khoa thành công',
            'data'    => $data,
        ], 201);
    }

    /**
     * PUT /api/departments/{id}
     * Cập nhật thông tin khoa.
     */
    public function update(DepartmentUpdateRequest $request, int $id): JsonResponse
    {
        $data = $this->departmentService->update($id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật khoa thành công',
            'data'    => $data,
        ]);
    }

    /**
     * DELETE /api/departments/{id}
     * Xóa khoa.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->departmentService->delete($id);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa khoa thành công',
        ]);
    }
}
