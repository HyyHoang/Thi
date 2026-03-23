<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionChapter extends Model
{
    use HasFactory;

    protected $table = 'question_chapters';
    protected $primaryKey = 'ChapterID';
    public $incrementing = true;
    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'BankID',
        'ChapterNumber',
        'ChapterName',
        'Description',
        'QuestionCount',
    ];

    protected $casts = [
        'ChapterNumber' => 'integer',
        'QuestionCount' => 'integer',
    ];

    public function bank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'BankID', 'BankID');
    }
}
