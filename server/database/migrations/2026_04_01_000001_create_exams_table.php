<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Exam', function (Blueprint $table) {
            $table->string('ExamID', 10)->primary();
            $table->string('SectionID', 10);
            $table->string('Title');
            $table->integer('Duration')->comment('Thời gian làm bài (phút)');
            $table->integer('QuestionCount')->default(0)->comment('Tổng số câu hỏi');
            $table->string('PasswordExam')->nullable()->comment('Null = không bật mật khẩu');
            $table->dateTime('StartTime');
            $table->dateTime('EndTime');
            $table->string('CreatedBy', 10);
            $table->dateTime('CreatedDate')->useCurrent();

            $table->foreign('SectionID')->references('SectionID')->on('CourseSection')->onDelete('cascade');
            $table->foreign('CreatedBy')->references('UserID')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Exam');
    }
};
