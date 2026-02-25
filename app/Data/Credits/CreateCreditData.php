<?php

namespace App\Data\Credits;

use App\Enums\CreditPaymentFrequency;
use Spatie\LaravelData\Data;

class CreateCreditData extends Data
{
    public function __construct(
        public string $name,
        public CreditPaymentFrequency $payment_frequency,
        public float $amount_per_payment,
        public string $start_date,
        public bool $is_indefinite = false,
        public ?float $total_amount = null,
        public ?int $number_of_payments = null,
        public ?string $notes = null,
    ) {}
}
