<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherProfile extends Model
{
    use HasFactory;

    protected $table = 'TeacherProfile';
    protected $primaryKey = 'TeacherID';
    public $timestamps = false;

    protected $fillable = [
        'UserID',
        'DepartmentID',
        'FullName',
        'Gender',
        'BirthDate',
        'Phone',
        'Degree',
        'AcademicRank',
        'CreatedDate',
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
