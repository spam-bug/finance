<?php

namespace App\Http\Requests\Investments;

use Illuminate\Foundation\Http\FormRequest;

class AddInvestmentUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->id === $this->route('investment')->user_id;
    }

    public function rules(): array
    {
        return [
            'value' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
