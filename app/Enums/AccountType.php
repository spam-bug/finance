<?php

namespace App\Enums;

enum AccountType: string
{
    case Cash = 'cash';
    case Bank = 'bank';
    case EWallet = 'e_wallet';
    case Investment = 'investment';
}
