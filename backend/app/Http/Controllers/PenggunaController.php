<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class PenggunaController extends Controller
{
    public function index()
    {
        $users = User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'branch' => $user->branch_name ?? 'Kantor Pusat', // Menyesuaikan nama key dengan frontend
                'status' => 'aktif' // Default karena kolom status mungkin belum ada
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
}
