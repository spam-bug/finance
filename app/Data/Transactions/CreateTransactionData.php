<?php

namespace App\Data\Transactions;

use App\Enums\TransactionFrequency;
use App\Enums\TransactionType;
use Spatie\LaravelData\Data;

class CreateTransactionData extends Data
{
    public function __construct(
        public int $account_id,
        public TransactionType $type,
        public float $amount,
        public string $date,
        public ?int $category_id = null,
        public ?string $description = null,
        public ?string $notes = null,
        public TransactionFrequency $frequency = TransactionFrequency::OneTime,
        public bool $is_recurring = false,
    ) {}
}
