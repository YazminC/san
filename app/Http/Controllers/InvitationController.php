<?php

namespace App\Http\Controllers;

use App\Services\InvitationStore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function show(): Response
    {
        $cities = config('invitacion.ciudades');

        foreach ($cities as &$city) {
            $city['lugares']['otro'] = [
                'nombre' => 'Otro lugar',
                'detalle' => 'Escribe el lugar que tienes en mente.',
                'emoji' => '✨',
            ];
        }
        unset($city);

        return Inertia::render('Invitacion', [
            'cities' => $cities,
            'recipientName' => config('invitacion.destinataria'),
            'blockedDates' => config('invitacion.fechas_bloqueadas'),
        ]);
    }

    public function store(Request $request, InvitationStore $invitations): RedirectResponse
    {
        $cities = config('invitacion.ciudades');
        $cityId = $request->input('ciudad');
        $city = is_string($cityId) ? ($cities[$cityId] ?? null) : null;
        $venueIds = [...array_keys($city['lugares'] ?? []), 'otro'];

        $validated = $request->validate([
            'fecha' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:tomorrow',
                Rule::notIn(config('invitacion.fechas_bloqueadas')),
            ],
            'ciudad' => ['required', 'string', Rule::in(array_keys($cities))],
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

        $city = $cities[$validated['ciudad']];
        $venueName = $validated['lugar'] === 'otro'
            ? $validated['lugar_personalizado']
            : ($city['lugares'][$validated['lugar']]['nombre'] ?? null);

        if ($venueName === null) {
            abort(422, 'El lugar seleccionado ya no está disponible.');
        }

        $invitationId = $invitations->store([
            'fecha' => $validated['fecha'],
            'ciudad' => $validated['ciudad'],
            'lugar' => $validated['lugar'],
            'ciudad_nombre' => $city['nombre'],
            'lugar_nombre' => $venueName,
            'lugar_personalizado' => $validated['lugar_personalizado'] ?? null,
        ]);

        return redirect()->route('invitacion.gracias', $invitationId);
    }

    public function thanks(string $invitation, InvitationStore $invitations): Response
    {
        $savedInvitation = $invitations->find($invitation);
        $venueName = $savedInvitation['lugar_personalizado']
            ?: $savedInvitation['lugar_nombre'];
        $cityName = $savedInvitation['ciudad_nombre'];
        $recipientName = config('invitacion.destinataria');
        $formattedDate = Carbon::parse($savedInvitation['fecha'])
            ->locale('es')
            ->isoFormat('dddd D [de] MMMM [de] YYYY');
        $shareText = implode("\n", [
            "¡Hola! {$recipientName} eligió una cita:",
            "Fecha: {$formattedDate}",
            "Ciudad: {$cityName}",
            "Lugar: {$venueName}",
        ]);

        return Inertia::render('Gracias', [
            'invitation' => [
                'fecha' => $formattedDate,
                'ciudad' => $cityName,
                'lugar' => $venueName,
            ],
            'recipientName' => $recipientName,
            'shareText' => $shareText,
        ]);
    }
}
