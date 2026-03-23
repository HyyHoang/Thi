<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $table = 'question';
    protected $primaryKey = 'QuestionID';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // Based on schema

    protected $fillable = [
        'SubjectID',
        'BankID',
        'ChapterNumber',
        'Content',
        'CorrectAnswer',
        'UserID',
        'Type',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->QuestionID)) {
                $lastRecord = static::orderByRaw('LENGTH(QuestionID) DESC')
                                    ->orderBy('QuestionID', 'desc')
                                    ->first();
                if (!$lastRecord || empty($lastRecord->QuestionID)) {
                    $model->QuestionID = 'QU001';
                } else {
                    $lastNumber = (int) substr($lastRecord->QuestionID, 2);
                    $newNumber = $lastNumber + 1;
                    $model->QuestionID = 'QU' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    public function options()
    {
        return $this->hasMany(QuestionOption::class, 'QuestionID', 'QuestionID')->orderBy('OrderNumber');
    }

    public function bank()
    {
        return $this->belongsTo(QuestionBank::class, 'BankID', 'BankID');
    }
}
