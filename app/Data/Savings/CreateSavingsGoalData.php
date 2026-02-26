<?php

namespace App\Data\Savings;

use Spatie\LaravelData\Data;

class CreateSavingsGoalData extends Data
{
    public function __construct(
        public string $name,
        public float $target_amount,
        public float $current_amount = 0,
        public ?string $target_date = null,
        public ?int $account_id = null,
    ) {}
}
