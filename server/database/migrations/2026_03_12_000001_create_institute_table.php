<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Institute', function (Blueprint $table) {
            $table->increments('InstituteID');
            $table->string('InstituteName', 255)->unique();
            $table->text('Description')->nullable();
            $table->dateTime('CreatedDate')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Institute');
    }
};

