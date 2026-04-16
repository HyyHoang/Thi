<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('practice_exams', function (Blueprint $table) {
            $table->string('PracticeExamID', 10)->primary();
            $table->string('Title', 255);
            $table->string('SubjectID', 10);
            $table->string('UserID', 10);
            $table->integer('Duration')->default(60);
            $table->timestamps();

            $table->foreign('SubjectID')->references('SubjectID')->on('subject')->onDelete('cascade');
            $table->foreign('UserID')->references('UserID')->on('user')->onDelete('cascade');
        });

        Schema::create('practice_exam_questions', function (Blueprint $table) {
            $table->id();
            $table->string('PracticeExamID', 10);
            $table->string('QuestionID', 10);
            $table->integer('OrderNumber')->default(1);
            
            $table->foreign('PracticeExamID')->references('PracticeExamID')->on('practice_exams')->onDelete('cascade');
            $table->foreign('QuestionID')->references('QuestionID')->on('question')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practice_exam_questions');
        Schema::dropIfExists('practice_exams');
    }
};
