<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // nếu dùng Sanctum

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Cấu hình mapping sang bảng MySQL hiện có: `User`
     * với khóa chính `UserID` và các cột viết hoa.
     */
    protected $table = 'User';
    protected $primaryKey = 'UserID';
    public $timestamps = false;

    protected $fillable = [
        'Username',
        'Password',
        'Email',
        'AVT',
        'Role',
        'CreatedDate',
    ];

    protected $hidden = [
        'Password',
    ];

    protected $casts = [
        'Role' => 'integer',
        'CreatedDate' => 'datetime',
    ];
}