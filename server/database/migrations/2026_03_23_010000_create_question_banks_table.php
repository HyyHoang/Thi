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
        Schema::create('question_banks', function (Blueprint $table) {
            $table->string('BankID', 10)->primary();
            $table->string('BankName', 255);
            $table->string('SubjectID', 10);
            $table->unsignedInteger('ChapterCount')->default(0);
            $table->text('Description')->nullable();
            $table->string('UserID', 10);
            $table->dateTime('CreatedDate')->useCurrent();

            $table->foreign('SubjectID', 'fk_question_banks_subject')
                ->references('SubjectID')->on('Subject');

            $table->foreign('UserID', 'fk_question_banks_user')
                ->references('UserID')->on('User');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_banks');
    }
};
