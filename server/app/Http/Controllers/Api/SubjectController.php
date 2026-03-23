<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubjectStoreRequest;
use App\Http\Requests\SubjectUpdateRequest;
use App\Services\Contracts\SubjectServiceInterface;
use Illuminate\Http\JsonResponse;

class SubjectController extends Controller
{
    protected $subjectService;

    public function __construct(SubjectServiceInterface $subjectService)
    {
        $this->subjectService = $subjectService;
    }

    public function index(): JsonResponse
    {
        $subjects = $this->subjectService->getAllSubjects();
        return response()->json($subjects);
    }

    public function show($id): JsonResponse
    {
        $subject = $this->subjectService->getSubjectById($id);

        if (!$subject) {
            return response()->json(['message' => 'Subject not found'], 404);
        }

        return response()->json($subject);
    }

    public function store(SubjectStoreRequest $request): JsonResponse
    {
        $subject = $this->subjectService->createSubject($request->validated());
        return response()->json($subject, 201);
    }

    public function update(SubjectUpdateRequest $request, $id): JsonResponse
    {
        $subject = $this->subjectService->updateSubject($id, $request->validated());

        if (!$subject) {
            return response()->json(['message' => 'Subject not found'], 404);
        }

        return response()->json($subject);
    }

    public function destroy($id): JsonResponse
    {
        try {
            $deleted = $this->subjectService->deleteSubject($id);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Subject not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Subject deleted successfully',
        ]);
    }
}
