<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GenerateSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'generate_history_id',
        'snapshot_type',
        'snapshot_data'
    ];

    protected $casts = [
        'snapshot_data' => 'array' // This automatically casts the JSON/JSONB column to a PHP array/object
    ];

    /**
     * Get the history that owns the snapshot.
     */
    public function history(): BelongsTo
    {
        return $this->belongsTo(GenerateHistory::class, 'generate_history_id');
    }
}
