<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAnswer extends Model
{
    protected $table      = 'StudentAnswer';
    protected $primaryKey = 'StudentAnswerID';
    public    $incrementing = true;
    protected $keyType    = 'integer';

    public const CREATED_AT = 'CreatedAt';
    public const UPDATED_AT = 'UpdatedAt';

    protected $fillable = [
        'ResultID',
        'QuestionID',
        'SelectedAnswer',
        'IsCorrect',
    ];

    protected $casts = [
        'IsCorrect' => 'boolean',
    ];

    // ─── Relations ────────────────────────────────────────────────

    public function result(): BelongsTo
    {
        return $this->belongsTo(Result::class, 'ResultID', 'ResultID');
    }

    public function question(): BelongsTo
    {
        // Giả sử tên file model là Question
        return $this->belongsTo(Question::class, 'QuestionID', 'QuestionID');
    }
}
