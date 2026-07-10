<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rka extends Model
{
    use HasFactory;

    protected $fillable = [
        'tahun',
        'bulan',
        'type',
        'branch_name',
        'kategori',
        'target_nominal',
        'deskripsi',
        'created_by'
    ];
}
