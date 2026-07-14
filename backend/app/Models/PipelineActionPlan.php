<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PipelineActionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'tahun',
        'bulan',
        'branch_name',
        'kategori',
        'nasabah',
        'nominal',
        'tanggal',
        'week',
    ];
}
