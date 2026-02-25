<?php

namespace App\Data\Accounts;

use App\Enums\AccountType;
use Spatie\LaravelData\Data;

class CreateAccountData extends Data
{
    public function __construct(
        public string $name,
        public AccountType $type,
        public float $initial_balance = 0,
        public ?string $notes = null,
    ) {}
}
