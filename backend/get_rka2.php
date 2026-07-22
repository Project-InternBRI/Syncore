<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$rkas = \App\Models\Rka::where('branch_name', 'KC Jakarta Tanah Abang')->where('kategori', 'like', '%SML%')->get();
foreach ($rkas as $rka) {
    if (strpos($rka->kategori, '%') !== false) {
        print_r($rka->toArray());
    }
}
