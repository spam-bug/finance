<?php

namespace App\Enums;

enum CreditPaymentFrequency: string
{
    case Monthly = 'monthly';
    case Quarterly = 'quarterly';
}
