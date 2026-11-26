import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import invitationData from '../data/invitacion.json';
import Gracias from './pages/Gracias';
import Invitacion from './pages/Invitacion';
import BackgroundMusic from './components/BackgroundMusic';
import { theme } from './theme';
import '../css/app.css';

type Venue = {
    nombre: string;
    detalle: string;
    emoji: string;
    ubicacion?: string;
};

type City = {
    nombre: string;
    corto: string;
    detalle: string;
    emoji: string;
    lugares: Record<string, Venue>;
};

const recipientName = import.meta.env.VITE_INVITATION_NAME?.trim() || 'Sandy';
const cities: Record<string, City> = Object.fromEntries(
    Object.entries(invitationData.ciudades).map(([id, city]) => [
        id,
        {
            ...city,
            lugares: {
                ...city.lugares,
                otro: {
                    nombre: 'Otro lugar',
                    detalle: 'Escribe el lugar que tienes en mente.',
                    emoji: '✨',
                },
            },
        },
    ]),
);

function StaticApp() {
    const params = new URLSearchParams(window.location.search);
    const date = params.get('fecha') ?? '';
    const cityId = params.get('ciudad') ?? '';
    const venueId = params.get('lugar') ?? '';
    const customVenue = params.get('lugar_personalizado')?.trim() ?? '';
    const city = cities[cityId];
    const venue = city?.lugares[venueId];
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    const validCustomVenue = venueId !== 'otro' || (customVenue.length > 0 && customVenue.length <= 120);
    const hasInvitation = Boolean(
        validDate
        && city
        && venue
        && validCustomVenue
        && !invitationData.fechas_bloqueadas.includes(date),
    );
    const shareUrl = window.location.href;
    const formattedDate = validDate
        ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(new Date(`${date}T12:00:00`))
        : '';
    const invitation = hasInvitation
        ? {
            fecha: formattedDate,
            ciudad: city.nombre,
            lugar: venueId === 'otro' ? customVenue : venue.nombre,
        }
        : null;
    const shareText = invitation
        ? [
            `¡Hola! ${recipientName} eligió una cita:`,
            `Fecha: ${invitation.fecha}`,
            `Ciudad: ${invitation.ciudad}`,
            `Lugar: ${invitation.lugar}`,
            `Mira la invitación: ${shareUrl}`,
        ].join('\n')
        : '';

    useEffect(() => {
        document.title = hasInvitation
            ? '¡Una nueva cita nos espera! · Una cita contigo'
            : 'Una cita para dos · Una cita contigo';
    }, [hasInvitation]);

    return hasInvitation && invitation ? (
        <Gracias
            invitation={invitation}
            recipientName={recipientName}
            shareText={shareText}
            shareUrl={shareUrl}
            staticMode
        />
    ) : (
        <Invitacion
            cities={cities}
            recipientName={recipientName}
            blockedDates={invitationData.fechas_bloqueadas}
            staticMode
        />
    );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('No se encontró el elemento raíz de la aplicación.');
}

createRoot(rootElement).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <StaticApp />
            <BackgroundMusic />
        </ThemeProvider>
    </StrictMode>,
);
