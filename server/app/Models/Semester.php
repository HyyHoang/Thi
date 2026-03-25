<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    use HasFactory;

    protected $table = 'Semester';
    protected $primaryKey = 'SemesterID';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->SemesterID)) {
                $lastRecord = static::orderByRaw('LENGTH(SemesterID) DESC')->orderBy('SemesterID', 'desc')->first();
                if (!$lastRecord || empty($lastRecord->SemesterID)) {
                    $model->SemesterID = 'SE001';
                } else {
                    $lastNumber = (int) substr($lastRecord->SemesterID, 2);
                    $newNumber = $lastNumber + 1;
                    $model->SemesterID = 'SE' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    protected $fillable = [
        'SemesterName',
        'AcademicYear',
        'StartDate',
        'EndDate',
    ];
}
