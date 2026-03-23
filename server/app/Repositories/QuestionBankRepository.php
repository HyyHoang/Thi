<?php

namespace App\Repositories;

use App\Models\QuestionBank;
use App\Repositories\Contracts\QuestionBankRepositoryInterface;
use Illuminate\Support\Collection;

class QuestionBankRepository extends BaseRepository implements QuestionBankRepositoryInterface
{
    public function __construct(QuestionBank $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getAll(): Collection
    {
        return $this->model->newQuery()
            ->orderBy('BankID')
            ->get();
    }
}
