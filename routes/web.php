<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [UserController::class, 'user_dashboard'])->name('user.dashboard');
Route::get('get-user/{id}', [UserController::class, 'get_user'])->name('edit.user');
Route::get('del-user/{id}', [UserController::class, 'del_user'])->name('del.user');
Route::post('new-user', [UserController::class, 'new_user'])->name('new.user');
