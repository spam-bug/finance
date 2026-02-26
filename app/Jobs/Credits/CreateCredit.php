<?php

namespace App\Jobs\Credits;

use App\Data\Credits\CreateCreditData;
use App\Enums\CreditPaymentFrequency;
use App\Events\Credits\CreditCreated;
use App\Models\Credit;
use App\Models\CreditPayment;
use App\Models\User;
use App\Notifications\ActivityNotification;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateCredit implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public CreateCreditData $data,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $credit = $database->transaction(function () {
            $credit = Credit::query()->create([
                ...$this->data->toArray(),
                'user_id' => $this->user->id,
            ]);

            if ($this->data->is_indefinite) {
                // Generate only the first payment for indefinite credits
                CreditPayment::query()->create([
                    'credit_id' => $credit->id,
                    'amount' => $this->data->amount_per_payment,
                    'due_date' => Carbon::parse($this->data->start_date)->toDateString(),
                ]);
            } else {
                $paymentDate = Carbon::parse($this->data->start_date);
                $count = $this->data->number_of_payments ?? 1;

                $divideIntoMonthly = $this->data->payment_frequency === CreditPaymentFrequency::Quarterly
                    && $this->data->divide_into_monthly;

                for ($i = 0; $i < $count; $i++) {
                    if ($divideIntoMonthly) {
                        $monthlyAmount = round($this->data->amount_per_payment / 3, 2);

                        for ($m = 0; $m < 3; $m++) {
                            CreditPayment::query()->create([
                                'credit_id' => $credit->id,
                                'amount' => $monthlyAmount,
                                'due_date' => $paymentDate->copy()->addMonths($m)->toDateString(),
                            ]);
                        }
                    } else {
                        CreditPayment::query()->create([
                            'credit_id' => $credit->id,
                            'amount' => $this->data->amount_per_payment,
                            'due_date' => $paymentDate->toDateString(),
                        ]);
                    }

                    if ($this->data->payment_frequency === CreditPaymentFrequency::Monthly) {
                        $paymentDate->addMonth();
                    } else {
                        $paymentDate->addMonths(3);
                    }
                }
            }

            return $credit;
        });

        broadcast(new CreditCreated(user: $this->user, credit: $credit->load('payments')));

        $this->user->notify(new ActivityNotification(
            message: "Credit \"{$credit->name}\" was created.",
            type: 'credit_created',
        ));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Credit creation failed after all retries', [
            'user' => $this->user->id,
            'data' => $this->data,
            'error' => $exception->getMessage(),
        ]);
    }
}
