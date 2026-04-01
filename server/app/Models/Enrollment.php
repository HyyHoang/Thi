<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    protected $table = 'Enrollment';
    protected $primaryKey = 'EnrollmentID';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'SectionID',
        'StudentID',
        'EnrollDate',
        'Status',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->EnrollmentID)) {
                $lastRecord = static::orderByRaw('LENGTH(EnrollmentID) DESC')->orderBy('EnrollmentID', 'desc')->first();
                if (!$lastRecord || empty($lastRecord->EnrollmentID)) {
                    $model->EnrollmentID = 'EN001';
                } else {
                    $lastNumber = (int) substr($lastRecord->EnrollmentID, 2);
                    $newNumber = $lastNumber + 1;
                    $model->EnrollmentID = 'EN' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    public function courseSection()
    {
        return $this->belongsTo(CourseSection::class, 'SectionID', 'SectionID');
    }

    public function studentProfile()
    {
        return $this->belongsTo(StudentProfile::class, 'StudentID', 'StudentID');
    }
}
