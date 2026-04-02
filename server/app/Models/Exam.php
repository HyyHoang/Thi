<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    protected $table = 'Exam';
    protected $primaryKey = 'ExamID';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'SectionID',
        'Title',
        'Duration',
        'QuestionCount',
        'PasswordExam',
        'StartTime',
        'EndTime',
        'CreatedBy',
        'CreatedDate',
    ];

    protected $casts = [
        'Duration'      => 'integer',
        'QuestionCount' => 'integer',
        'StartTime'     => 'datetime',
        'EndTime'       => 'datetime',
        'CreatedDate'   => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->ExamID)) {
                $last = static::orderByRaw('LENGTH(ExamID) DESC')->orderBy('ExamID', 'desc')->first();
                if (!$last || empty($last->ExamID)) {
                    $model->ExamID = 'EX001';
                } else {
                    $num = (int) substr($last->ExamID, 2);
                    $model->ExamID = 'EX' . str_pad($num + 1, 3, '0', STR_PAD_LEFT);
                }
            }
            if (empty($model->CreatedDate)) {
                $model->CreatedDate = now();
            }
        });
    }

    public function courseSection(): BelongsTo
    {
        return $this->belongsTo(CourseSection::class, 'SectionID', 'SectionID');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'CreatedBy', 'UserID');
    }

    public function chapterConfigs(): HasMany
    {
        return $this->hasMany(ExamChapterConfig::class, 'ExamID', 'ExamID');
    }
}
