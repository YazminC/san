<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Invitation extends Model
{
    use HasUuids;

    protected $fillable = [
        'fecha',
        'ciudad',
        'lugar',
        'lugar_personalizado',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
        ];
    }
}
