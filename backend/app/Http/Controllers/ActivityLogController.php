<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $query = ActivityLog::with('user:id,name,email,role')->latest();

        if ($request->has('module') && $request->module !== 'all') {
            $query->where('module', $request->module);
        }

        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}
