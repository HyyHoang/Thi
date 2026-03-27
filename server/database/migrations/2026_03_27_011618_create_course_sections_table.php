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
        Schema::create('CourseSection', function (Blueprint $table) {
            $table->string('SectionID', 10)->primary();
            $table->string('SubjectID', 10);
            $table->string('SemesterID', 10);
            $table->string('TeacherID', 10);
            $table->string('SectionName', 255);
            $table->integer('MaxStudent');
            $table->dateTime('CreatedDate')->useCurrent();

            $table->foreign('SubjectID')->references('SubjectID')->on('Subject');
            $table->foreign('SemesterID')->references('SemesterID')->on('Semester');
            $table->foreign('TeacherID')->references('TeacherID')->on('TeacherProfile');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('CourseSection');
    }
};
