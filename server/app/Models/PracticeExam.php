<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PracticeExam extends Model
{
    protected $table = 'practice_exams';
    protected $primaryKey = 'PracticeExamID';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'PracticeExamID',
        'Title',
        'SubjectID',
        'UserID',
        'Duration',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->PracticeExamID)) {
                $lastRecord = static::orderByRaw('LENGTH(PracticeExamID) DESC')
                                    ->orderBy('PracticeExamID', 'desc')
                                    ->first();
                if (!$lastRecord || empty($lastRecord->PracticeExamID)) {
                    $model->PracticeExamID = 'PE001';
                } else {
                    $lastNumber = (int) substr($lastRecord->PracticeExamID, 2);
                    $newNumber = $lastNumber + 1;
                    $model->PracticeExamID = 'PE' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'SubjectID', 'SubjectID');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    public function studentProfile()
    {
        return $this->belongsTo(StudentProfile::class, 'UserID', 'UserID');
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'practice_exam_questions', 'PracticeExamID', 'QuestionID')
                    ->withPivot('OrderNumber')
                    ->orderBy('practice_exam_questions.OrderNumber');
    }
}
