<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TestController;
Route::get('/', function () {
    return view('welcome');
});
Route::get('/api/test', [App\Http\Controllers\Api\TestController::class, 'ping']);