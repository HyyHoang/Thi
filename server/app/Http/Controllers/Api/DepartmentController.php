<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DepartmentStoreRequest;
use App\Http\Requests\DepartmentUpdateRequest;
use App\Models\Department;
use App\Models\Institute;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        $departments = Department::query()
            ->orderBy('DepartmentID')
            ->get();

        $instituteIds = $departments->pluck('InstituteID')->filter()->unique()->values();
        $institutesById = Institute::query()
            ->whereIn('InstituteID', $instituteIds)
            ->get()
            ->keyBy('InstituteID');

        return response()->json([
            'success' => true,
            'data' => $departments->map(function (Department $department) use ($institutesById) {
                $institute = $department->InstituteID ? $institutesById->get($department->InstituteID) : null;

                return $this->mapDepartment($department, $institute);
            }),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $department = Department::where('DepartmentID', $id)->firstOrFail();
        $institute = $department->InstituteID
            ? Institute::where('InstituteID', $department->InstituteID)->first()
            : null;

        return response()->json([
            'success' => true,
            'data' => $this->mapDepartment($department, $institute),
        ]);
    }

    public function store(DepartmentStoreRequest $request): JsonResponse
    {
        $data = $request->validated();

        $department = new Department();
        $department->DepartmentName = $data['department_name'];
        $department->InstituteID = $data['institute_id'];
        $department->Description = $data['description'] ?? null;
        $department->save();

        $institute = Institute::where('InstituteID', $department->InstituteID)->first();

        return response()->json([
            'success' => true,
            'message' => 'Thêm khoa thành công',
            'data' => $this->mapDepartment($department, $institute),
        ], 201);
    }

    public function update(DepartmentUpdateRequest $request, int $id): JsonResponse
    {
        $department = Department::where('DepartmentID', $id)->firstOrFail();
        $data = $request->validated();

        $department->DepartmentName = $data['department_name'];
        $department->InstituteID = $data['institute_id'];
        $department->Description = $data['description'] ?? null;
        $department->save();

        $institute = Institute::where('InstituteID', $department->InstituteID)->first();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật khoa thành công',
            'data' => $this->mapDepartment($department, $institute),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $department = Department::where('DepartmentID', $id)->firstOrFail();

        try {
            $department->delete();
        } catch (QueryException $e) {
            if (($e->errorInfo[0] ?? null) === '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa khoa vì đang có dữ liệu liên quan',
                ], 422);
            }

            throw $e;
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa khoa thành công',
        ]);
    }

    private function mapDepartment(Department $department, ?Institute $institute = null): array
    {
        return [
            'department_id' => $department->DepartmentID,
            'department_name' => $department->DepartmentName,
            'institute_id' => $department->InstituteID,
            'institute_name' => $institute?->InstituteName,
            'description' => $department->Description,
        ];
    }
}

