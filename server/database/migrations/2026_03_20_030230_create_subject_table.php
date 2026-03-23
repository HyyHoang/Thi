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
        Schema::create('Subject', function (Blueprint $table) {
            $table->string('SubjectID', 10)->primary();
            $table->string('DepartmentID', 10);
            $table->string('SubjectName', 255);
            $table->text('Description')->nullable();
            $table->integer('Credit');

            $table->foreign('DepartmentID', 'fk_subject_department')
                  ->references('DepartmentID')->on('Department');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Subject');
    }
};
