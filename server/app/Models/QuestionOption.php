<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionOption extends Model
{
    use HasFactory;

    protected $table = 'question_options';
    protected $primaryKey = 'OptionID';
    public $timestamps = false; // Based on schema

    protected $fillable = [
        'QuestionID',
        'Content',
        'IsCorrect',
        'OrderNumber',
    ];

    protected $casts = [
        'IsCorrect' => 'boolean',
    ];

    public function question()
    {
        return $this->belongsTo(Question::class, 'QuestionID', 'QuestionID');
    }
}
