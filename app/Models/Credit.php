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
        $paidAmount = $this->payments()->whereNotNull('paid_at')->sum('amount');

        return (float) $this->total_amount - $paidAmount;
    }
}
