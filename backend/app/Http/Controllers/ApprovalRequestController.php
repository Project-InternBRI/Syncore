<?php

namespace App\Http\Controllers;

use App\Models\ApprovalRequest;
use App\Models\Notification;
use Illuminate\Http\Request;
use App\Services\ActivityLogger;

class ApprovalRequestController extends Controller
{
    /**
     * Display a listing of the approval requests.
     */
    public function index(Request $request)
    {
        // Only allow super admin to see all requests
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = ApprovalRequest::with('user');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $requests = $query->latest()->get();

        return response()->json(['data' => $requests]);
    }

    /**
     * Check if the user has an active approved request for a specific type.
     */
    public function checkAccess(Request $request)
    {
        $type = $request->query('type');
        
        if (!$type) {
            return response()->json(['message' => 'Type is required'], 400);
        }

        $hasAccess = ApprovalRequest::where('user_id', $request->user()->id)
            ->where('type', $type)
            ->where('status', 'approved')
            ->exists();

        return response()->json(['has_access' => $hasAccess]);
    }

    /**
     * Store a newly created approval request in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'reason' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $approval = $request->user()->approvalRequests()->create([
            'type' => $request->type,
            'reason' => $request->reason,
            'metadata' => $request->metadata,
            'status' => 'pending'
        ]);

        // Notify super admins
        $superAdmins = \App\Models\User::where('role', 'super_admin')->get();
        foreach ($superAdmins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'approval_request',
                'title' => 'Permintaan Akses Baru',
                'message' => $request->user()->name . ' meminta akses: ' . $request->type,
                'action_url' => '/approval',
                'priority' => 'high'
            ]);
        }

        ActivityLogger::log('Sistem (Approval)', 'CREATE_APPROVAL', "Mengajukan permintaan akses: {$request->type}");

        return response()->json(['message' => 'Request submitted successfully', 'data' => $approval], 201);
    }

    /**
     * Approve the specified request.
     */
    public function approve(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $approval = ApprovalRequest::findOrFail($id);
        
        if ($approval->status !== 'pending') {
            return response()->json(['message' => 'Request is already processed'], 400);
        }

        $approval->update(['status' => 'approved']);

        // Notify the user who requested
        Notification::create([
            'user_id' => $approval->user_id,
            'type' => 'approval_status',
            'title' => 'Permintaan Disetujui',
            'message' => 'Permintaan akses ' . $approval->type . ' Anda telah disetujui.',
            'priority' => 'high'
        ]);

        ActivityLogger::log('Sistem (Approval)', 'APPROVE', "Menyetujui permintaan akses dari user ID: {$approval->user_id} ({$approval->type})");

        return response()->json(['message' => 'Request approved successfully', 'data' => $approval]);
    }

    /**
     * Reject the specified request.
     */
    public function reject(Request $request, $id)
    {
        if ($request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $approval = ApprovalRequest::findOrFail($id);
        
        if ($approval->status !== 'pending') {
            return response()->json(['message' => 'Request is already processed'], 400);
        }

        $approval->update(['status' => 'rejected']);

        // Notify the user who requested
        Notification::create([
            'user_id' => $approval->user_id,
            'type' => 'approval_status',
            'title' => 'Permintaan Ditolak',
            'message' => 'Permintaan akses ' . $approval->type . ' Anda ditolak oleh Admin.',
            'priority' => 'normal'
        ]);

        ActivityLogger::log('Sistem (Approval)', 'REJECT', "Menolak permintaan akses dari user ID: {$approval->user_id} ({$approval->type})");

        return response()->json(['message' => 'Request rejected successfully', 'data' => $approval]);
    }
}
