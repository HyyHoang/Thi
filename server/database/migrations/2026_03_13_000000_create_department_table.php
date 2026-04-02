<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Department', function (Blueprint $table) {
            $table->string('DepartmentID', 10)->primary();
            $table->string('DepartmentName', 255)->unique();
            $table->string('InstituteID', 10);
            $table->text('Description')->nullable();

            $table->foreign('InstituteID', 'fk_department_institute')
                  ->references('InstituteID')->on('Institute')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Department');
    }
};
