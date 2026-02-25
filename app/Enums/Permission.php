<?php

namespace App\Enums;

enum Permission: string
{
    case Edit = 'edit';
    case ViewOnly = 'view_only';
}
