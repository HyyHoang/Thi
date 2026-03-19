<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Contracts\UserServiceInterface;
use Illuminate\Database\QueryException;

class UserService extends BaseService implements UserServiceInterface
{
    private const ROLE_ADMIN = 0;

    public function __construct(UserRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * {@inheritDoc}
     *
     * Lấy danh sách user đã được format.
     */
    public function getAllFormatted(): array
    {
        return $this->repository->getAll()
            ->map(fn ($user) => $this->formatUser($user))
            ->all();
    }

    /**
     * {@inheritDoc}
     *
     * Lấy chi tiết 1 user đã được format.
     */
    public function getByIdFormatted(int $id): array
    {
        $user = $this->repository->findById($id);

        return $this->formatUser($user);
    }

    /**
     * {@inheritDoc}
     *
     * Override create để map snake_case → PascalCase và trả về formatted array.
     */
    public function create(array $data): array
    {
        $user = $this->repository->create([
            'Username'    => $data['username'],
            'Password'    => $data['password'],
            'Email'       => $data['email'],
            'AVT'         => $data['avt'] ?? null,
            'Role'        => (int) $data['role'],
            'CreatedDate' => $data['created_date'] ?? now(),
        ]);

        return $this->formatUser($user);
    }

    /**
     * {@inheritDoc}
     *
     * Override update để xử lý password optional và trả về formatted array.
     */
    public function update(int $id, array $data): array
    {
        $payload = [
            'Username' => $data['username'],
            'Email'    => $data['email'],
            'AVT'      => $data['avt'] ?? null,
            'Role'     => (int) $data['role'],
        ];

        if (!empty($data['password'])) {
            $payload['Password'] = $data['password'];
        }

        $user = $this->repository->update($id, $payload);

        return $this->formatUser($user);
    }

    /**
     * {@inheritDoc}
     *
     * Override delete để chặn xóa tài khoản Admin.
     *
     * @throws \RuntimeException nếu cố xóa tài khoản Admin
     */
    public function delete(int $id): bool
    {
        $user = $this->repository->findById($id);

        if ((int) $user->Role === self::ROLE_ADMIN) {
            throw new \RuntimeException('Không thể xóa tài khoản có quyền quản trị.');
        }

        return $this->repository->delete($id);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Format user thành array response chuẩn.
     *
     * @param  \App\Models\User  $user
     * @return array<string, mixed>
     */
    private function formatUser($user): array
    {
        return [
            'user_id'      => $user->UserID,
            'username'     => $user->Username,
            'email'        => $user->Email,
            'avt'          => $user->AVT,
            'role'         => (int) $user->Role,
            'created_date' => $user->CreatedDate,
        ];
    }
}
