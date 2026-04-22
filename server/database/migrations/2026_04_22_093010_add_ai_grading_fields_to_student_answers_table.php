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
        Schema::table('StudentAnswer', function (Blueprint $table) {
            $table->float('AIGradeScore', 5, 2)->nullable()->after('RawScore');
            $table->text('AIFeedback')->nullable()->after('AIGradeScore');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('StudentAnswer', function (Blueprint $table) {
            $table->dropColumn(['AIGradeScore', 'AIFeedback']);
        });
    }
};
