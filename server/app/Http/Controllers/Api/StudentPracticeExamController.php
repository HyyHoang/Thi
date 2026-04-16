<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PracticeExam;
use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentPracticeExamController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->UserID;
        $practiceExams = PracticeExam::with(['subject', 'user', 'studentProfile'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $practiceExams
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Title' => 'required|string|max:255',
            'SubjectID' => 'required|exists:subject,SubjectID',
            'Duration' => 'nullable|integer',
            'questions' => 'required|array|min:1',
            'questions.*.Content' => 'required|string',
            'questions.*.Type' => 'required|in:single,multiple',
            'questions.*.options' => 'required|array|min:2',
            'questions.*.options.*.Content' => 'required|string',
            'questions.*.options.*.IsCorrect' => 'required|boolean',
        ]);

        $userId = $request->user()->UserID;

        DB::beginTransaction();
        try {
            $exam = PracticeExam::create([
                'Title' => $request->Title,
                'SubjectID' => $request->SubjectID,
                'UserID' => $userId,
                'Duration' => $request->Duration ?? 60,
            ]);

            foreach ($request->questions as $index => $qData) {
                // CorrectAnswer derivation
                $correctOption = collect($qData['options'])->firstWhere('IsCorrect', true);
                $correctAnswerText = $correctOption ? $correctOption['Content'] : '';

                $question = Question::create([
                    'SubjectID' => $request->SubjectID,
                    'Content' => $qData['Content'],
                    'Type' => $qData['Type'],
                    'UserID' => $userId,
                    'actor' => 0, // 0 for Student
                    'CorrectAnswer' => mb_substr($correctAnswerText, 0, 100),
                ]);

                foreach ($qData['options'] as $oIndex => $optData) {
                    QuestionOption::create([
                        'QuestionID' => $question->QuestionID,
                        'Content' => $optData['Content'],
                        'IsCorrect' => $optData['IsCorrect'],
                        'OrderNumber' => $oIndex + 1,
                    ]);
                }

                $exam->questions()->attach($question->QuestionID, ['OrderNumber' => $index + 1]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo bài thi ôn tập thành công',
                'data' => $exam->load(['questions.options', 'studentProfile'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi tạo bài thi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $exam = PracticeExam::with(['subject', 'user', 'questions.options'])->find($id);

        if (!$exam) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy bài thi'
            ], 404);
        }

        // We can format the response similar to official exams if needed, 
        // or just return the raw exam with questions.
        return response()->json([
            'success' => true,
            'data' => $exam
        ]);
    }
}
