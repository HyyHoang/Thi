<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentProfile extends Model
{
    use HasFactory;

    protected $table = 'StudentProfile';
    protected $primaryKey = 'StudentID';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->StudentID)) {
                $lastRecord = static::orderByRaw('LENGTH(StudentID) DESC')->orderBy('StudentID', 'desc')->first();
                if (!$lastRecord || empty($lastRecord->StudentID)) {
                    $model->StudentID = 'SP001';
                } else {
                    $lastNumber = (int) substr($lastRecord->StudentID, 2);
                    $newNumber = $lastNumber + 1;
                    $model->StudentID = 'SP' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    protected $fillable = [
        'UserID',
        'DepartmentID',
        'FullName',
        'EnrollmentYear',
        'Status',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'UserID', 'UserID');
    }

    public function department()
    {
        return $this->belongsTo(\App\Models\Department::class, 'DepartmentID', 'DepartmentID');
    }
}
