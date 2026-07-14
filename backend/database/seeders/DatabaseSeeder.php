<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@syncore.com',
            'password' => bcrypt('Syncore@Admin'),
            'role' => 'super_admin',
        ]);

        // Create Branch Managers (Pimpinan Cabang)
        $branches = [
            [
                'name' => 'KC Tanah Abang',
                'branch_name' => 'KC Jakarta Tanah Abang',
                'email' => 'kc.tanahabang@syncore.com',
                'password' => 'Syncore@TAbang'
            ],
            [
                'name' => 'KC Krekot',
                'branch_name' => 'KC Jakarta Krekot',
                'email' => 'kc.krekot@syncore.com',
                'password' => 'Syncore@Krekot'
            ],
            [
                'name' => 'KC Veteran',
                'branch_name' => 'KC Jakarta Veteran',
                'email' => 'kc.veteran@syncore.com',
                'password' => 'Syncore@Veteran'
            ],
            [
                'name' => 'KC Roxi',
                'branch_name' => 'KC JAKARTA ROXI',
                'email' => 'kc.roxi@syncore.com',
                'password' => 'Syncore@Roxi'
            ],
            [
                'name' => 'KC Gunung Sahari',
                'branch_name' => 'KC Jakarta Gunung Sahari',
                'email' => 'kc.gunsar@syncore.com',
                'password' => 'Syncore@Gunsar'
            ],
            [
                'name' => 'KC Kemayoran',
                'branch_name' => 'KC Kemayoran',
                'email' => 'kc.kemayoran@syncore.com',
                'password' => 'Syncore@Kemayoran'
            ],
            [
                'name' => 'KC Mangga Dua',
                'branch_name' => 'KC Jakarta Mangga Dua',
                'email' => 'kc.manggadua@syncore.com',
                'password' => 'Syncore@ManggaDua'
            ]
        ];

        foreach ($branches as $branch) {
            User::create([
                'name' => $branch['name'],
                'email' => $branch['email'],
                'password' => bcrypt($branch['password']),
                'role' => 'pimpinan_cabang',
                'branch_name' => $branch['branch_name'],
            ]);
        }
    }
}
