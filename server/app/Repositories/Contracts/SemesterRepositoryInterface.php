<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface SemesterRepositoryInterface extends RepositoryInterface
{
    /**
     * Lấy toàn bộ học kỳ, sắp xếp theo SemesterID.
     */
    public function getAllOrdered(): Collection;
}
