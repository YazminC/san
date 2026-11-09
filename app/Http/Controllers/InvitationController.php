<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Invitacion', [
            'cities' => config('invitacion.ciudades'),
            'recipientName' => config('invitacion.destinataria'),
            'blockedDates' => config('invitacion.fechas_bloqueadas'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $cities = config('invitacion.ciudades');
        $city = $request->input('ciudad');
        $venueIds = is_string($city)
            ? array_keys($cities[$city]['lugares'] ?? [])
            : [];

        $validated = $request->validate([
            'fecha' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:tomorrow',
                Rule::notIn(config('invitacion.fechas_bloqueadas')),
            ],
            'ciudad' => ['required', Rule::in(array_keys($cities))],
            'lugar' => ['required', 'string', Rule::in($venueIds)],
            'lugar_personalizado' => [
                Rule::excludeIf($request->input('lugar') !== 'otro'),
                Rule::requiredIf($request->input('lugar') === 'otro'),
                'nullable',
                'string',
                'max:120',
            ],
        ], [
            'fecha.not_in' => 'La fecha seleccionada no está disponible. Elige otra fecha.',
            'lugar_personalizado.required' => 'Escribe el nombre del lugar que tienes en mente.',
            'lugar_personalizado.max' => 'El nombre del lugar no puede superar los 120 caracteres.',
        ]);

        $invitation = Invitation::create([
            'fecha' => $validated['fecha'],
            'ciudad' => $validated['ciudad'],
            'lugar' => $validated['lugar'],
            'lugar_personalizado' => $validated['lugar_personalizado'] ?? null,
        ]);

        return redirect()->route('invitacion.gracias', $invitation);
    }

    public function thanks(Invitation $invitation): Response
    {
        $city = config("invitacion.ciudades.{$invitation->ciudad}");
        $venueName = $invitation->lugar_personalizado
            ?: ($city['lugares'][$invitation->lugar]['nombre'] ?? $invitation->lugar);
        $recipientName = config('invitacion.destinataria');
        $formattedDate = $invitation->fecha->locale('es')->isoFormat('dddd D [de] MMMM [de] YYYY');
        $shareText = implode("\n", [
            "¡Hola! {$recipientName} eligió una cita:",
            "Fecha: {$formattedDate}",
            "Ciudad: {$city['nombre']}",
            "Lugar: {$venueName}",
        ]);

        return Inertia::render('Gracias', [
            'invitation' => [
                'fecha' => $formattedDate,
                'ciudad' => $city['nombre'],
                'lugar' => $venueName,
            ],
            'recipientName' => $recipientName,
            'shareText' => $shareText,
        ]);
    }
}
