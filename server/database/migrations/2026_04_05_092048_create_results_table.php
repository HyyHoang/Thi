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
        Schema::create('Result', function (Blueprint $table) {
            $table->bigIncrements('ResultID');
            $table->unsignedBigInteger('AttemptID');
            $table->unsignedInteger('CorrectAnswers')->default(0);
            $table->decimal('Score', 5, 2)->default(0);
            $table->unsignedInteger('WorkingTime')->default(0)->comment('Thời gian làm bài (giây)');
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('AttemptID')->references('AttemptID')->on('ExamAttempt')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Result');
    }
};
