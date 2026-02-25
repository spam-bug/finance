<?php

namespace App\Data\Investments;

use Spatie\LaravelData\Data;

class AddInvestmentUpdateData extends Data
{
    public function __construct(
        public float $value,
        public string $date,
        public ?string $notes = null,
    ) {}
}
