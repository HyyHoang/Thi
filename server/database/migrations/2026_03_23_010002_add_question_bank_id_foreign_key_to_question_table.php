<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('question') || !Schema::hasTable('question_banks')) {
            return;
        }

        // Gỡ BankID không tồn tại trong question_banks (dữ liệu cũ trước khi có bảng ngân hàng).
        DB::statement('
            UPDATE question q
            LEFT JOIN question_banks b ON q.BankID = b.BankID
            SET q.BankID = NULL
            WHERE q.BankID IS NOT NULL AND b.BankID IS NULL
        ');

        Schema::table('question', function (Blueprint $table) {
            if (Schema::hasColumn('question', 'BankID')) {
                $table->foreign('BankID', 'fk_question_question_bank')
                    ->references('BankID')->on('question_banks')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('question')) {
            return;
        }

        Schema::table('question', function (Blueprint $table) {
            if (Schema::hasColumn('question', 'BankID')) {
                $table->dropForeign('fk_question_question_bank');
            }
        });
    }
};
