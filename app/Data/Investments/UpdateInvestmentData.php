<?php

namespace App\Data\Investments;

use App\Enums\InvestmentType;
use Spatie\LaravelData\Data;

class UpdateInvestmentData extends Data
{
    public function __construct(
        public string $name,
        public InvestmentType $type,
        public float $current_value,
        public ?int $account_id = null,
        public ?string $notes = null,
    ) {}
}
