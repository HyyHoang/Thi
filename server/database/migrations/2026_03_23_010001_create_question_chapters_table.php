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
        Schema::create('question_chapters', function (Blueprint $table) {
            $table->increments('ChapterID');
            $table->string('BankID', 10);
            $table->unsignedInteger('ChapterNumber');
            $table->string('ChapterName', 255);
            $table->text('Description')->nullable();
            $table->unsignedInteger('QuestionCount')->default(0);

            $table->foreign('BankID', 'fk_question_chapters_bank')
                ->references('BankID')->on('question_banks')
                ->cascadeOnDelete();

            $table->unique(['BankID', 'ChapterNumber'], 'uq_question_chapters_bank_chapter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_chapters');
    }
};
