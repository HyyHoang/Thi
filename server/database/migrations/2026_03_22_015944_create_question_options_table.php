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
        Schema::create('question_options', function (Blueprint $table) {
            $table->id('OptionID'); // int AI PK
            $table->string('QuestionID', 20); // Matched to question table
            $table->text('Content');
            $table->boolean('IsCorrect')->default(false);
            $table->integer('OrderNumber')->nullable();

            $table->foreign('QuestionID')->references('QuestionID')->on('question')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_options');
    }
};
