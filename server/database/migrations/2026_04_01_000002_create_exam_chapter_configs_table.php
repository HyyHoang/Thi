<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ExamChapterConfig', function (Blueprint $table) {
            $table->bigIncrements('ConfigID');
            $table->string('ExamID', 10);
            $table->string('BankID', 10);
            $table->integer('ChapterNumber');
            $table->integer('QuestionCount')->comment('Số câu lấy từ chương này khi thi');

            $table->foreign('ExamID')->references('ExamID')->on('Exam')->onDelete('cascade');
            $table->foreign('BankID')->references('BankID')->on('question_banks')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ExamChapterConfig');
    }
};
