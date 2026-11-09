<?php

use App\Http\Controllers\InvitationController;
use Illuminate\Support\Facades\Route;

Route::get('/', [InvitationController::class, 'show'])->name('invitacion');
Route::post('/invitacion', [InvitationController::class, 'store'])->name('invitacion.store');
Route::get('/gracias/{invitation}', [InvitationController::class, 'thanks'])->name('invitacion.gracias');
