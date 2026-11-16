import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    Chip,
    Container,
    LinearProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import LocationOnRounded from '@mui/icons-material/LocationOnRounded';
import type { ReactNode } from 'react';

type Venue = {
    nombre: string;
    detalle: string;
    emoji: string;
};

type City = {
    nombre: string;
    corto: string;
    detalle: string;
    emoji: string;
    lugares: Record<string, Venue>;
};

type Props = {
    cities: Record<string, City>;
    recipientName: string;
    blockedDates: string[];
    staticMode?: boolean;
};

const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatSpanishDate = (date: string) =>
    new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(new Date(`${date}T12:00:00`));

export default function Invitacion({
    cities,
    recipientName,
    blockedDates,
    staticMode = false,
}: Props) {
    const [step, setStep] = useState(0);
    const [dateNotice, setDateNotice] = useState('');
    const form = useForm({
        fecha: '',
        ciudad: '',
        lugar: '',
        lugar_personalizado: '',
    });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = formatLocalDate(tomorrow);
    const selectedCity = cities[form.data.ciudad];
    const progress = step * 25;

    const submitInvitation = () => {
        if (staticMode) {
            const query = new URLSearchParams(form.data);

            window.location.assign(`${import.meta.env.BASE_URL}?${query.toString()}`);

            return;
        }

        form.post('/invitacion');
    };

    const updateDate = (date: string) => {
        if (blockedDates.includes(date)) {
            form.setData('fecha', '');
            setDateNotice('El 17 y 18 de diciembre están reservados. Elige otro día.');

            return;
        }

        setDateNotice('');
        form.clearErrors('fecha');
        form.setData('fecha', date);
    };

    return (
        <>
            {!staticMode && <Head title="Una aventura para dos" />}

            <Box className="invitation-page">
                <Container maxWidth="sm" className="page-shell">
                    <Stack className="brand" direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <AutoAwesomeRounded fontSize="small" />
                        <Typography variant="body2">UN UNIVERSO SOLO NUESTRO</Typography>
                    </Stack>

                    <Card
                        className={`invitation-card magic-frame${step === 0 ? ' invitation-cover' : ''}`}
                        elevation={0}
                    >
                        {step > 0 && (
                            <Box className="progress-area">
                                <LinearProgress variant="determinate" value={progress} />
                                <Typography variant="caption" className="step-label">
                                    El mapa nos acerca a nuestra próxima aventura
                                </Typography>
                            </Box>
                        )}

                        <Box className="card-content">
                            {step === 0 && (
                                <Box className="step-content invitation-poster">
                                    <MagicalPosterArt />
                                    <Stack
                                        className="poster-story"
                                        spacing={2}
                                        sx={{ alignItems: 'center' }}
                                    >
                                        <Typography className="poster-overline" variant="overline">
                                            UNA CARTA DE INVITACIÓN
                                        </Typography>
                                        <Typography component="h1" variant="h2" align="center">
                                            <span className="poster-recipient-intro">Oye,</span>
                                            <span className="poster-name">{recipientName}</span>
                                            <span className="poster-title-subtitle">una aventura nos espera</span>
                                        </Typography>
                                        <Typography className="poster-copy" align="center">
                                            Preparé un pequeño mapa mágico para elegir el día, el lugar y
                                            nuestro plan perfecto.
                                        </Typography>
                                        <Button
                                            size="large"
                                            variant="contained"
                                            endIcon={<AutoAwesomeRounded />}
                                            onClick={() => setStep(1)}
                                            className="primary-action poster-action"
                                        >
                                            ¡Acepto esta aventura!
                                        </Button>
                                        <Typography variant="caption" className="poster-note">
                                            UNA NOCHE ESTRELLADA · UNA HISTORIA PARA DOS
                                        </Typography>
                                    </Stack>
                                </Box>
                            )}

                            {step === 1 && (
                                <Stack className="step-content" spacing={2.5}>
                                    <StepHeading
                                        number="01"
                                        icon={<CalendarMonthRounded />}
                                        title="¿Qué día empieza la aventura?"
                                        description="Elige la fecha que te haga ilusión; el resto lo preparo yo."
                                    />
                                    <TextField
                                        fullWidth
                                        required
                                        type="date"
                                        label="Día de nuestra aventura"
                                        value={form.data.fecha}
                                        onChange={(event) => updateDate(event.target.value)}
                                        slotProps={{
                                            inputLabel: { shrink: true },
                                            htmlInput: { min: minDate },
                                        }}
                                        error={Boolean(dateNotice || form.errors.fecha)}
                                        helperText={
                                            dateNotice
                                            || form.errors.fecha
                                            || 'El 17 y 18 de diciembre no están disponibles.'
                                        }
                                    />
                                    {form.data.fecha && (
                                        <Chip
                                            icon={<AutoAwesomeRounded />}
                                            label={formatSpanishDate(form.data.fecha)}
                                            className="selection-chip"
                                        />
                                    )}
                                    <StepActions
                                        onBack={() => setStep(0)}
                                        onNext={() => setStep(2)}
                                        nextLabel="Abrir el mapa"
                                        disabled={
                                            !form.data.fecha
                                            || form.data.fecha < minDate
                                            || blockedDates.includes(form.data.fecha)
                                        }
                                    />
                                </Stack>
                            )}

                            {step === 2 && (
                                <Stack className="step-content" spacing={2.5}>
                                    <StepHeading
                                        number="02 · EL MAPA"
                                        icon={<LocationOnRounded />}
                                        title="¿Dónde empieza la aventura?"
                                        description="Escoge la ciudad que más te ilusione."
                                    />
                                    <Box className="choice-grid city-grid">
                                        {Object.entries(cities).map(([id, city]) => (
                                            <ChoiceCard
                                                key={id}
                                                selected={form.data.ciudad === id}
                                                emoji={city.emoji}
                                                title={city.corto}
                                                description={city.detalle}
                                                onClick={() => {
                                                    form.setData((current) => ({
                                                        ...current,
                                                        ciudad: id,
                                                        lugar: '',
                                                        lugar_personalizado: '',
                                                    }));
                                                }}
                                            />
                                        ))}
                                    </Box>
                                    {form.errors.ciudad && (
                                        <Alert severity="error">{form.errors.ciudad}</Alert>
                                    )}
                                    <StepActions
                                        onBack={() => setStep(1)}
                                        onNext={() => setStep(3)}
                                        nextLabel="Descubrir los planes"
                                        disabled={!form.data.ciudad}
                                    />
                                </Stack>
                            )}

                            {step === 3 && selectedCity && (
                                <Stack className="step-content" spacing={2.5}>
                                    <StepHeading
                                        number="03"
                                        icon={<AutoAwesomeRounded />}
                                        title="Elige nuestro plan especial"
                                        description={`Cuatro opciones encantadoras para ${selectedCity.nombre}.`}
                                    />
                                    <Box className="choice-grid venue-grid">
                                        {Object.entries(selectedCity.lugares).map(([id, venue]) => (
                                            <ChoiceCard
                                                key={id}
                                                selected={form.data.lugar === id}
                                                emoji={venue.emoji}
                                                title={venue.nombre}
                                                description={venue.detalle}
                                                onClick={() => {
                                                    form.clearErrors('lugar_personalizado');
                                                    form.setData((current) => ({
                                                        ...current,
                                                        lugar: id,
                                                        lugar_personalizado: id === 'otro'
                                                            ? current.lugar_personalizado
                                                            : '',
                                                    }));
                                                }}
                                            />
                                        ))}
                                    </Box>
                                    {form.data.lugar === 'otro' && (
                                        <TextField
                                            fullWidth
                                            required
                                            label="¿Qué lugar tienes en mente?"
                                            placeholder="Escribe el nombre del lugar"
                                            value={form.data.lugar_personalizado}
                                            onChange={(event) => {
                                                form.clearErrors('lugar_personalizado');
                                                form.setData('lugar_personalizado', event.target.value);
                                            }}
                                            slotProps={{ htmlInput: { maxLength: 120 } }}
                                            error={Boolean(form.errors.lugar_personalizado)}
                                            helperText={
                                                form.errors.lugar_personalizado
                                                ?? `${form.data.lugar_personalizado.length}/120 caracteres`
                                            }
                                        />
                                    )}
                                    {form.errors.lugar && (
                                        <Alert severity="error">{form.errors.lugar}</Alert>
                                    )}
                                    {form.errors.lugar_personalizado && !form.data.lugar_personalizado && (
                                        <Alert severity="error">{form.errors.lugar_personalizado}</Alert>
                                    )}
                                    {form.errors.fecha && (
                                        <Alert severity="error">{form.errors.fecha}</Alert>
                                    )}
                                    {form.errors.ciudad && (
                                        <Alert severity="error">{form.errors.ciudad}</Alert>
                                    )}
                                    <StepActions
                                        onBack={() => setStep(2)}
                                        onNext={submitInvitation}
                                        nextLabel={form.processing ? 'Preparando el pergamino…' : '¡Sellar la invitación!'}
                                        disabled={
                                            !form.data.lugar
                                            || (form.data.lugar === 'otro'
                                                && !form.data.lugar_personalizado.trim())
                                            || form.processing
                                        }
                                        loading={form.processing}
                                    />
                                </Stack>
                            )}
                        </Box>
                    </Card>

                    <Stack className="page-footer" direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <AutoAwesomeRounded fontSize="inherit" />
                        <Typography variant="caption">
                            Un detalle mágico, pensado para ti
                        </Typography>
                    </Stack>
                </Container>
            </Box>
        </>
    );
}

function MagicalPosterArt() {
    const banners = [
        { color: 'rose', label: 'Radiante', motif: 'heart' },
        { color: 'violet', label: 'Brillante', motif: 'sparkle' },
        { color: 'teal', label: 'Bonita', motif: 'moon' },
        { color: 'amber', label: 'Increíble', motif: 'star' },
    ];

    return (
        <Box className="poster-art" aria-label="Salón encantado con estandartes hechos para Sandy">
            <svg
                className="enchanted-hall"
                viewBox="0 0 900 440"
                role="img"
                aria-hidden="true"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <linearGradient id="hall-twilight" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#100e25" />
                        <stop offset="48%" stopColor="#40213f" />
                        <stop offset="100%" stopColor="#c36d68" />
                    </linearGradient>
                    <radialGradient id="hall-glow" cx="50%" cy="72%" r="58%">
                        <stop offset="0%" stopColor="#ffd68a" stopOpacity=".66" />
                        <stop offset="45%" stopColor="#ec8b79" stopOpacity=".2" />
                        <stop offset="100%" stopColor="#d5aa68" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="window-light" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#171633" />
                        <stop offset="72%" stopColor="#8b4169" />
                        <stop offset="100%" stopColor="#f4b77a" />
                    </linearGradient>
                    <linearGradient id="candle-wax" x1="0" x2="1">
                        <stop offset="0%" stopColor="#d6b989" />
                        <stop offset="45%" stopColor="#fff0cf" />
                        <stop offset="100%" stopColor="#bd986d" />
                    </linearGradient>
                </defs>
                <rect width="900" height="440" fill="url(#hall-twilight)" />
                <rect width="900" height="440" fill="url(#hall-glow)" />
                <g className="starlight" fill="#f8dfa9">
                    <circle cx="63" cy="68" r="1.8" />
                    <circle cx="142" cy="114" r="1.4" />
                    <circle cx="224" cy="46" r="1.7" />
                    <circle cx="318" cy="97" r="1.2" />
                    <circle cx="402" cy="39" r="1.5" />
                    <circle cx="508" cy="76" r="1.6" />
                    <circle cx="602" cy="42" r="1.3" />
                    <circle cx="685" cy="101" r="1.8" />
                    <circle cx="769" cy="55" r="1.4" />
                    <circle cx="838" cy="123" r="1.5" />
                    <circle cx="872" cy="71" r="1.4" />
                </g>
                <g fill="none" stroke="#dc9b75" strokeOpacity=".43">
                    <path d="M62 438V205a388 330 0 0 1 776 0v233" strokeWidth="25" />
                    <path d="M143 438V207a307 266 0 0 1 614 0v231" strokeWidth="15" />
                    <path d="M229 438V211a221 203 0 0 1 442 0v227" strokeWidth="10" />
                </g>
                <g fill="#281933" stroke="#d58a70" strokeOpacity=".4" strokeWidth="3">
                    <path d="M35 440V212l59-28 59 28v228z" />
                    <path d="M746 440V212l59-28 60 28v228z" />
                    <path d="M85 219V183a365 310 0 0 1 730 0v36h-17v-34a348 293 0 0 0-696 0v34z" />
                </g>
                <path d="M324 369V205a126 143 0 0 1 252 0v164z" fill="#24172f" stroke="#e0a16c" strokeOpacity=".8" strokeWidth="5" />
                <path d="M337 369V207a113 128 0 0 1 226 0v162z" fill="url(#window-light)" />
                <path d="M450 83v286M337 238h226M370 151l160 160m0-160L370 311" fill="none" stroke="#eeb886" strokeOpacity=".34" strokeWidth="4" />
                <path d="M383 369v-92a67 76 0 0 1 134 0v92z" fill="#261b31" stroke="#efbc7c" strokeOpacity=".68" strokeWidth="4" />
                <g fill="#d98f71" opacity=".55">
                    <path d="M70 239h34v201H70zm726 0h34v201h-34z" />
                    <path d="M178 174h20v266h-20zm524 0h20v266h-20z" />
                </g>
                <g fill="url(#candle-wax)" opacity=".96">
                    <rect x="74" y="151" width="12" height="88" rx="4" />
                    <rect x="150" y="112" width="10" height="75" rx="4" />
                    <rect x="231" y="177" width="9" height="57" rx="4" />
                    <rect x="306" y="117" width="9" height="65" rx="4" />
                    <rect x="582" y="131" width="9" height="68" rx="4" />
                    <rect x="658" y="96" width="10" height="80" rx="4" />
                    <rect x="737" y="155" width="12" height="84" rx="4" />
                    <rect x="817" y="121" width="10" height="72" rx="4" />
                </g>
                <g className="candle-flames" fill="#ffe8a6">
                    <path d="M80 147q-13-15 0-29 12 14 0 29m75-41q-12-14 0-27 11 13 0 27m81 68q-10-12 0-23 10 11 0 23m74-56q-10-12 0-23 10 11 0 23m277 4q-10-12 0-23 10 11 0 23m75-44q-12-14 0-27 11 13 0 27m80 57q-13-15 0-29 12 14 0 29m79-46q-11-13 0-25 11 12 0 25" />
                </g>
                <path d="M0 329q170-31 332 3t265 0q153-31 303-1v109H0Z" fill="#21162b" opacity=".83" />
                <path d="m310 440 107-112h66L590 440z" fill="#ecb178" opacity=".23" />
                <path d="m368 440 68-112h28l68 112z" fill="#ffe0a2" opacity=".21" />
                <path d="M0 357q225-25 450 3 225-28 450-3v83H0Z" fill="#151426" opacity=".56" />
                <g fill="#f4c985" opacity=".78">
                    <circle cx="450" cy="348" r="5" />
                    <circle cx="216" cy="384" r="2" />
                    <circle cx="695" cy="390" r="2" />
                    <path d="M83 338h6v24h-6zm728-4h6v24h-6z" />
                </g>
            </svg>

            <Box className="banner-row" aria-label="Cuatro detalles de nuestra aventura">
                {banners.map((banner) => (
                    <Box
                        key={banner.color}
                        className={`guild-banner guild-banner-${banner.color}`}
                        aria-label={`Un detalle de ${banner.label.toLowerCase()} para Sandy`}
                    >
                        <span className="banner-symbol" aria-hidden="true">
                            <svg viewBox="0 0 32 32" fill="none">
                                {banner.motif === 'heart' && (
                                    <path d="M16 27S5 20.3 5 13a6 6 0 0 1 11-4 6 6 0 0 1 11 4c0 7.3-11 14-11 14Z" />
                                )}
                                {banner.motif === 'sparkle' && (
                                    <>
                                        <path d="m16 3 3.4 8.5L28 15l-8.6 3.5L16 27l-3.4-8.5L4 15l8.6-3.5L16 3Z" />
                                        <path d="m26 22 .9 2.1L29 25l-2.1.9L26 28l-.9-2.1L23 25l2.1-.9L26 22Z" />
                                    </>
                                )}
                                {banner.motif === 'moon' && (
                                    <path d="M25 19a11 11 0 0 1-14-14A12 12 0 1 0 25 19Z" />
                                )}
                                {banner.motif === 'star' && (
                                    <>
                                        <path d="M16 3c1.7 7.3 5.7 11.3 13 13-7.3 1.7-11.3 5.7-13 13C14.3 21.7 10.3 17.7 3 16c7.3-1.7 11.3-5.7 13-13Z" />
                                        <circle cx="16" cy="16" r="3" />
                                    </>
                                )}
                            </svg>
                            <span>{banner.label}</span>
                        </span>
                    </Box>
                ))}
            </Box>
            <Box className="poster-art-caption">
                <span>UN UNIVERSO</span>
                <i />
                <span>HECHO PARA NOSOTROS</span>
            </Box>
        </Box>
    );
}

function StepHeading({
    number,
    icon,
    title,
    description,
}: {
    number: string;
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={1} className="step-kicker" sx={{ alignItems: 'center' }}>
                {icon}
                <Typography variant="overline">{number} · NUESTRA AVENTURA</Typography>
            </Stack>
            <Typography component="h1" variant="h3">
                {title}
            </Typography>
            <Typography color="text.secondary">{description}</Typography>
        </Stack>
    );
}

function ChoiceCard({
    selected,
    emoji,
    title,
    description,
    onClick,
}: {
    selected: boolean;
    emoji: string;
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <Card className={`choice-card${selected ? ' selected' : ''}`} elevation={0}>
            <CardActionArea
                onClick={onClick}
                aria-pressed={selected}
                className="choice-action"
            >
                <span className="choice-emoji" aria-hidden="true">{emoji}</span>
                <Typography component="h2" variant="subtitle1" className="choice-title">
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardActionArea>
        </Card>
    );
}

function StepActions({
    onBack,
    onNext,
    nextLabel,
    disabled,
    loading = false,
}: {
    onBack: () => void;
    onNext: () => void;
    nextLabel: string;
    disabled: boolean;
    loading?: boolean;
}) {
    return (
        <Stack
            className="step-actions"
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between' }}
        >
            <Button
                variant="text"
                color="inherit"
                startIcon={<ArrowBackRounded />}
                onClick={onBack}
                disabled={loading}
            >
                Atrás
            </Button>
            <Button
                variant="contained"
                endIcon={<ArrowForwardRounded />}
                onClick={onNext}
                disabled={disabled}
                loading={loading}
            >
                {nextLabel}
            </Button>
        </Stack>
    );
}
