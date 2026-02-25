<?php

namespace App\Http\Requests\Credits;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PayCreditPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->id === $this->route('payment')->credit->user_id;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'account_id' => ['required', 'integer', Rule::exists('accounts', 'id')->where('user_id', $this->user()->id)],
        ];
    }
}
