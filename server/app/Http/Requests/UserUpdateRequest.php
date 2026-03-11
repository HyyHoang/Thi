<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = (int) $this->route('id');

        return [
            'username' => ['required', 'string', 'max:50', Rule::unique('User', 'Username')->ignore($userId, 'UserID')],
            'password' => ['nullable', 'string', 'min:3'],
            'email' => ['required', 'email', 'max:100', Rule::unique('User', 'Email')->ignore($userId, 'UserID')],
            'avt' => ['nullable', 'string', 'max:255'],
            'role' => ['required', 'integer', 'in:0,1,2'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'Vui lòng nhập tên tài khoản.',
            'username.unique' => 'Tên tài khoản đã tồn tại.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'email.unique' => 'Email đã tồn tại.',
            'role.required' => 'Vui lòng chọn vai trò.',
            'role.in' => 'Vai trò không hợp lệ.',
        ];
    }
}
