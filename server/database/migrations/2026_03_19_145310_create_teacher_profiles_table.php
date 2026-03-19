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
        Schema::create('TeacherProfile', function (Blueprint $table) {
            $table->id('TeacherID');
            $table->integer('UserID');
            $table->integer('DepartmentID');
            $table->string('FullName', 255);
            $table->string('Gender', 10)->nullable();
            $table->date('BirthDate')->nullable();
            $table->string('Phone', 15)->nullable();
            $table->string('Degree', 100)->nullable();
            $table->string('AcademicRank', 100)->nullable();
            $table->dateTime('CreatedDate')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('TeacherProfile');
    }
};
