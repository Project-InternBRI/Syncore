<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pipeline;
use App\Models\Rka;
use App\Models\PipelineActionPlan;
use Illuminate\Support\Facades\Validator;

class PipelineController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $query = Pipeline::query()->orderBy('created_at', 'desc');
        
        if ($request->has('tahun') && $request->tahun != 'all') {
            $query->where('tahun', $request->tahun);
        }
        if ($request->has('branch_name') && $request->branch_name != 'all') {
            $query->where('branch_name', $request->branch_name);
        }
        if ($request->has('type') && $request->type != 'all') {
            $query->where('type', $request->type);
        }
        if ($request->has('kategori') && $request->kategori != 'all') {
            $query->where('kategori', $request->kategori);
        }

        if ($perPage === 'all') {
            $pipelines = $query->get();
        } else {
            $pipelines = $query->paginate($perPage);
        }

        // We can fetch RKA dynamically to calculate percentage on frontend, or just pass it here.
        // It's much easier to just fetch RKA on the frontend since we already have an RKA endpoint.
        
        return response()->json([
            'success' => true,
            'data' => $pipelines,
            'message' => 'Data Pipeline berhasil diambil'
        ]);
    }

    public function actionPlans(Request $request)
    {
        $query = PipelineActionPlan::query();
        if ($request->has('tahun')) $query->where('tahun', $request->tahun);
        if ($request->has('branch_name')) $query->where('branch_name', $request->branch_name);
        if ($request->has('kategori')) $query->where('kategori', $request->kategori);

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function storeActionPlan(Request $request)
    {
        $request->validate([
            'tahun' => 'required|string',
            'bulan' => 'required|string',
            'branch_name' => 'required|string',
            'kategori' => 'required|string',
            'nasabah' => 'required|string',
            'nominal' => 'required|numeric',
            'tanggal' => 'required|string',
            'week' => 'required|string',
        ]);

        $user = $request->user();

        // Enforce branch access for non-super-admin
        if ($user && $user->role !== 'super_admin') {
            if ($request->branch_name !== $user->branch_name) {
                return response()->json(['message' => 'Anda hanya dapat memasukkan strategi untuk cabang Anda sendiri'], 403);
            }
        }

        $actionPlan = PipelineActionPlan::create($request->only([
            'tahun', 'bulan', 'branch_name', 'kategori', 'nasabah', 'nominal', 'tanggal', 'week'
        ]));

        return response()->json([
            'success' => true,
            'data' => $actionPlan,
            'message' => 'Strategi berhasil ditambahkan'
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun' => 'required|string',
            'bulan' => 'required|string',
            'type' => 'required|string',
            'branch_name' => 'required|string',
            'kategori' => 'required|string',
            'w1' => 'nullable|numeric',
            'w2' => 'nullable|numeric',
            'w3' => 'nullable|numeric',
            'w4' => 'nullable|numeric',
            'gap_harian' => 'nullable|numeric',
        ]);

        $user = $request->user();

        // Enforce branch and access for non-super-admin
        if ($user && $user->role !== 'super_admin') {
            if ($request->branch_name !== $user->branch_name) {
                return response()->json(['message' => 'Anda hanya dapat mengedit cabang Anda sendiri'], 403);
            }

            // Check if they have an approved request to edit pipeline
            $approval = \App\Models\ApprovalRequest::where('user_id', $user->id)
                ->where('type', 'edit_pipeline')
                ->where('status', 'approved')
                ->first();

            if (!$approval) {
                return response()->json(['message' => 'Anda tidak memiliki akses untuk mengedit pipeline. Silakan minta akses terlebih dahulu.'], 403);
            }

            // Revoke access (single-use)
            $approval->delete(); // or change status, deleting is simplest to consume it.
        }

        $pipeline = Pipeline::updateOrCreate(
            [
                'tahun' => $request->tahun,
                'bulan' => $request->bulan,
                'branch_name' => $request->branch_name,
                'kategori' => $request->kategori,
            ],
            [
                'type' => $request->type,
                'w1' => $request->w1 ?? 0,
                'w2' => $request->w2 ?? 0,
                'w3' => $request->w3 ?? 0,
                'w4' => $request->w4 ?? 0,
                'gap_harian' => $request->gap_harian ?? 0,
                'created_by' => auth()->id() ?? 'system'
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $pipeline
        ]);
    }
}
