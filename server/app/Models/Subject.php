<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $table = 'Subject';
    protected $primaryKey = 'SubjectID';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->SubjectID)) {
                $lastRecord = static::orderByRaw('LENGTH(SubjectID) DESC')->orderBy('SubjectID', 'desc')->first();
                if (!$lastRecord || empty($lastRecord->SubjectID)) {
                    $model->SubjectID = 'SU001';
                } else {
                    $lastNumber = (int) substr($lastRecord->SubjectID, 2);
                    $newNumber = $lastNumber + 1;
                    $model->SubjectID = 'SU' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    protected $fillable = [
        'DepartmentID',
        'SubjectName',
        'Description',
        'Credit',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentID', 'DepartmentID');
    }
}
