<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GenerateHistoryController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Riwayat Generate SSA Routes
    Route::get('/riwayat-generate', [GenerateHistoryController::class, 'index']);
    Route::post('/riwayat-generate', [GenerateHistoryController::class, 'store']); // For simulation
    Route::get('/riwayat-generate/latest', [GenerateHistoryController::class, 'latest']);
    Route::get('/riwayat-generate/{id}/preview-tabs/{type}', [GenerateHistoryController::class, 'previewTabs']);
    Route::get('/riwayat-generate/{id}/preview-data/{type}', [GenerateHistoryController::class, 'previewData']);
    Route::post('/riwayat-generate/export', [GenerateHistoryController::class, 'export']);
    Route::delete('/riwayat-generate/bulk', [GenerateHistoryController::class, 'bulkDestroy']);
    Route::delete('/riwayat-generate/{id}', [GenerateHistoryController::class, 'destroy']);
    
    // RKA Routes
    Route::get('/rka', [\App\Http\Controllers\RkaController::class, 'index']);
    Route::post('/rka', [\App\Http\Controllers\RkaController::class, 'store']);
    Route::delete('/rka/{id}', [\App\Http\Controllers\RkaController::class, 'destroy']);

    // Pipeline (Komitmen) Routes
    Route::get('/pipeline', [\App\Http\Controllers\PipelineController::class, 'index']);
    Route::post('/pipeline', [\App\Http\Controllers\PipelineController::class, 'store']);
    Route::get('/pipeline/action-plans', [\App\Http\Controllers\PipelineController::class, 'actionPlans']);
    Route::post('/pipeline/action-plans', [\App\Http\Controllers\PipelineController::class, 'storeActionPlan']);

    // Notifications Routes
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy']);

    // Approval Request Routes
    Route::get('/approval-requests', [\App\Http\Controllers\ApprovalRequestController::class, 'index']);
    Route::get('/approval-requests/check-access', [\App\Http\Controllers\ApprovalRequestController::class, 'checkAccess']);
    Route::post('/approval-requests', [\App\Http\Controllers\ApprovalRequestController::class, 'store']);
    Route::post('/approval-requests/{id}/approve', [\App\Http\Controllers\ApprovalRequestController::class, 'approve']);
    Route::post('/approval-requests/{id}/reject', [\App\Http\Controllers\ApprovalRequestController::class, 'reject']);
});
