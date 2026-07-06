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
            'password' => bcrypt('password'),
            'role' => 'super_admin',
        ]);

        // Create Branch Managers (Pimpinan Cabang)
        $branches = [
            'KC Jakarta Tanah Abang',
            'KC Krekot',
            'KC Jakarta Veteran',
            'KC Roxi',
            'KC Jakarta Gunung Sahari',
            'KC Jakarta Mangga Dua',
            'KC Jakarta Kemayoran'
        ];

        foreach ($branches as $branch) {
            // Generate email from branch name (e.g., KC Jakarta Tanah Abang -> kc.jakarta.tanah.abang@syncore.com)
            $emailPrefix = strtolower(str_replace(' ', '.', $branch));
            
            User::create([
                'name' => 'Pinca ' . $branch,
                'email' => $emailPrefix . '@syncore.com',
                'password' => bcrypt('password'),
                'role' => 'pimpinan_cabang',
                'branch_name' => $branch,
            ]);
        }
    }
}
