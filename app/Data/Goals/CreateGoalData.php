<?php

namespace App\Data\Goals;

use Spatie\LaravelData\Data;

class CreateGoalData extends Data
{
    public function __construct(
        public string $name,
        public float $target_amount,
        public float $current_amount = 0,
        public ?string $target_date = null,
        public ?int $account_id = null,
        public ?string $notes = null,
    ) {}
}
