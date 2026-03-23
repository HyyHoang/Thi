<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Support\Facades\DB;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // For testing we will insert some questions.
        // Assuming there's a UserID like 'UR001' and SubjectID like 'SU001' already. If not, they might fail depending on FK constraints.
        // Since we didn't add strict FK for SubjectID and UserID in migration (for safety), it should insert fine.
        DB::table('question_options')->delete();
        DB::table('question')->delete();

        $question1 = Question::create([
            'SubjectID' => 'SU001',
            'BankID' => 'BANK1',
            'ChapterNumber' => 1,
            'Content' => 'Question 1: Single Choice Example',
            'CorrectAnswer' => null,
            'UserID' => 'UR001',
            'Type' => 'single',
        ]);

        QuestionOption::insert([
            ['QuestionID' => $question1->QuestionID, 'Content' => 'Option A', 'IsCorrect' => true, 'OrderNumber' => 1],
            ['QuestionID' => $question1->QuestionID, 'Content' => 'Option B', 'IsCorrect' => false, 'OrderNumber' => 2],
            ['QuestionID' => $question1->QuestionID, 'Content' => 'Option C', 'IsCorrect' => false, 'OrderNumber' => 3],
            ['QuestionID' => $question1->QuestionID, 'Content' => 'Option D', 'IsCorrect' => false, 'OrderNumber' => 4],
        ]);

        $question2 = Question::create([
            'SubjectID' => 'SU001',
            'BankID' => 'BANK1',
            'ChapterNumber' => 2,
            'Content' => 'Question 2: Essay Example',
            'CorrectAnswer' => 'Sample answer text for essay',
            'UserID' => 'UR001',
            'Type' => 'essay',
        ]);
    }
}
