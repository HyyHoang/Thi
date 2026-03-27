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
        Schema::create('StudentProfile', function (Blueprint $table) {
            $table->string('StudentID', 20)->primary();
            $table->string('UserID', 20)->nullable();
            $table->string('DepartmentID', 20)->nullable();
            $table->string('FullName');
            $table->integer('EnrollmentYear');
            $table->tinyInteger('Status')->default(1)->comment('1: đang học, 2: bảo lưu, 3: bỏ học');

            $table->foreign('UserID')->references('UserID')->on('Users')->onDelete('set null');
            $table->foreign('DepartmentID')->references('DepartmentID')->on('Departments')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('StudentProfile');
    }
};
