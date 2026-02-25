<?php

namespace App\Data\Invitations;

use App\Enums\Permission;
use Spatie\LaravelData\Data;

class CreateInvitationData extends Data
{
    public function __construct(
        public string $email,
        public Permission $permission,
    ) {}
}
