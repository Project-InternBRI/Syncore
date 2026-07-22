<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    /**
     * Log an activity.
     *
     * @param string $module
     * @param string $action
     * @param string|null $description
     * @param int|null $userId (Optional, defaults to currently authenticated user)
     * @return void
     */
    public static function log(string $module, string $action, ?string $description = null, ?int $userId = null)
    {
        $userId = $userId ?? (Auth::id() ?? null);

        if (!$userId) {
            // Cannot log activity if there is no user associated.
            return;
        }

        ActivityLog::create([
            'user_id'     => $userId,
            'module'      => $module,
            'action'      => $action,
            'description' => $description,
            'ip_address'  => Request::ip(),
        ]);
    }
}
