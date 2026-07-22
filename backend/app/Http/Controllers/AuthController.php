<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Services\ActivityLogger;

class AuthController extends Controller
{
    /**
     * Handle user login and generate token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email atau Password salah.'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        
        // Remove previous tokens (optional, for single-device login)
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        ActivityLogger::log('Autentikasi', 'LOGIN', 'Berhasil login ke dalam sistem', $user->id);

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'branch_name' => $user->branch_name,
            ]
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Logout and revoke token.
     */
    public function logout(Request $request)
    {
        ActivityLogger::log('Autentikasi', 'LOGOUT', 'Berhasil logout dari sistem');

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }
        $user->save();

        ActivityLogger::log('Autentikasi', 'UPDATE_PROFILE', 'Memperbarui data profil');

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'branch_name' => $user->branch_name,
            ]
        ]);
    }
}
