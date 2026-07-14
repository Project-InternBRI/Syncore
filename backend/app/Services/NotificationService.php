<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send a new notification to a specific user.
     *
     * @param int $userId
     * @param string $type
     * @param string $title
     * @param string $message
     * @param string $priority 'high', 'medium', 'low'
     * @param string|null $actionUrl
     * @param array $metadata
     * @return Notification|null
     */
    public static function send($userId, $type, $title, $message, $priority = 'low', $actionUrl = null, $metadata = [])
    {
        try {
            $notification = Notification::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'priority' => $priority,
                'action_url' => $actionUrl,
                'metadata' => $metadata
            ]);

            // TODO: In the future, trigger email notification here based on the notification type
            // e.g. Mail::to($user->email)->send(new NotificationEmail($notification));

            return $notification;
        } catch (\Exception $e) {
            Log::error('Gagal mengirim notifikasi: ' . $e->getMessage(), [
                'user_id' => $userId,
                'type' => $type
            ]);
            return null;
        }
    }

    /**
     * Send notification to all super admins.
     */
    public static function sendToSuperAdmins($type, $title, $message, $priority = 'high', $actionUrl = null, $metadata = [])
    {
        $superAdmins = User::where('role', 'super_admin')->get();

        foreach ($superAdmins as $admin) {
            self::send($admin->id, $type, $title, $message, $priority, $actionUrl, $metadata);
        }
    }
}
