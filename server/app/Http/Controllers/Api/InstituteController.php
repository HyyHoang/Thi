<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InstituteStoreRequest;
use App\Http\Requests\InstituteUpdateRequest;
use App\Models\Institute;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;

class InstituteController extends Controller
{
    public function index(): JsonResponse
    {
        $institutes = Institute::orderBy('InstituteID')->get();

        return response()->json([
            'success' => true,
            'data' => $institutes->map(fn (Institute $institute) => $this->mapInstitute($institute)),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $institute = Institute::where('InstituteID', $id)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $this->mapInstitute($institute, true),
        ]);
    }

    public function store(InstituteStoreRequest $request): JsonResponse
    {
        $data = $request->validated();

        $institute = new Institute();
        $institute->InstituteName = $data['institute_name'];
        $institute->Description = $data['description'] ?? null;
        $institute->CreatedDate = now();
        $institute->save();

        return response()->json([
            'success' => true,
            'message' => 'Thêm viện thành công',
            'data' => $this->mapInstitute($institute),
        ], 201);
    }

    public function update(InstituteUpdateRequest $request, int $id): JsonResponse
    {
        $institute = Institute::where('InstituteID', $id)->firstOrFail();
        $data = $request->validated();

        $institute->InstituteName = $data['institute_name'];
        $institute->Description = $data['description'] ?? null;
        $institute->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật viện thành công',
            'data' => $this->mapInstitute($institute),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $institute = Institute::where('InstituteID', $id)->firstOrFail();

        try {
            $institute->delete();
        } catch (QueryException $e) {
            // MySQL FK constraint violation: SQLSTATE[23000]
            if (($e->errorInfo[0] ?? null) === '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa viện vì đang có dữ liệu liên quan',
                ], 422);
            }

            throw $e;
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa viện thành công',
        ]);
    }

    private function mapInstitute(Institute $institute, bool $includeCreatedDate = false): array
    {
        $payload = [
            'institute_id' => $institute->InstituteID,
            'institute_name' => $institute->InstituteName,
            'description' => $institute->Description,
        ];

        if ($includeCreatedDate) {
            $payload['created_date'] = $institute->CreatedDate;
        }

        return $payload;
    }
}

