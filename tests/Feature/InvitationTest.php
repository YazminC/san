<?php

namespace Tests\Feature;

use App\Models\Invitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class InvitationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_the_invitation_page_offers_three_plans_and_a_custom_place_in_each_city(): void
    {
        $this->get(route('invitacion'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Invitacion')
                ->where('recipientName', 'Sandy')
                ->where('blockedDates', ['2026-12-17', '2026-12-18'])
                ->has('cities.cdmx.lugares', 4)
                ->has('cities.toluca.lugares', 4)
            );
    }

    public function test_a_valid_invitation_is_saved_and_shown_on_the_thank_you_page(): void
    {
        $date = now()->addDay()->toDateString();

        $response = $this->post(route('invitacion.store'), [
            'fecha' => $date,
            'ciudad' => 'toluca',
            'lugar' => 'cosmovitral',
            'lugar_personalizado' => 'Lugar que no se eligió',
        ]);

        $invitation = Invitation::firstOrFail();

        $response->assertRedirect(route('invitacion.gracias', $invitation));
        $this->assertDatabaseHas('invitations', [
            'id' => $invitation->id,
            'ciudad' => 'toluca',
            'lugar' => 'cosmovitral',
            'lugar_personalizado' => null,
        ]);
        $this->assertSame($date, $invitation->fecha->toDateString());

        $this->get(route('invitacion.gracias', $invitation))
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
        $this->travelTo('2026-11-08 12:00:00');

        $date = now()->addDay()->toDateString();

        $response = $this->post(route('invitacion.store'), [
            'fecha' => $date,
            'ciudad' => 'cdmx',
            'lugar' => 'otro',
            'lugar_personalizado' => 'Museo de Arte',
        ]);

        $invitation = Invitation::firstOrFail();

        $response->assertRedirect(route('invitacion.gracias', $invitation));
        $this->assertDatabaseHas('invitations', [
            'id' => $invitation->id,
            'lugar' => 'otro',
            'lugar_personalizado' => 'Museo de Arte',
        ]);

        $this->get(route('invitacion.gracias', $invitation))
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

    public function test_another_place_requires_a_name(): void
    {
        $this->from(route('invitacion'))
            ->post(route('invitacion.store'), [
                'fecha' => now()->addDay()->toDateString(),
                'ciudad' => 'cdmx',
                'lugar' => 'otro',
            ])
            ->assertSessionHasErrors([
                'lugar_personalizado' => 'Escribe el nombre del lugar que tienes en mente.',
            ]);

        $this->assertDatabaseCount('invitations', 0);
    }

    public function test_another_place_name_cannot_exceed_120_characters(): void
    {
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

        $this->assertDatabaseCount('invitations', 0);
    }

    public function test_an_invitation_cannot_use_an_invalid_city_or_a_venue_from_another_city(): void
    {
        $this->from(route('invitacion'))
            ->post(route('invitacion.store'), [
                'fecha' => now()->addDay()->toDateString(),
                'ciudad' => 'puebla',
                'lugar' => 'chapultepec',
            ])
            ->assertSessionHasErrors(['ciudad', 'lugar']);

        $this->assertDatabaseCount('invitations', 0);
    }

    public function test_an_invitation_cannot_be_set_for_a_past_date(): void
    {
        $this->from(route('invitacion'))
            ->post(route('invitacion.store'), [
                'fecha' => now()->subDay()->toDateString(),
                'ciudad' => 'cdmx',
                'lugar' => 'coyoacan',
            ])
            ->assertSessionHasErrors('fecha');

        $this->assertDatabaseCount('invitations', 0);
    }

    #[DataProvider('unavailableDates')]
    public function test_an_invitation_is_rejected_on_unavailable_dates(string $date): void
    {
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

        $this->assertDatabaseCount('invitations', 0);
    }

    public static function unavailableDates(): array
    {
        return [
            '17 de diciembre' => ['2026-12-17'],
            '18 de diciembre' => ['2026-12-18'],
        ];
    }
}
