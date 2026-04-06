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
        Schema::create('StudentAnswer', function (Blueprint $table) {
            $table->bigIncrements('StudentAnswerID');
            $table->unsignedBigInteger('ResultID');
            $table->string('QuestionID', 20); // Vì QuestionID trong bảng question là string 20
            $table->text('SelectedAnswer')->nullable();
            $table->boolean('IsCorrect')->default(false);
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('ResultID')->references('ResultID')->on('Result')->cascadeOnDelete();
            $table->foreign('QuestionID')->references('QuestionID')->on('question')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('StudentAnswer');
    }
};
