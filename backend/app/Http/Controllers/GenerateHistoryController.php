<?php

namespace App\Http\Controllers;

use App\Models\GenerateHistory;
use App\Models\GenerateSnapshot;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = GenerateHistory::with('user:id,name,email');

        if ($request->has('filter_type') && $request->filter_type === 'date') {
            if ($request->has('month')) {
                $query->whereMonth('generated_at', $request->month);
            }
            if ($request->has('year')) {
                $query->whereYear('generated_at', $request->year);
            }
        } else {
            // Default is 'period'
            if ($request->has('month')) {
                $query->where('period_month', $request->month);
            }
            if ($request->has('year')) {
                $query->where('period_year', $request->year);
            }
        }
        
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $query->orderBy('generated_at', 'desc');
        $histories = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $histories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file_simpanan' => 'required|file',
            'file_pinjaman' => 'required|file',
            'file_simpanan_hist' => 'nullable|file',
            'file_pinjaman_hist' => 'nullable|file',
        ]);

        $user = $request->user();

        try {
            $pythonApiUrl = 'http://127.0.0.1:8003/api/process';
            
            $http = Http::timeout(300); // 5 minutes timeout for large files
            
            // Attach files using fopen to prevent memory exhaustion and broken pipes
            $http = $http->attach('file_simpanan', fopen($request->file('file_simpanan')->getPathname(), 'r'), $request->file('file_simpanan')->getClientOriginalName());
            $http = $http->attach('file_pinjaman', fopen($request->file('file_pinjaman')->getPathname(), 'r'), $request->file('file_pinjaman')->getClientOriginalName());
            
            if ($request->hasFile('file_simpanan_hist')) {
                $http = $http->attach('file_simpanan_hist', fopen($request->file('file_simpanan_hist')->getPathname(), 'r'), $request->file('file_simpanan_hist')->getClientOriginalName());
            }
            if ($request->hasFile('file_pinjaman_hist')) {
                $http = $http->attach('file_pinjaman_hist', fopen($request->file('file_pinjaman_hist')->getPathname(), 'r'), $request->file('file_pinjaman_hist')->getClientOriginalName());
            }

            $response = $http->post($pythonApiUrl);

            if (!$response->successful()) {
                Log::error('Python API Error: ' . $response->body());
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memproses data di server analitik.',
                    'error' => $response->body()
                ], 500);
            }

            $jsonResult = $response->json();
            $dataDict = $jsonResult['data'];
            $stats = $dataDict['__stats__'];

            // Extract period from "Total AH Gunsar" keys or periodes_sorted length
            // We can parse period from periode_terbaru or just get month and year from server time if not explicit
            // Actually, periodes_sorted is not in stats, but we can extract it from keys
            // But we can just store raw data. Let's find period manually
            $periodMonth = date('m');
            $periodYear = date('Y');
            $periodName = null;
            
            // Try to extract exact period from metadata (terbaru)
            if (isset($dataDict['Total AH Gunsar']['rows'])) {
                foreach ($dataDict['Total AH Gunsar']['rows'] as $row) {
                    if (isset($row['row_type']) && $row['row_type'] === '__metadata__') {
                        if (isset($row['periode_refs']['terbaru'])) {
                            $terbaru = $row['periode_refs']['terbaru'];
                            // $terbaru is e.g. "2026-06-23T00:00:00"
                            $time = strtotime($terbaru);
                            if ($time) {
                                $periodMonth = date('m', $time);
                                $periodYear = date('Y', $time);
                                
                                $months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                                $mName = $months[(int)$periodMonth - 1];
                                $periodName = date('j', $time) . " " . $mName . " " . $periodYear;
                            }
                        }
                        break;
                    }
                }
                
                // Fallback if not found in metadata
                if (!$periodName) {
                    foreach ($dataDict['Total AH Gunsar']['rows'] as $row) {
                        if (isset($row['values']) && count($row['values']) > 0) {
                            $latestKey = array_key_last($row['values']);
                            $periodName = $latestKey;
                            $parts = explode('-', $latestKey);
                            if (count($parts) >= 2) {
                                $periodYear = '20' . end($parts);
                                if (strlen($periodYear) > 4) $periodYear = end($parts);
                                $monthStr = trim($parts[0]);
                                $months = ['Jan'=>'01', 'Feb'=>'02', 'Mar'=>'03', 'Apr'=>'04', 'Mei'=>'05', 'Jun'=>'06', 'Jul'=>'07', 'Agu'=>'08', 'Sep'=>'09', 'Okt'=>'10', 'Nov'=>'11', 'Des'=>'12'];
                                foreach($months as $name => $num) {
                                    if (stripos($monthStr, $name) !== false) {
                                        $periodMonth = $num;
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
            }

            $history = GenerateHistory::create([
                'user_id' => $user ? $user->id : 1,
                'generated_at' => now(),
                'period_month' => $periodMonth,
                'period_year' => $periodYear,
                'period_name' => $periodName,
                'ssa_simpanan_filename' => $request->file('file_simpanan')->getClientOriginalName(),
                'ssa_pinjaman_filename' => $request->file('file_pinjaman')->getClientOriginalName(),
                'ssa_simpanan_hist_filename' => $request->hasFile('file_simpanan_hist') ? $request->file('file_simpanan_hist')->getClientOriginalName() : null,
                'ssa_pinjaman_hist_filename' => $request->hasFile('file_pinjaman_hist') ? $request->file('file_pinjaman_hist')->getClientOriginalName() : null,
                'file_laba_filename' => $request->hasFile('file_laba') ? $request->file('file_laba')->getClientOriginalName() : null,
                'total_kc' => $stats['jumlah_kc'] ?? 0,
                'total_kcp' => $stats['jumlah_kcp'] ?? 0,
                'total_unit' => $stats['jumlah_unit'] ?? 0,
                'total_records' => $stats['jumlah_baris_total'] ?? 0,
                'status' => 'success',
            ]);

            // Save snapshot JSON
            GenerateSnapshot::create([
                'generate_history_id' => $history->id,
                'snapshot_type' => 'dashboard_kc', // saved as dashboard_kc to bypass Postgres ENUM constraint, actually contains all data
                'snapshot_data' => $dataDict
            ]);

            // Notify super admins
            NotificationService::sendToSuperAdmins(
                'generate_ssa_success',
                'Generate SSA Berhasil',
                "Proses generate SSA untuk periode {$periodName} telah berhasil diselesaikan.",
                'medium',
                '/riwayat-generate'
            );

            return response()->json([
                'success' => true,
                'data' => $history
            ]);

        } catch (\Exception $e) {
            Log::error('Process Error: ' . $e->getMessage());
            
            // Notify super admins of failure
            NotificationService::sendToSuperAdmins(
                'generate_ssa_failed',
                'Generate SSA Gagal',
                "Proses generate SSA mengalami kegagalan: " . $e->getMessage(),
                'high',
                '/upload-ssa'
            );

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function latest()
    {
        $history = GenerateHistory::with('user:id,name,email')
            ->orderBy('generated_at', 'desc')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    public function show($id)
    {
        $history = GenerateHistory::with('snapshots')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    public function bulkDestroy(Request $request)
    {
        try {
            $range = $request->query('range', 'all');
            
            $query = GenerateHistory::query();
            
            if ($range === '7') {
                $query->where('created_at', '>=', now()->subDays(7));
            } elseif ($range === '30') {
                $query->where('created_at', '>=', now()->subDays(30));
            } elseif ($range === '90') {
                $query->where('created_at', '>=', now()->subDays(90));
            }

            $ids = $query->pluck('id')->toArray();
            
            if (empty($ids)) {
                return response()->json(['success' => true, 'message' => 'Tidak ada data untuk dihapus.']);
            }
            
            // Delete related snapshots
            GenerateSnapshot::whereIn('generate_history_id', $ids)->delete();
            
            // Delete the histories
            GenerateHistory::whereIn('id', $ids)->delete();
            
            return response()->json([
                'success' => true,
                'message' => count($ids) . ' riwayat berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            Log::error('Bulk Destroy Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat menghapus banyak riwayat.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $history = GenerateHistory::find($id);
            if (!$history) {
                return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
            }
            
            // Delete related snapshots
            GenerateSnapshot::where('generate_history_id', $id)->delete();
            
            // Delete the history
            $history->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Riwayat berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            Log::error('Destroy Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function export(Request $request)
    {
        $request->validate([
            'generate_history_id' => 'required|exists:generate_histories,id',
            'snapshot_type' => 'required|string', 
        ]);

        $historyId = $request->generate_history_id;
        $dashboardType = $request->snapshot_type; // 'kc', 'kcp', 'unit', 'produk'

        $history = GenerateHistory::findOrFail($historyId);
        $snapshot = GenerateSnapshot::where('generate_history_id', $historyId)->first();

        if (!$snapshot) {
            return response()->json(['success' => false, 'message' => 'Snapshot data not found.'], 404);
        }

        try {
            $snapshotData = is_string($snapshot->snapshot_data) ? json_decode($snapshot->snapshot_data, true) : $snapshot->snapshot_data;
            
            // Get all RKAs for the year of the history
            // We'll pass it to python in __rka__ key
            $rkaRecords = \App\Models\Rka::where('tahun', $history->period_year)->get()->toArray();
            if (!is_array($snapshotData)) {
                $snapshotData = [];
            }
            $snapshotData['__rka__'] = $rkaRecords;

            $pythonApiUrl = "http://127.0.0.1:8003/api/export/{$dashboardType}";
            $response = Http::timeout(300)->post($pythonApiUrl, [
                'data' => $snapshotData
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal meng-generate Excel.',
                    'error' => $response->body()
                ], 500);
            }

            // Return file download
            $fileContent = $response->body();
            
            // Name format: Dashboard KC AH Gunsar 31 Juli 2026.xlsx
            $monthNames = ['01'=>'Januari', '02'=>'Februari', '03'=>'Maret', '04'=>'April', '05'=>'Mei', '06'=>'Juni', '07'=>'Juli', '08'=>'Agustus', '09'=>'September', '10'=>'Oktober', '11'=>'November', '12'=>'Desember'];
            $month = $monthNames[str_pad($history->period_month, 2, '0', STR_PAD_LEFT)] ?? $history->period_month;
            $year = $history->period_year;
            $lastDay = date('t', strtotime("$year-{$history->period_month}-01"));
            
            $prefix = '';
            if ($dashboardType === 'kc') $prefix = 'Dashboard KC';
            elseif ($dashboardType === 'kcp') $prefix = 'Dashboard KCP';
            elseif ($dashboardType === 'unit') $prefix = 'Dashboard Unit';
            elseif ($dashboardType === 'produk') $prefix = 'Monitoring Produk Dashboard';
            
            $fileName = "{$prefix} AH Gunsar {$lastDay} {$month} {$year}.xlsx";

            return response($fileContent, 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="'.$fileName.'"'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat export.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
        public function previewTabs($id, $type)
    {
        $snapshot = \App\Models\GenerateSnapshot::where('generate_history_id', $id)->first();
        if (!$snapshot) return response()->json(['success' => false, 'message' => 'Snapshot data not found.'], 404);

        $data = $snapshot->snapshot_data;
        $tabs = [];
        
        try {
            if ($type === 'dashboard_kc') {
                foreach ($data as $key => $val) {
                    if ($key !== '__uker_data__' && $key !== '__stats__') {
                        $tabs[] = $key;
                    }
                }
            } elseif ($type === 'monitoring_produk') {
                $tabs = ['Tabungan', 'Giro', 'Deposito', 'Total Casa', 'Total DPK'];
            } elseif ($type === 'dashboard_kcp') {
                $uker = $data['__uker_data__'] ?? [];
                foreach ($uker as $key => $val) {
                    if (is_array($val) && isset($val['uker_type']) && $val['uker_type'] === 'KCP') {
                        $tabs[] = $key;
                    }
                }
            } elseif ($type === 'dashboard_unit') {
                $uker = $data['__uker_data__'] ?? [];
                foreach ($uker as $key => $val) {
                    if (is_array($val) && isset($val['uker_type']) && $val['uker_type'] === 'Unit') {
                        $tabs[] = $key;
                    }
                }
            }
        } catch (\Exception $e) {}

        if ($type !== 'monitoring_produk') {
            sort($tabs);
        }
        
        // Ensure "Total AH Gunsar" is the first tab if it exists
        $total_idx = array_search("Total AH Gunsar", $tabs);
        if ($total_idx !== false) {
            unset($tabs[$total_idx]);
            array_unshift($tabs, "Total AH Gunsar");
        }

        return response()->json(['success' => true, 'tabs' => array_values($tabs)]);
    }

    public function previewData(Request $request, $id, $type)
    {
        $name = $request->query('name');
        $snapshot = \App\Models\GenerateSnapshot::where('generate_history_id', $id)->first();
        if (!$snapshot) return response()->json(['success' => false, 'message' => 'Snapshot data not found.'], 404);

        $data = $snapshot->snapshot_data;
        $result = [];
        
        try {
            if ($type === 'dashboard_kc') {
                $kc_data = $data[$name] ?? ($data['Total AH Gunsar'] ?? []);
                if (isset($kc_data['rows'])) {
                    $result = $kc_data['rows']; // Return all rows
                }
            } elseif ($type === 'monitoring_produk') {
                $config = [
                    'Tabungan' => ['label' => 'Tabungan', 'type' => 'data'],
                    'Giro' => ['label' => 'Giro', 'type' => 'data'],
                    'Deposito' => ['label' => 'Deposito', 'type' => 'data'],
                    'Total Casa' => ['label' => 'CASA', 'type' => 'bold'],
                    'Total DPK' => ['label' => 'Dana Pihak Ketiga', 'type' => 'header_value'],
                ];
                $conf = $config[$name] ?? $config['Tabungan'];
                
                $kc_names = [];
                foreach ($data as $k => $v) {
                    if ($k !== '__uker_data__' && $k !== '__stats__' && $k !== 'Total AH Gunsar') {
                        $kc_names[] = $k;
                    }
                }
                sort($kc_names);
                if (isset($data['Total AH Gunsar'])) {
                    $kc_names[] = 'Total AH Gunsar';
                }
                
                foreach ($kc_names as $kc) {
                    $rows = $data[$kc]['rows'] ?? [];
                    $target = null;
                    foreach ($rows as $r) {
                        if (isset($r['label']) && $r['label'] === $conf['label'] && isset($r['row_type']) && $r['row_type'] === $conf['type']) {
                            $target = $r;
                            break;
                        }
                    }
                    if ($target) {
                        $target['label'] = $kc === 'Total AH Gunsar' ? 'Total Area Head Gunung Sahari' : $kc;
                        $result[] = $target;
                    } else {
                        $result[] = [
                            'label' => $kc === 'Total AH Gunsar' ? 'Total Area Head Gunung Sahari' : $kc,
                            'values' => [],
                            'rka' => null,
                            'pencapaian_rka' => null,
                            'mtd' => 0,
                            'ytd' => 0,
                            'yoy' => 0,
                            'dtd' => 0
                        ];
                    }
                }
            } elseif ($type === 'dashboard_kcp' || $type === 'dashboard_unit') {
                $uker = $data['__uker_data__'] ?? [];
                if ($name && isset($uker[$name]) && isset($uker[$name]['rows'])) {
                    $result = $uker[$name]['rows']; // Return all rows
                } else {
                    // Fallback to first
                    foreach ($uker as $key => $val) {
                        $req_type = $type === 'dashboard_kcp' ? 'KCP' : 'Unit';
                        if (is_array($val) && isset($val['uker_type']) && $val['uker_type'] === $req_type && isset($val['rows'])) {
                            $result = $val['rows']; // Return all rows
                            break;
                        }
                    }
                }
            }
        } catch (\Exception $e) {}

        return response()->json(['success' => true, 'data' => $result]);
    }
}
