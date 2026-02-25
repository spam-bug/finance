<?php

namespace App\Data\Goals;

use Spatie\LaravelData\Data;

class UpdateGoalData extends Data
{
    public function __construct(
        public string $name,
        public float $target_amount,
        public float $current_amount,
        public ?string $target_date = null,
        public ?int $account_id = null,
        public ?string $notes = null,
    ) {}
}
