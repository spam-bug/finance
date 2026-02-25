<?php

namespace App\Data\Investments;

use App\Enums\InvestmentType;
use Spatie\LaravelData\Data;

class CreateInvestmentData extends Data
{
    public function __construct(
        public string $name,
        public InvestmentType $type,
        public float $initial_value,
        public float $current_value,
        public ?int $account_id = null,
        public ?string $notes = null,
    ) {}
}
