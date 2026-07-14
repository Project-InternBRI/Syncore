<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$rkas = \App\Models\Rka::select('branch_name', 'branch_type')->distinct()->limit(20)->get();
print_r($rkas->toArray());
