<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class InvitationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_the_invitation_page_shows_the_configured_cities_and_their_places(): void
    {
        $this->get(route('invitacion'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Invitacion')
                ->where('recipientName', 'Sandy')
                ->where('blockedDates', ['2026-12-17', '2026-12-18'])
                ->where('cities.cdmx.nombre', 'Ciudad de México')
                ->where('cities.cdmx.lugares.otro.nombre', 'Otro lugar')
                ->where('cities.toluca.lugares.cosmovitral.nombre', 'Paseo por el Cosmovitral')
            );
    }

    public function test_a_valid_invitation_is_saved_as_a_private_file_and_shown_on_the_thank_you_page(): void
    {
        Storage::fake('local');
        $this->travelTo('2026-11-08 12:00:00');

        $response = $this->post(route('invitacion.store'), [
            'fecha' => '2026-11-09',
            'ciudad' => 'toluca',
            'lugar' => 'cosmovitral',
            'lugar_personalizado' => 'Lugar que no se eligió',
        ]);

        $response->assertRedirect();
        $invitationId = basename(parse_url($response->headers->get('Location'), PHP_URL_PATH));
        $this->assertTrue(Str::isUuid($invitationId));
        $this->assertSame(
            [
                'fecha' => '2026-11-09',
                'ciudad' => 'toluca',
                'lugar' => 'cosmovitral',
                'ciudad_nombre' => 'Toluca',
                'lugar_nombre' => 'Paseo por el Cosmovitral',
                'lugar_personalizado' => null,
            ],
            json_decode(Storage::disk('local')->get("invitations/{$invitationId}.json"), true),
        );

        $this->get(route('invitacion.gracias', $invitationId))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Gracias')
                ->where('recipientName', 'Sandy')
                ->where('invitation.ciudad', 'Toluca')
                ->where('invitation.lugar', 'Paseo por el Cosmovitral')
                ->where('shareText', fn (string $text) => str_contains($text, 'Ciudad: Toluca')
                    && str_contains($text, 'Lugar: Paseo por el Cosmovitral'))
            );
    }

    public function test_a_custom_place_is_saved_and_included_in_the_share_message(): void
    {
        Storage::fake('local');
        $this->travelTo('2026-11-08 12:00:00');

        $response = $this->post(route('invitacion.store'), [
            'fecha' => now()->addDay()->toDateString(),
            'ciudad' => 'cdmx',
            'lugar' => 'otro',
            'lugar_personalizado' => 'Museo de Arte',
        ]);

        $response->assertRedirect();
        $invitationId = basename(parse_url($response->headers->get('Location'), PHP_URL_PATH));
        $this->assertSame(
            'Museo de Arte',
            json_decode(Storage::disk('local')->get("invitations/{$invitationId}.json"), true)['lugar_personalizado'],
        );

        $this->get(route('invitacion.gracias', $invitationId))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Gracias')
                ->where('invitation.lugar', 'Museo de Arte')
                ->where(
                    'shareText',
                    "¡Hola! Sandy eligió una cita:\n"
                    ."Fecha: lunes 9 de noviembre de 2026\n"
                    ."Ciudad: Ciudad de México\n"
                    .'Lugar: Museo de Arte',
                )
            );
    }

    public function test_another_place_requires_a_name_and_does_not_write_a_file(): void
    {
        Storage::fake('local');

        $this->from(route('invitacion'))
            ->post(route('invitacion.store'), [
                'fecha' => now()->addDay()->toDateString(),
                'ciudad' => 'cdmx',
                'lugar' => 'otro',
            ])
            ->assertSessionHasErrors([
                'lugar_personalizado' => 'Escribe el nombre del lugar que tienes en mente.',
            ]);

        $this->assertSame([], Storage::disk('local')->allFiles('invitations'));
    }

    public function test_another_place_name_cannot_exceed_120_characters(): void
    {
        Storage::fake('local');

        $this->from(route('invitacion'))
            ->post(route('invitacion.store'), [
                'fecha' => now()->addDay()->toDateString(),
                'ciudad' => 'cdmx',
                'lugar' => 'otro',
                'lugar_personalizado' => str_repeat('a', 121),
            ])
            ->assertSessionHasErrors([
                'lugar_personalizado' => 'El nombre del lugar no puede superar los 120 caracteres.',
            ]);

        $this->assertSame([], Storage::disk('local')->allFiles('invitations'));
    }

    public function test_an_invitation_cannot_use_an_invalid_city_or_a_venue_from_another_city(): void
    {
        Storage::fake('local');

        $this->from(route('invitacion'))
            ->post(route('invitacion.store'), [
                'fecha' => now()->addDay()->toDateString(),
                'ciudad' => 'puebla',
                'lugar' => 'chapultepec',
            ])
            ->assertSessionHasErrors(['ciudad', 'lugar']);

        $this->assertSame([], Storage::disk('local')->allFiles('invitations'));
    }

    public function test_an_invitation_cannot_be_set_for_a_past_date(): void
    {
        Storage::fake('local');
        $this->travelTo('2026-11-08 12:00:00');

        $this->from(route('invitacion'))
            ->post(route('invitacion.store'), [
                'fecha' => '2026-11-07',
                'ciudad' => 'cdmx',
                'lugar' => 'coyoacan',
            ])
            ->assertSessionHasErrors('fecha');

        $this->assertSame([], Storage::disk('local')->allFiles('invitations'));
    }

    #[DataProvider('unavailableDates')]
    public function test_an_invitation_is_rejected_on_unavailable_dates(string $date): void
    {
        Storage::fake('local');
        $this->travelTo('2026-12-01 12:00:00');

        $this->from(route('invitacion'))
            ->post(route('invitacion.store'), [
                'fecha' => $date,
                'ciudad' => 'cdmx',
                'lugar' => 'coyoacan',
            ])
            ->assertSessionHasErrors([
                'fecha' => 'La fecha seleccionada no está disponible. Elige otra fecha.',
            ]);

        $this->assertSame([], Storage::disk('local')->allFiles('invitations'));
    }

    public function test_the_thank_you_page_returns_not_found_for_a_valid_but_missing_invitation_id(): void
    {
        Storage::fake('local');

        $this->get(route('invitacion.gracias', 'b2dbd61f-58c8-4ded-98b2-b9b13f93f35d'))
            ->assertNotFound();
    }

    public function test_the_thank_you_route_rejects_an_invalid_invitation_id(): void
    {
        $this->get('/gracias/not-a-uuid')->assertNotFound();
    }

    public function test_the_retired_location_admin_page_is_not_available(): void
    {
        $this->get('/admin/lugares')->assertNotFound();
    }

    public static function unavailableDates(): array
    {
        return [
            '17 de diciembre' => ['2026-12-17'],
            '18 de diciembre' => ['2026-12-18'],
        ];
    }
}
