<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GenerateHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'period_month',
        'period_year', 'period_name',
        'generated_at',
        'ssa_simpanan_filename',
        'ssa_pinjaman_filename', 'ssa_simpanan_hist_filename', 'ssa_pinjaman_hist_filename', 'file_laba_filename',
        'total_kc',
        'total_kcp',
        'total_unit',
        'total_records',
        'status',
        'error_message'
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'total_kc' => 'integer',
        'total_kcp' => 'integer',
        'total_unit' => 'integer',
        'total_records' => 'integer',
    ];

    /**
     * Get the user that generated the data.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the snapshots for the generate history.
     */
    public function snapshots(): HasMany
    {
        return $this->hasMany(GenerateSnapshot::class);
    }
}
