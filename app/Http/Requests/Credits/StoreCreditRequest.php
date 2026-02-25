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
        $isIndefinite = $this->boolean('is_indefinite');

        return [
            'name' => ['required', 'string', 'max:255'],
            'is_indefinite' => ['boolean'],
            'payment_frequency' => ['required', Rule::enum(CreditPaymentFrequency::class)],
            'amount_per_payment' => ['required', 'numeric', 'min:0.01'],
            'start_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'total_amount' => [$isIndefinite ? 'nullable' : 'required', 'numeric', 'min:0.01'],
            'number_of_payments' => [$isIndefinite ? 'nullable' : 'required', 'integer', 'min:1', 'max:360'],
        ];
    }
}
