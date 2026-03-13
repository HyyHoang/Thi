<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Institute extends Model
{
    use HasFactory;

    protected $table = 'Institute';
    protected $primaryKey = 'InstituteID';

    public $timestamps = false;

    protected $fillable = [
        'InstituteName',
        'Description',
        'CreatedDate',
    ];

    protected $casts = [
        'CreatedDate' => 'datetime',
    ];
}

