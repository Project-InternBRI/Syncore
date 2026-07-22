<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$rkas = \App\Models\Rka::where('branch_name', 'KC Jakarta Tanah Abang')->where('bulan', 'Juli')->get();
foreach ($rkas as $rka) {
    echo $rka->kategori . ": " . $rka->target_nominal . "\n";
}
