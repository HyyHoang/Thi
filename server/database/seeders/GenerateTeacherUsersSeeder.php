<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GenerateTeacherUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Lấy tất cả thông tin hồ sơ chưa có UserID hoặc có UserID nhưng bị lỗi tham chiếu
        // Giả sử làm cho tất cả
        $teachers = DB::table('TeacherProfile')->get();

        foreach ($teachers as $teacher) {
            $fullName = trim($teacher->FullName);
            if (empty($fullName)) continue;

            // Xoá dấu tiếng Việt
            $unaccentedName = $this->removeVietnameseTones($fullName);
            // Tách các từ
            $parts = explode(' ', $unaccentedName);
            
            if (count($parts) >= 2) {
                // Tên là phần cuối
                $firstName = end($parts);
                // Họ là phần đầu
                $lastName = $parts[0];
                
                $username = strtolower($firstName . $lastName);
                $passwordPlain = strtolower($firstName) . '123@';
                $email = $username . '@gmail.com';
            } else {
                $username = strtolower($parts[0]);
                $passwordPlain = strtolower($parts[0]) . '123@';
                $email = $username . '@gmail.com';
            }

            if ($teacher->UserID) {
                // Đã có tài khoản, cập nhật lại mật khẩu thuần
                DB::table('User')->where('UserID', $teacher->UserID)
                    ->update(['Password' => $passwordPlain]);
                $this->command->info("Đã cập nhật mật khẩu thuần (Pass: $passwordPlain) cho $fullName");
                continue;
            }

            // Đảm bảo username và email là duy nhất (nếu trùng thêm ID)
            $uniqueUsername = $username;
            $uniqueEmail = $email;
            $counter = 1;

            while (DB::table('User')->where('Username', $uniqueUsername)->orWhere('Email', $uniqueEmail)->exists()) {
                $uniqueUsername = $username . $counter;
                $uniqueEmail = $username . $counter . '@gmail.com';
                $counter++;
            }

            // Tạo tài khoản User (Role = 1 cho Giáo viên) với mật khẩu thuần
            $userId = DB::table('User')->insertGetId([
                'Username' => $uniqueUsername,
                'Password' => $passwordPlain,
                'Email' => $uniqueEmail,
                'Role' => 1,
                'CreatedDate' => Carbon::now(),
            ]);

            // Cập nhật lại UserID cho TeacherProfile
            DB::table('TeacherProfile')
                ->where('TeacherID', $teacher->TeacherID)
                ->update(['UserID' => $userId]);

            $this->command->info("Tạo tài khoản: $uniqueUsername (Pass: $passwordPlain) cho $fullName");
        }
        
        $this->command->info('Đã tạo xong tất cả tài khoản cho Giảng viên!');
    }

    private function removeVietnameseTones($str)
    {
        $str = preg_replace("/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/", 'a', $str);
        $str = preg_replace("/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/", 'e', $str);
        $str = preg_replace("/(ì|í|ị|ỉ|ĩ)/", 'i', $str);
        $str = preg_replace("/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/", 'o', $str);
        $str = preg_replace("/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/", 'u', $str);
        $str = preg_replace("/(ỳ|ý|ỵ|ỷ|ỹ)/", 'y', $str);
        $str = preg_replace("/(đ)/", 'd', $str);
        
        $str = preg_replace("/(À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)/", 'A', $str);
        $str = preg_replace("/(È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)/", 'E', $str);
        $str = preg_replace("/(Ì|Í|Ị|Ỉ|Ĩ)/", 'I', $str);
        $str = preg_replace("/(Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)/", 'O', $str);
        $str = preg_replace("/(Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)/", 'U', $str);
        $str = preg_replace("/(Ỳ|Ý|Ỵ|Ỷ|Ỹ)/", 'Y', $str);
        $str = preg_replace("/(Đ)/", 'D', $str);

        return $str;
    }
}
