<?php

namespace App\Console\Commands;

use App\Models\Credit;
use Illuminate\Console\Command;

class GenerateIndefiniteCreditPayments extends Command
{
    protected $signature = 'credits:generate-payments';

    protected $description = 'Generate the next payment for indefinite credits where all existing payments are paid';

    public function handle(): void
    {
        $credits = Credit::query()
            ->where('is_indefinite', true)
            ->with('payments')
            ->get();

        $generated = 0;

        foreach ($credits as $credit) {
            $unpaidPayments = $credit->payments->whereNull('paid_at');

            if ($unpaidPayments->isEmpty()) {
                $credit->generateNextPayment();
                $generated++;
                $this->line("Generated next payment for: {$credit->name}");
            }
        }

        $this->info("Generated {$generated} payment(s).");
    }
}
