<?php

namespace App\Enums;

enum TransactionFrequency: string
{
    case OneTime = 'one_time';
    case Monthly = 'monthly';
    case BiMonthly = 'bi_monthly';
    case Quarterly = 'quarterly';
    case Annually = 'annually';
}
