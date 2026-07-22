<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$rka = \App\Models\Rka::first();
if ($rka) {
    print_r($rka->toArray());
} else {
    echo "NO RKA";
}
