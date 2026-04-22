<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamChapterConfig;
use App\Models\Result;
use App\Models\StudentAnswer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    /**
     * GET /api/admin/grading/pending
     * Lấy danh sách bài thi đang chờ chấm tự luận.
     */
    public function pending(Request $request): JsonResponse
    {
        $user = $request->user();
        $isGraded = $request->query('is_graded', 0); // Default to pending (0)

        $query = Result::with(['attempt.student', 'attempt.exam'])
            ->where('IsGraded', (bool)$isGraded);

        // Nếu là giáo viên (Role=1), chỉ lấy bài thi họ tạo và KHÔNG PHẢI là bài thi cuối kỳ
        if ((int)$user->Role === 1) {
            $query->whereHas('attempt.exam', function($q) use ($user) {
                $q->where('CreatedBy', $user->UserID)
                  ->where('IsFinalExam', 0);
            });
        }

        $results = $query->orderBy('CreatedAt', 'desc')->get();

        return response()->json([
            'success' => true,
            'data'    => $results->map(function($r) {
                $exam = $r->attempt->exam ?? null;
                $student = $r->attempt->student ?? null;
                return [
                    'result_id'    => $r->ResultID,
                    'exam_title'   => $exam->Title ?? 'N/A',
                    'student_name' => $student->FullName ?? 'N/A',
                    'created_at'   => $r->CreatedAt,
                    'mcq_score'    => (float)$r->MCQScore,
                    'essay_score'  => (float)$r->EssayScore,
                    'total_score'  => (float)$r->Score,
                    'is_graded'    => $r->IsGraded,
                ];
            })
        ]);
    }

    /**
     * GET /api/admin/grading/{resultId}
     * Chi tiết bài làm tự luận để chấm điểm.
     */
    public function show(Request $request, $resultId): JsonResponse
    {
        $user = $request->user();
        $result = Result::with(['attempt.student', 'attempt.exam'])->findOrFail($resultId);

        // Kiểm tra quyền
        if ((int)$user->Role === 1) {
            if ($result->attempt->exam->IsFinalExam) {
                return response()->json(['success' => false, 'message' => 'Bạn không được phép chấm điểm bài thi cuối kỳ.'], 403);
            }
            if ($result->attempt->exam->CreatedBy !== $user->UserID) {
                return response()->json(['success' => false, 'message' => 'Bạn không có quyền chấm bài này.'], 403);
            }
        }

        if (!$result->attempt || !$result->attempt->exam) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu bài làm hoặc đề thi không tồn tại.'], 404);
        }

        $exam = $result->attempt->exam;
        
        // Lấy tất cả câu hỏi tự luận trong bài làm này
        $answers = StudentAnswer::where('ResultID', $resultId)
            ->with('question')
            ->get()
            ->filter(fn($a) => $a->question && $a->question->Type === 'essay');

        // Lấy trọng số từ ExamChapterConfig
        $configs = ExamChapterConfig::where('ExamID', $exam->ExamID)->get();

        $gradingData = $answers->map(function($ans) use ($configs) {
            $q = $ans->question;
            // Tìm config tương ứng để lấy trọng số (%)
            $config = $configs->where('BankID', $q->BankID)
                              ->where('ChapterNumber', $q->ChapterNumber)
                              ->first();
            
            return [
                'student_answer_id' => $ans->StudentAnswerID,
                'question_id'       => $q->QuestionID,
                'content'           => $q->Content,
                'student_answer'    => $ans->SelectedAnswer,
                'raw_score'         => $ans->RawScore,
                'ai_score'          => $ans->AIGradeScore,
                'ai_feedback'       => $ans->AIFeedback,
                'weight'            => $config ? (float)$config->Weight : 0,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'result_id'    => $result->ResultID,
                'exam_title'   => $exam->Title,
                'essay_weight' => (float)$exam->EssayWeight,
                'is_graded'    => $result->IsGraded,
                'answers'      => $gradingData
            ]
        ]);
    }

    /**
     * POST /api/admin/grading/{resultId}
     * Lưu điểm chấm bài.
     */
    public function update(Request $request, $resultId): JsonResponse
    {
        $request->validate([
            'answers'           => 'required|array',
            'answers.*.id'      => 'required|integer|exists:StudentAnswer,StudentAnswerID',
            'answers.*.score'   => 'required|numeric|min:0|max:10',
        ]);

        $user = $request->user();
        $result = Result::with('attempt.exam')->findOrFail($resultId);

        if ((int)$user->Role === 1) {
            if ($result->attempt->exam->IsFinalExam) {
                return response()->json(['success' => false, 'message' => 'Bạn không được phép chấm điểm bài thi cuối kỳ.'], 403);
            }
            if ($result->attempt->exam->CreatedBy !== $user->UserID) {
                return response()->json(['success' => false, 'message' => 'Bạn không có quyền chấm bài này.'], 403);
            }
            if ($result->IsGraded) {
                return response()->json(['success' => false, 'message' => 'Bạn không có quyền sửa điểm bài đã chấm.'], 403);
            }
        }

        $exam = $result->attempt->exam;
        $configs = ExamChapterConfig::where('ExamID', $exam->ExamID)->get();

        DB::transaction(function() use ($request, $result, $configs, $exam) {
            $totalEssayScore = 0;

            foreach ($request->input('answers') as $ansInput) {
                $ans = StudentAnswer::with('question')->find($ansInput['id']);
                $ans->RawScore = $ansInput['score'];
                $ans->save();

                // Tính điểm thành phần: (điểm/10) * (% trọng số / 100) * EssayWeight
                $q = $ans->question;
                $config = $configs->where('BankID', $q->BankID)
                                  ->where('ChapterNumber', $q->ChapterNumber)
                                  ->first();
                
                $weightPct = $config ? (float)$config->Weight : 0;
                // Ví dụ: SV được 8 điểm, câu này chiếm 50% phần tự luận, phần tự luận chiếm 3 điểm.
                // Điểm câu này = (8/10) * (50/100) * 3 = 0.8 * 0.5 * 3 = 1.2 điểm.
                $itemScore = ($ans->RawScore / 10) * ($weightPct / 100) * $exam->EssayWeight;
                $totalEssayScore += $itemScore;
            }

            $result->EssayScore = round($totalEssayScore, 2);
            $result->Score = round($result->MCQScore + $result->EssayScore, 2);
            $result->IsGraded = true;
            $result->save();
        });

        return response()->json([
            'success' => true,
            'message' => 'Chấm bài thành công.',
            'data'    => [
                'essay_score' => $result->EssayScore,
                'total_score' => $result->Score
            ]
        ]);
    }

    /**
     * POST /api/admin/grading/ai-grade-answer/{answerId}
     * Gọi hệ thống AI để chấm tự động cho một câu trả lời duy nhất.
     */
    public function triggerAIGrading(Request $request, $answerId, \App\Services\AIGradingService $aiService): JsonResponse
    {
        $answer = StudentAnswer::with(['question', 'result.attempt.exam'])->find($answerId);
        
        if (!$answer || !$answer->question || $answer->question->Type !== 'essay') {
            return response()->json(['success' => false, 'message' => 'Câu trả lời không hợp lệ hoặc không phải câu tự luận.'], 400);
        }

        // Lấy trọng số thực tế từ ExamChapterConfig để làm điểm tối đa của câu
        $exam = $answer->result->attempt->exam;
        $configs = ExamChapterConfig::where('ExamID', $exam->ExamID)->get();
        $config = $configs->where('BankID', $answer->question->BankID)
                          ->where('ChapterNumber', $answer->question->ChapterNumber)
                          ->first();
        
        $weightPct = $config ? (float)$config->Weight : 0;
        // The service logic is expecting maxScore, which by convention in our old system was 10 for raw score scaling.
        // I will pass maxScore=10 for raw, so AI grades out of 10.
        $maxScore = 10.0;

        $aiResult = $aiService->gradeEssay(
            $answer->question->Content,
            $answer->SelectedAnswer,
            $maxScore
        );

        if ($aiResult) {
            $answer->AIGradeScore = $aiResult['score'];
            $answer->AIFeedback = $aiResult['feedback'];
            $answer->save();

            return response()->json([
                'success' => true,
                'data' => [
                    'ai_score' => $answer->AIGradeScore,
                    'ai_feedback' => $answer->AIFeedback
                ]
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Lỗi kết nối tới AI. Vui lòng thử lại sau.'], 500);
    }
}
