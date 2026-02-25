<?php

namespace App\Http\Requests\Credits;

use App\Enums\CreditPaymentFrequency;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCreditRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'total_amount' => ['required', 'numeric', 'min:0.01'],
            'payment_frequency' => ['required', Rule::enum(CreditPaymentFrequency::class)],
            'number_of_payments' => ['required', 'integer', 'min:1', 'max:360'],
            'amount_per_payment' => ['required', 'numeric', 'min:0.01'],
            'start_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
