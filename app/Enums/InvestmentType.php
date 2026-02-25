<?php

namespace App\Enums;

enum InvestmentType: string
{
    case Shares = 'shares';
    case Bonds = 'bonds';
    case Other = 'other';
}
