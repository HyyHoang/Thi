<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAttempt extends Model
{
    protected $table      = 'ExamAttempt';
    protected $primaryKey = 'AttemptID';
    public    $incrementing = true;
    protected $keyType    = 'integer';
    public    $timestamps = false;

    protected $fillable = [
        'ExamID',
        'StudentID',
        'StartTime',
        'SubmitTime',
        'Status',
        'IPAddress',
    ];

    protected $casts = [
        'StartTime'  => 'datetime',
        'SubmitTime' => 'datetime',
    ];

    // ─── Relations ────────────────────────────────────────────────

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'ExamID', 'ExamID');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'StudentID', 'StudentID');
    }
}
