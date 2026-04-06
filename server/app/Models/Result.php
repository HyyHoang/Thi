<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Result extends Model
{
    protected $table      = 'Result';
    protected $primaryKey = 'ResultID';
    public    $incrementing = true;
    protected $keyType    = 'integer';

    public const CREATED_AT = 'CreatedAt';
    public const UPDATED_AT = 'UpdatedAt';

    protected $fillable = [
        'AttemptID',
        'CorrectAnswers',
        'Score',
        'WorkingTime',
    ];

    protected $casts = [
        'CorrectAnswers' => 'integer',
        'Score'          => 'decimal:2',
        'WorkingTime'    => 'integer',
    ];

    // ─── Relations ────────────────────────────────────────────────

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'AttemptID', 'AttemptID');
    }

    public function studentAnswers(): HasMany
    {
        return $this->hasMany(StudentAnswer::class, 'ResultID', 'ResultID');
    }
}
