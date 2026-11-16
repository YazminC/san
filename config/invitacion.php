<?php

$invitationData = json_decode(
    file_get_contents(resource_path('data/invitacion.json')),
    true,
    flags: JSON_THROW_ON_ERROR,
);

return [
    'destinataria' => trim((string) env('INVITATION_NAME', 'Sandy')) ?: 'Sandy',
    'fechas_bloqueadas' => $invitationData['fechas_bloqueadas'],
    'ciudades' => $invitationData['ciudades'],
];
