<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Semester', function (Blueprint $table) {
            $table->string('SemesterID', 10)->primary();
            $table->string('SemesterName', 255);
            $table->string('AcademicYear', 20);
            $table->date('StartDate');
            $table->date('EndDate');

            $table->unique(['SemesterName', 'AcademicYear'], 'uq_semester_name_year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Semester');
    }
};
