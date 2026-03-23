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
        Schema::create('question', function (Blueprint $table) {
            $table->string('QuestionID', 20)->primary();
            $table->string('SubjectID', 20)->nullable();
            $table->string('BankID', 10)->nullable();
            $table->integer('ChapterNumber')->nullable();
            $table->string('Content', 255);
            $table->string('CorrectAnswer', 100)->nullable();
            $table->string('UserID', 20)->nullable();
            $table->enum('Type', ['single', 'multiple', 'essay']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question');
    }
};
