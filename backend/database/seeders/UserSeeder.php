<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Test User',  'email' => 'test@gmail.com', 'password' => bcrypt('123456')],
            ['name' => 'Admin',      'email' => 'a@gmail.com',    'password' => bcrypt('a')],
        ];

        foreach ($users as $user) {
            \App\Models\User::updateOrCreate(['email' => $user['email']], $user);
        }
    }
}
