import { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Card,
    Container,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import LocationOnRounded from '@mui/icons-material/LocationOnRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import type { ReactNode } from 'react';

type Props = {
    recipientName: string;
    shareText: string;
    shareUrl?: string;
    staticMode?: boolean;
    invitation: {
        fecha: string;
        ciudad: string;
        lugar: string;
    };
};

export default function Gracias({
    invitation,
    recipientName,
    shareText,
    shareUrl,
    staticMode = false,
}: Props) {
    const [shareStatus, setShareStatus] = useState('');
    const [shareError, setShareError] = useState('');
    const [showManualCopy, setShowManualCopy] = useState(false);

    const shareInvitation = async () => {
        setShareStatus('');
        setShareError('');
        setShowManualCopy(false);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Una cita contigo',
                    text: shareText,
                    url: shareUrl,
                });
                setShareStatus('Invitación compartida. ¡Gracias por elegir dónde enviarla!');
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                setShareError('No se pudo abrir el menú para compartir. Intenta copiar el mensaje.');
                setShowManualCopy(true);
            }

            return;
        }

        try {
            await navigator.clipboard.writeText(shareText);
            setShareStatus('Copié los detalles. Abre Instagram, WhatsApp u otra app y pégalos en el chat.');
        } catch {
            setShareError('No se pudo copiar automáticamente. Selecciona y copia el mensaje de abajo.');
            setShowManualCopy(true);
        }
    };

    return (
        <>
            {!staticMode && <Head title="¡Una nueva cita nos espera!" />}

            <Box className="invitation-page">
                <Container maxWidth="sm" className="page-shell">
                    <Card className="invitation-card magic-frame thank-you-card" elevation={0}>
                        <Stack className="card-content step-content" spacing={2.5} sx={{ alignItems: 'center' }}>
                            <Box className="arcane-seal success-seal" aria-hidden="true">
                                <span>✧</span>
                                <AutoAwesomeRounded />
                                <i>✦</i>
                            </Box>
                            <AutoAwesomeRounded className="success-sparkle" />
                            <Typography component="h1" variant="h2" align="center">
                                ¡Una nueva cita nos espera!
                            </Typography>
                            <Typography className="intro-copy" align="center">
                                Gracias por aceptar, {recipientName}. Contaré los días para verte.
                            </Typography>

                            <Box className="date-summary">
                                <SummaryRow
                                    icon={<CalendarMonthRounded />}
                                    label="Nuestro día"
                                    value={invitation.fecha}
                                />
                                <SummaryRow
                                    icon={<LocationOnRounded />}
                                    label={invitation.ciudad}
                                    value={invitation.lugar}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                startIcon={<ShareRounded />}
                                onClick={shareInvitation}
                                className="primary-action share-action"
                            >
                                Compartir invitación
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackRounded />}
                                onClick={() => {
                                    const baseUrl = import.meta.env.BASE_URL;
                                    window.location.assign(staticMode ? `${baseUrl}` : '/');
                                }}
                                className="print-action return-action"
                            >
                                Regresar al inicio
                            </Button>
                            {shareStatus && (
                                <Alert severity="success" role="status">{shareStatus}</Alert>
                            )}
                            {shareError && (
                                <Alert severity="error" role="alert">{shareError}</Alert>
                            )}
                            {showManualCopy && (
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    label="Mensaje para compartir"
                                    value={shareText}
                                    slotProps={{ htmlInput: { readOnly: true } }}
                                    onFocus={(event) => event.target.select()}
                                />
                            )}
                        </Stack>
                    </Card>

                    <Stack className="page-footer" direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <AutoAwesomeRounded fontSize="inherit" />
                        <Typography variant="caption">Un recuerdo para nuestra historia</Typography>
                    </Stack>
                </Container>
            </Box>
        </>
    );
}

function SummaryRow({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box className="summary-icon">{icon}</Box>
            <Box>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="subtitle1" className="summary-value">{value}</Typography>
            </Box>
        </Stack>
    );
}
