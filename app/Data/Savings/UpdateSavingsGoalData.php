<?php

namespace App\Data\Savings;

use Spatie\LaravelData\Data;

class UpdateSavingsGoalData extends Data
{
    public function __construct(
        public string $name,
        public float $target_amount,
        public float $current_amount,
        public ?string $target_date = null,
        public ?int $account_id = null,
    ) {}
}
