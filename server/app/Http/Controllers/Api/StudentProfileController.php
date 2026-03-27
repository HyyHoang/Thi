<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StudentProfileStoreRequest;
use App\Http\Requests\StudentProfileUpdateRequest;
use App\Services\Contracts\StudentProfileServiceInterface;
use Illuminate\Http\JsonResponse;

class StudentProfileController extends Controller
{
    protected $studentProfileService;

    public function __construct(StudentProfileServiceInterface $studentProfileService)
    {
        $this->studentProfileService = $studentProfileService;
    }

    public function index(): JsonResponse
    {
        $profiles = $this->studentProfileService->getAllStudentProfiles();
        return response()->json($profiles);
    }

    public function store(StudentProfileStoreRequest $request): JsonResponse
    {
        $profile = $this->studentProfileService->createStudentProfile($request->validated());
        return response()->json($profile, 201);
    }

    public function show($id): JsonResponse
    {
        $profile = $this->studentProfileService->getStudentProfileById($id);
        if (!$profile) {
            return response()->json(['message' => 'Student Profile not found'], 404);
        }
        return response()->json($profile);
    }

    public function update(StudentProfileUpdateRequest $request, $id): JsonResponse
    {
        $profile = $this->studentProfileService->updateStudentProfile($id, $request->validated());
        if (!$profile) {
            return response()->json(['message' => 'Student Profile not found'], 404);
        }
        return response()->json($profile);
    }

    public function destroy($id): JsonResponse
    {
        $deleted = $this->studentProfileService->deleteStudentProfile($id);
        if (!$deleted) {
            return response()->json(['message' => 'Student Profile not found or could not be deleted'], 404);
        }
        return response()->json(['message' => 'Student Profile deleted successfully'], 200);
    }
}
