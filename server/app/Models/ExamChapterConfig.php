<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamChapterConfig extends Model
{
    protected $table = 'ExamChapterConfig';
    protected $primaryKey = 'ConfigID';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'ExamID',
        'BankID',
        'ChapterNumber',
        'QuestionCount',
    ];

    protected $casts = [
        'ChapterNumber' => 'integer',
        'QuestionCount' => 'integer',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'ExamID', 'ExamID');
    }

    public function bank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'BankID', 'BankID');
    }
}
