<?php

namespace App\Data\Credits;

use App\Enums\CreditPaymentFrequency;
use Spatie\LaravelData\Data;

class CreateCreditData extends Data
{
    public function __construct(
        public string $name,
        public float $total_amount,
        public CreditPaymentFrequency $payment_frequency,
        public int $number_of_payments,
        public float $amount_per_payment,
        public string $start_date,
        public ?string $notes = null,
    ) {}
}
