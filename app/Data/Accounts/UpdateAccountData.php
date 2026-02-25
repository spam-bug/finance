<?php

namespace App\Data\Accounts;

use App\Enums\AccountType;
use Spatie\LaravelData\Data;

class UpdateAccountData extends Data
{
    public function __construct(
        public string $name,
        public AccountType $type,
        public ?string $notes = null,
        public bool $is_active = true,
    ) {}
}
