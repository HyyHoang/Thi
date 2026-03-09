<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class TestController extends Controller
{
    public function ping()
    {
        return response()->json([
            'success' => true,
            'message' => 'Kết nối thành công!',
            'data' => [
                'time' => now()->toDateTimeString(),
                'version' => '1.0.0'
            ]
        ]);
    }
}