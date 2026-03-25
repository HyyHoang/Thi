<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SemesterStoreRequest;
use App\Http\Requests\SemesterUpdateRequest;
use App\Services\Contracts\SemesterServiceInterface;
use Illuminate\Http\JsonResponse;

class SemesterController extends Controller
{
    public function __construct(
        private readonly SemesterServiceInterface $semesterService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->semesterService->getAllFormatted(),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->semesterService->getByIdFormatted($id),
        ]);
    }

    public function store(SemesterStoreRequest $request): JsonResponse
    {
        $data = $this->semesterService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Tạo học kỳ thành công',
            'data' => $data,
        ], 201);
    }

    public function update(SemesterUpdateRequest $request, string $id): JsonResponse
    {
        $data = $this->semesterService->update($id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật học kỳ thành công',
            'data' => $data,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $this->semesterService->delete($id);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa học kỳ thành công',
        ]);
    }
}
