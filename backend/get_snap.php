<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$snap = \App\Models\GenerateSnapshot::orderBy('id', 'desc')->first();
$data = $snap->snapshot_data;
$ta = $data['Tanah Abang']['rows'];
foreach ($ta as $r) {
    if (isset($r['label']) && strpos($r['label'], '%') !== false) {
        print_r($r);
    }
}
