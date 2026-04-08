<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\QuestionBankStoreRequest;
use App\Http\Requests\QuestionBankUpdateRequest;
use App\Http\Requests\QuestionChapterStoreRequest;
use App\Http\Requests\QuestionChapterUpdateRequest;
use App\Services\Contracts\QuestionBankServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class QuestionBankController extends Controller
{
    public function __construct(
        private readonly QuestionBankServiceInterface $questionBankService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->questionBankService->getAllWithSubjectAndCreator(),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->questionBankService->getByIdWithDetails($id),
        ]);
    }

    public function store(QuestionBankStoreRequest $request): JsonResponse
    {
        $data = $this->questionBankService->createForUser($request->validated(), $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Tạo ngân hàng thành công',
            'data'    => $data,
        ], 201);
    }

    public function update(QuestionBankUpdateRequest $request, string $id): JsonResponse
    {
        try {
            $data = $this->questionBankService->updateForUser($id, $request->validated(), $request->user());
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thành công',
            'data'    => $data,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $this->questionBankService->deleteForUser($id, $request->user());
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa thành công',
        ]);
    }

    public function storeChapter(QuestionChapterStoreRequest $request, string $bankId): JsonResponse
    {
        try {
            $data = $this->questionBankService->createChapterForUser($bankId, $request->validated(), $request->user());
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        return response()->json([
            'success' => true,
            'message' => 'Thêm chương thành công',
            'data'    => $data,
        ], 201);
    }

    public function updateChapter(QuestionChapterUpdateRequest $request, string $bankId, int $chapterId): JsonResponse
    {
        try {
            $data = $this->questionBankService->updateChapterForUser(
                $bankId,
                $chapterId,
                $request->validated(),
                $request->user()
            );
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật chương thành công',
            'data'    => $data,
        ]);
    }

    public function destroyChapter(Request $request, string $bankId, int $chapterId): JsonResponse
    {
        try {
            $this->questionBankService->deleteChapterForUser($bankId, $chapterId, $request->user());
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa chương thành công',
        ]);
    }

    public function addQuestions(Request $request, string $bankId, int $chapterId): JsonResponse
    {
        $questionIds = $request->input('question_ids', []);

        if (empty($questionIds) || !is_array($questionIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Danh sách câu hỏi không hợp lệ.',
            ], 422);
        }

        try {
            $count = $this->questionBankService->addQuestionsToChapter(
                $bankId,
                $chapterId,
                $questionIds,
                $request->user()
            );
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        }

        return response()->json([
            'success' => true,
            'message' => "Đã thêm {$count} câu hỏi vào chương thành công.",
            'data'    => ['updated' => $count],
        ]);
    }
}
