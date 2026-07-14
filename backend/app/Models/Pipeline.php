<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pipeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'tahun',
        'bulan',
        'type',
        'branch_name',
        'kategori',
        'w1',
        'w2',
        'w3',
        'w4',
        'gap_harian',
        'deskripsi',
        'created_by'
    ];
}
