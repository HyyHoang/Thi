<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourseSectionStoreRequest;
use App\Http\Requests\CourseSectionUpdateRequest;
use App\Services\Contracts\CourseSectionServiceInterface;
use Illuminate\Http\JsonResponse;

class CourseSectionController extends Controller
{
    public function __construct(
        private readonly CourseSectionServiceInterface $courseSectionService
    ) {}

    /**
     * Lấy danh sách lớp học phần
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->courseSectionService->getAllWithRelations(),
        ]);
    }

    /**
     * Lấy chi tiết lớp học phần
     */
    public function show(string $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->courseSectionService->getByIdWithRelations($id),
        ]);
    }

    /**
     * Tạo lớp học phần
     */
    public function store(CourseSectionStoreRequest $request): JsonResponse
    {
        $data = $this->courseSectionService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Tạo lớp học phần thành công',
            'data'    => $data,
        ], 201);
    }

    /**
     * Cập nhật lớp học phần
     */
    public function update(CourseSectionUpdateRequest $request, string $id): JsonResponse
    {
        $data = $this->courseSectionService->update($id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật lớp học phần thành công',
            'data'    => $data,
        ]);
    }

    /**
     * Xóa lớp học phần
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->courseSectionService->delete($id);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa lớp học phần thành công',
        ]);
    }
}
