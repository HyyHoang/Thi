<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

use App\Models\StudentAnswer;
use App\Services\AIGradingService;
use Illuminate\Support\Facades\Log;

class GradeStudentAnswerAIJob implements ShouldQueue
{
    use Queueable;

    protected $studentAnswerId;

    /**
     * Create a new job instance.
     */
    public function __construct($studentAnswerId)
    {
        $this->studentAnswerId = $studentAnswerId;
    }

    /**
     * Execute the job.
     */
    public function handle(AIGradingService $aiGradingService): void
    {
        $answer = StudentAnswer::with(['question', 'result.examAttempt.exam'])->find($this->studentAnswerId);
        
        if (!$answer || !$answer->question || $answer->question->QuestionType !== 'essay') {
            return;
        }

        // Get essay max weight from exam or chapter config. Let's assume standard 10 for now if not available easily.
        // It's usually exam->EssayWeight or we just pass weight directly if available at question level.
        // For simplicity we will assume maxScore for the question.
        $exam = $answer->result->examAttempt->exam ?? null;
        $maxScore = $exam ? (float) $exam->EssayWeight : 10.0; // Hardcode a fallback

        $aiResult = $aiGradingService->gradeEssay(
            $answer->question->Content,
            $answer->SelectedAnswer,
            $maxScore
        );

        if ($aiResult) {
            $answer->AIGradeScore = $aiResult['score'];
            $answer->AIFeedback = $aiResult['feedback'];
            $answer->save();
        } else {
            Log::warning("AI Grading failed for StudentAnswer ID: {$this->studentAnswerId}");
        }
    }
}
