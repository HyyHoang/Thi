<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\InstituteController;
use App\Http\Controllers\Api\DepartmentController;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::middleware('role.admin_or_teacher')->group(function () {
        Route::get('/institutes', [InstituteController::class, 'index']);
        Route::get('/institutes/{id}', [InstituteController::class, 'show']);

        Route::get('/departments', [DepartmentController::class, 'index']);
        Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    });

    Route::middleware('role.admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        Route::post('/institutes', [InstituteController::class, 'store']);
        Route::put('/institutes/{id}', [InstituteController::class, 'update']);
        Route::delete('/institutes/{id}', [InstituteController::class, 'destroy']);

        Route::post('/departments', [DepartmentController::class, 'store']);
        Route::put('/departments/{id}', [DepartmentController::class, 'update']);
        Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);
    });
});
