<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionBank extends Model
{
    use HasFactory;

    protected $table = 'question_banks';
    protected $primaryKey = 'BankID';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->BankID)) {
                $lastRecord = static::orderByRaw('LENGTH(BankID) DESC')
                    ->orderBy('BankID', 'desc')
                    ->first();
                if (!$lastRecord || empty($lastRecord->BankID)) {
                    $model->BankID = 'QB001';
                } else {
                    $lastNumber = (int) substr($lastRecord->BankID, 2);
                    $newNumber = $lastNumber + 1;
                    $model->BankID = 'QB' . str_pad((string) $newNumber, 3, '0', STR_PAD_LEFT);
                }
            }
            if (empty($model->CreatedDate)) {
                $model->CreatedDate = now();
            }
        });
    }

    protected $fillable = [
        'BankName',
        'SubjectID',
        'ChapterCount',
        'Description',
        'UserID',
        'CreatedDate',
    ];

    protected $casts = [
        'ChapterCount' => 'integer',
        'CreatedDate' => 'datetime',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'SubjectID', 'SubjectID');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    public function chapters(): HasMany
    {
        return $this->hasMany(QuestionChapter::class, 'BankID', 'BankID')
            ->orderBy('ChapterNumber');
    }

    /**
     * Cập nhật ChapterCount và QuestionCount theo dữ liệu thực tế.
     */
    public static function syncQuestionStats(string $bankId): void
    {
        $bank = static::query()->where('BankID', $bankId)->first();
        if (!$bank) {
            return;
        }

        $chapters = QuestionChapter::query()->where('BankID', $bankId)->get();
        foreach ($chapters as $chapter) {
            $count = Question::query()
                ->where('BankID', $bankId)
                ->where('ChapterNumber', $chapter->ChapterNumber)
                ->count();
            $chapter->QuestionCount = $count;
            $chapter->save();
        }

        $bank->ChapterCount = $chapters->count();
        $bank->save();
    }
}
