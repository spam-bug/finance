<?php

namespace App\Models;

use App\Enums\CreditPaymentFrequency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Credit extends Model
{
    /** @use HasFactory<\Database\Factories\CreditFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'total_amount',
        'payment_frequency',
        'number_of_payments',
        'amount_per_payment',
        'start_date',
        'notes',
        'is_indefinite',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payment_frequency' => CreditPaymentFrequency::class,
            'total_amount' => 'decimal:2',
            'amount_per_payment' => 'decimal:2',
            'start_date' => 'date',
            'is_indefinite' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(CreditPayment::class);
    }

    public function remainingBalance(): float
    {
        if ($this->is_indefinite) {
            $paidAmount = $this->payments()->whereNotNull('paid_at')->sum('amount');

            return (float) $paidAmount;
        }

        $paidAmount = $this->payments()->whereNotNull('paid_at')->sum('amount');

        return (float) $this->total_amount - $paidAmount;
    }

    public function generateNextPayment(): void
    {
        $lastPayment = $this->payments()->orderByDesc('due_date')->first();

        if (! $lastPayment) {
            return;
        }

        $nextDate = $lastPayment->due_date->copy();

        if ($this->payment_frequency === CreditPaymentFrequency::Monthly) {
            $nextDate->addMonth();
        } else {
            $nextDate->addMonths(3);
        }

        $this->payments()->create([
            'amount' => $this->amount_per_payment,
            'due_date' => $nextDate->toDateString(),
        ]);
    }
}
