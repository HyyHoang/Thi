<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\QuestionStoreRequest;
use App\Http\Requests\QuestionUpdateRequest;
use App\Services\Contracts\QuestionServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    protected QuestionServiceInterface $questionService;

    public function __construct(QuestionServiceInterface $questionService)
    {
        $this->questionService = $questionService;
    }

    private function checkAccess(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            abort(401, 'Unauthorized');
        }

        $role = (int) $user->Role;
        // Role 2 = Student
        if ($role === 2) {
            abort(403, 'Bạn không có quyền truy cập');
        }

        return ['user' => $user, 'role' => $role];
    }

    public function index(Request $request): JsonResponse
    {
        $this->checkAccess($request);

        $perPage = $request->query('per_page', 15);
        $search = $request->query('search', '');
        $type = $request->query('type', '');
        $questions = $this->questionService->getPaginatedQuestions($perPage, $search, $type ?: null);

        return response()->json([
            'status' => 'success',
            'data' => $questions,
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $this->checkAccess($request);

        $question = $this->questionService->findQuestionById($id);

        if (!$question) {
            return response()->json(['message' => 'Question not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $question,
        ]);
    }

    public function store(QuestionStoreRequest $request): JsonResponse
    {
        $access = $this->checkAccess($request);
        
        $data = $request->validated();
        // Gán UserID = người tạo
        $data['UserID'] = $access['user']->UserID;

        try {
            $question = $this->questionService->createQuestion($data);
        } catch (\RuntimeException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tạo câu hỏi thành công',
            'data' => $question,
        ], 201);
    }

    public function update(QuestionUpdateRequest $request, string $id): JsonResponse
    {
        $access = $this->checkAccess($request);
        $role = $access['role'];
        $user = $access['user'];

        $question = $this->questionService->findQuestionById($id);
        if (!$question) {
            return response()->json(['message' => 'Question not found'], 404);
        }

        // Kiểm tra quyền
        if ($role === 1 && $question->UserID !== $user->UserID) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn không có quyền chỉnh sửa câu hỏi này',
            ], 403);
        }

        $data = $request->validated();
        unset($data['UserID']); // Không cho phép đổi UserID

        try {
            $updatedQuestion = $this->questionService->updateQuestion($id, $data);
        } catch (\RuntimeException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật thành công',
            'data' => $updatedQuestion,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $access = $this->checkAccess($request);
        $role = $access['role'];
        $user = $access['user'];

        $question = $this->questionService->findQuestionById($id);
        if (!$question) {
            return response()->json(['message' => 'Question not found'], 404);
        }

        if ($role === 1 && $question->UserID !== $user->UserID) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bạn không có quyền xóa câu hỏi này',
            ], 403);
        }

        $this->questionService->deleteQuestion($id);

        return response()->json([
            'status' => 'success',
            'message' => 'Xóa thành công',
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $access = $this->checkAccess($request);
        $request->validate([
            'file' => 'required|file|max:10240',
        ], [
            'file.required' => 'Vui lòng chọn file CSV hoặc XLSX',
        ]);

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());

        try {
            $result = in_array($ext, ['xlsx', 'xls'])
                ? $this->questionService->importFromXlsx($file, $access['user']->UserID)
                : $this->questionService->importFromCsv($file, $access['user']->UserID);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => "Đã import {$result['imported']} câu hỏi" . (count($result['errors']) > 0 ? '. Một số dòng có lỗi.' : ''),
            'data' => [
                'imported' => $result['imported'],
                'errors' => $result['errors'],
            ],
        ]);
    }
}
