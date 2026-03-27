<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseSection extends Model
{
    protected $table = 'CourseSection';
    protected $primaryKey = 'SectionID';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'SubjectID',
        'SemesterID',
        'TeacherID',
        'SectionName',
        'MaxStudent',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->SectionID)) {
                $lastRecord = static::orderByRaw('LENGTH(SectionID) DESC')->orderBy('SectionID', 'desc')->first();
                if (!$lastRecord || empty($lastRecord->SectionID)) {
                    $model->SectionID = 'CS001';
                } else {
                    $lastNumber = (int) substr($lastRecord->SectionID, 2);
                    $newNumber = $lastNumber + 1;
                    $model->SectionID = 'CS' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'SubjectID', 'SubjectID');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'SemesterID', 'SemesterID');
    }

    public function teacher()
    {
        return $this->belongsTo(TeacherProfile::class, 'TeacherID', 'TeacherID');
    }
}
