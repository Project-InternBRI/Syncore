<?php
require __DIR__.'/backend/vendor/autoload.php';
$app = require_once __DIR__.'/backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$snapshot = App\Models\GenerateSnapshot::latest()->first();
$data = $snapshot->snapshot_data;
file_put_contents('/tmp/snapshot.json', json_encode($data));
