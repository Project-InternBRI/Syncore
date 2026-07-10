<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RkaController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $query = \App\Models\Rka::query()->orderBy('created_at', 'desc');
        
        if ($request->has('tahun') && $request->tahun != 'all') {
            $query->where('tahun', $request->tahun);
        }
        if ($request->has('branch_name') && $request->branch_name != 'all') {
            $query->where('branch_name', $request->branch_name);
        }
        
        if ($request->has('type') && $request->type != 'all') {
            $query->where('type', $request->type);
        }
        if ($perPage === 'all') {
            $rkas = $query->get();
        } else {
            $rkas = $query->paginate($perPage);
        }

        return response()->json([
            'success' => true,
            'data' => $rkas,
            'message' => 'Data RKA berhasil diambil'
        ]);
    }

    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'tahun' => 'required|string',
            'type' => 'required|string|in:KC,KCP,Unit',
            'branch_name' => 'required|string',
            'data' => 'required|array',
            'data.*.kategori' => 'required|string',
            'data.*.bulan' => 'required|string',
            'data.*.target_nominal' => 'required|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $savedData = [];

        foreach ($request->data as $item) {
            // Only save if nominal is provided and > 0, or just save all if provided
            if (isset($item['target_nominal']) && $item['target_nominal'] !== '') {
                $savedData[] = \App\Models\Rka::updateOrCreate(
                    [
                        'tahun' => $request->tahun,
                        'bulan' => $item['bulan'],
                        'branch_name' => $request->branch_name,
                        'kategori' => $item['kategori'],
                    ],
                    [
                        'type' => $request->type,
                        'target_nominal' => $item['target_nominal'],
                        'deskripsi' => $item['deskripsi'] ?? null,
                        'created_by' => 'Super Admin'
                    ]
                );
            } else {
                // If they cleared it out, we should delete the existing record if it exists
                \App\Models\Rka::where([
                    'tahun' => $request->tahun,
                    'bulan' => $item['bulan'],
                    'branch_name' => $request->branch_name,
                    'kategori' => $item['kategori'],
                ])->delete();
            }
        }

        return response()->json([
            'success' => true,
            'data' => $savedData,
            'message' => count($savedData) . ' RKA berhasil ditambahkan'
        ], 201);
    }

    public function destroy($id)
    {
        $rka = \App\Models\Rka::find($id);
        
        if (!$rka) {
            return response()->json([
                'success' => false,
                'message' => 'RKA tidak ditemukan'
            ], 404);
        }

        $rka->delete();

        return response()->json([
            'success' => true,
            'message' => 'RKA berhasil dihapus'
        ]);
    }
}
