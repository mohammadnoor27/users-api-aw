<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'name' => 'Fake User',
            'email' => 'fake@example.com',
            'phone' => '0798080145',
            'date_of_birth' => Carbon::createFromDate(1999, 7, 27),
        ]);
    }
}
