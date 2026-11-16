<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class InvitationStore
{
    /**
     * @param array{
     *     fecha: string,
     *     ciudad: string,
     *     lugar: string,
     *     ciudad_nombre: string,
     *     lugar_nombre: string,
     *     lugar_personalizado: ?string
     * } $invitation
     */
    public function store(array $invitation): string
    {
        $id = (string) Str::uuid();
        $contents = json_encode($invitation, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

        if (! Storage::disk('local')->put("invitations/{$id}.json", $contents)) {
            throw new RuntimeException('No se pudo guardar la invitación en el almacenamiento local.');
        }

        return $id;
    }

    /**
     * @return array{
     *     fecha: string,
     *     ciudad: string,
     *     lugar: string,
     *     ciudad_nombre: string,
     *     lugar_nombre: string,
     *     lugar_personalizado: ?string
     * }
     */
    public function find(string $id): array
    {
        abort_unless(Str::isUuid($id), 404);

        $path = "invitations/{$id}.json";
        $disk = Storage::disk('local');

        abort_unless($disk->exists($path), 404);

        $invitation = json_decode($disk->get($path), true, flags: JSON_THROW_ON_ERROR);

        if (! is_array($invitation)) {
            throw new RuntimeException('El archivo de la invitación tiene un formato no válido.');
        }

        return $invitation;
    }
}
