<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$snapshot = \Illuminate\Support\Facades\DB::table('generate_snapshots')->orderBy('id', 'desc')->first();
$data = json_decode($snapshot->snapshot_data, true);

// Show ALL Pinjaman rows for TANAH ABANG section
$rows = $data['Tanah Abang']['rows'] ?? [];
$in_pinjaman = false;
echo "=== Tanah Abang Pinjaman Section (full per-period values) ===\n";
$target_periods = ['Jun-25', 'Jul-25', 'Agu-25', 'Sep-25', 'Okt-25', 'Nov-25', 'Des-25', 'Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'Mei-26', 'Jun-26'];
foreach($rows as $idx => $r) {
    $lbl = $r['label'] ?? '';
    $rt  = $r['row_type'] ?? '';
    if ($lbl === 'Pinjaman' && $rt === 'header_value') $in_pinjaman = true;
    if ($rt === 'separator' && $in_pinjaman) { break; }
    if ($in_pinjaman) {
        echo "\n[$lbl]:\n";
        $vals = $r['values'] ?? [];
        foreach($target_periods as $p) {
            $v = $vals[$p] ?? 'MISSING';
            echo "  $p => $v\n";
        }
    }
}

echo "\n\n=== EXCEL shows for Mei-26 column (from screenshot) ===\n";
echo "Pinjaman Mei-26 (Excel): 938,027  (screenshot row S column May-26)\n";
echo "Pinjaman Mei-26 (snapshot): " . ($data['Tanah Abang']['rows'][9]['values']['Mei-26'] ?? 'N/A') . "\n";
echo "Mikro Mei-26 (snapshot): " . ($data['Tanah Abang']['rows'][10]['values']['Mei-26'] ?? 'N/A') . "\n";
echo "Small Mei-26 (snapshot): " . ($data['Tanah Abang']['rows'][11]['values']['Mei-26'] ?? 'N/A') . "\n";
echo "KPR Mei-26 (snapshot): " . ($data['Tanah Abang']['rows'][12]['values']['Mei-26'] ?? 'N/A') . "\n";
echo "Briguna Mei-26 (snapshot): " . ($data['Tanah Abang']['rows'][13]['values']['Mei-26'] ?? 'N/A') . "\n";
echo "\nNOTE: If Excel shows 938,027 but snapshot shows 1,235,004 for Pinjaman Mei-26,\n";
echo "then the data shown in Excel differs from the snapshot => the displayed Excel was from a DIFFERENT generate.\n";
