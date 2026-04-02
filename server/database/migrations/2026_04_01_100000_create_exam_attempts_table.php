<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ExamAttempt', function (Blueprint $table) {
            $table->bigIncrements('AttemptID');
            $table->string('ExamID', 10);
            $table->string('StudentID', 10);
            $table->dateTime('StartTime')->useCurrent();
            $table->dateTime('SubmitTime')->nullable();
            // Status: 'in_progress' | 'submitted' | 'expired'
            $table->string('Status', 20)->default('in_progress');
            $table->string('IPAddress', 45)->nullable();

            $table->foreign('ExamID')
                  ->references('ExamID')->on('Exam')
                  ->onDelete('cascade');

            $table->foreign('StudentID')
                  ->references('StudentID')->on('StudentProfile')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ExamAttempt');
    }
};
