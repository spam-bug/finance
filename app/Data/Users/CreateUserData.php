<?php

namespace App\Data\Users;

use App\Enums\Permission;
use Spatie\LaravelData\Data;

class CreateUserData extends Data
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public Permission $permission,
    ) {}
}
