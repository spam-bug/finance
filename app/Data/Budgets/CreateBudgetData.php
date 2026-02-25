<?php

namespace App\Data\Budgets;

use Spatie\LaravelData\Data;

class CreateBudgetData extends Data
{
    public function __construct(
        public int $category_id,
        public float $amount,
        public int $month,
        public int $year,
    ) {}
}
