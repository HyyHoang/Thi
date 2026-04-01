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
        Schema::create('Enrollment', function (Blueprint $table) {
            $table->string('EnrollmentID', 10)->primary();
            $table->string('SectionID', 10);
            $table->string('StudentID', 20);
            $table->dateTime('EnrollDate')->useCurrent();
            $table->tinyInteger('Status')->default(1)->comment('1: Đã đăng ký, 0: Đã hủy');

            $table->foreign('SectionID')->references('SectionID')->on('CourseSection')->onDelete('cascade');
            $table->foreign('StudentID')->references('StudentID')->on('StudentProfile')->onDelete('cascade');
            $table->unique(['SectionID', 'StudentID']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Enrollment');
    }
};
