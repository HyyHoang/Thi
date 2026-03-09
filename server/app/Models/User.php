<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // nếu dùng Sanctum

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'user_id';
    public $timestamps = false; // vì chỉ có created_at (timestamp)

    protected $fillable = [
        'username', 'email', 'password', 'role', 'status'
    ];

    protected $hidden = [
        'password', // ẩn password khi trả về JSON
    ];

    protected $casts = [
        'role' => 'integer',
        'status' => 'integer',
        'created_at' => 'datetime',
    ];
}