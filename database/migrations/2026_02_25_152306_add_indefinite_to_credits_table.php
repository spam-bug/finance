<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credits', function (Blueprint $table): void {
            $table->boolean('is_indefinite')->default(false)->after('notes');
            $table->unsignedSmallInteger('number_of_payments')->nullable()->change();
            $table->decimal('total_amount', 12, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('credits', function (Blueprint $table): void {
            $table->dropColumn('is_indefinite');
            $table->unsignedSmallInteger('number_of_payments')->nullable(false)->change();
            $table->decimal('total_amount', 12, 2)->nullable(false)->change();
        });
    }
};
