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
};

const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatSpanishDate = (date: string) =>
    new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(new Date(`${date}T12:00:00`));

export default function Invitacion({ cities, recipientName, blockedDates }: Props) {
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
            <Head title="Una aventura para dos" />

            <Box className="invitation-page">
                <Container maxWidth="sm" className="page-shell">
                    <Stack className="brand" direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <AutoAwesomeRounded fontSize="small" />
                        <Typography variant="body2">ACADEMIA DE PEQUEÑAS MAGIAS</Typography>
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
                                            Oye, {recipientName}
                                            <span>una aventura nos espera</span>
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
        { color: 'ember', label: 'Radiante', motif: 'flame' },
        { color: 'grove', label: 'Brillante', motif: 'leaf' },
        { color: 'sun', label: 'Hermosa', motif: 'star' },
        { color: 'mist', label: 'Preciosa', motif: 'wave' },
    ];

    return (
        <Box className="poster-art" aria-label="Castillo de fantasía con cuatro palabras para Sandy">
            <svg
                className="castle-skyline"
                viewBox="0 0 900 410"
                role="img"
                aria-hidden="true"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <linearGradient id="twilight" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#111a2b" />
                        <stop offset="58%" stopColor="#263a52" />
                        <stop offset="100%" stopColor="#a7784a" />
                    </linearGradient>
                    <radialGradient id="castle-glow" cx="50%" cy="59%" r="46%">
                        <stop offset="0%" stopColor="#edc580" stopOpacity=".4" />
                        <stop offset="100%" stopColor="#d5aa68" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width="900" height="410" fill="url(#twilight)" />
                <rect width="900" height="410" fill="url(#castle-glow)" />
                <g className="starlight" fill="#f3deb1">
                    <circle cx="92" cy="69" r="1.8" />
                    <circle cx="158" cy="119" r="1.4" />
                    <circle cx="230" cy="55" r="1.7" />
                    <circle cx="300" cy="98" r="1.2" />
                    <circle cx="362" cy="39" r="1.5" />
                    <circle cx="462" cy="82" r="1.6" />
                    <circle cx="537" cy="46" r="1.3" />
                    <circle cx="635" cy="101" r="1.8" />
                    <circle cx="724" cy="56" r="1.4" />
                    <circle cx="809" cy="117" r="1.5" />
                    <circle cx="865" cy="66" r="1.4" />
                </g>
                <g fill="#e1c27d" opacity=".8" fontFamily="Georgia, serif">
                    <text x="112" y="167" fontSize="22">✧</text>
                    <text x="755" y="153" fontSize="25">✦</text>
                    <text x="194" y="47" fontSize="13">✦</text>
                    <text x="693" y="67" fontSize="14">✧</text>
                </g>
                <circle className="moon-glow" cx="696" cy="109" r="31" fill="#dfceaa" opacity=".82" />
                <circle cx="710" cy="96" r="29" fill="#34445a" />
                <path d="M0 312 77 264l64 25 86-69 70 40 77-89 66 40 64-53 72 51 84-74 67 52 73-43v266H0Z"
                    fill="#202c3b" opacity=".85" />
                <path d="M0 350 91 305l69 25 66-55 70 25 63-89 76 25 76-68 70 56 70-35 88 46 72-26 89 47v154H0Z"
                    fill="#131d2b" />
                <g fill="#172233" stroke="#b48b52" strokeOpacity=".24" strokeWidth="2">
                    <path d="M122 337V204h49v133zm-11-132 35-49 35 49z" />
                    <path d="M212 337V176h61v161zm-13-160 43-59 44 59z" />
                    <path d="M298 337V218h48v119zm-10-118 34-48 34 48z" />
                    <path d="M394 337V156h72v181zm-16-180 52-74 52 74z" />
                    <path d="M488 337V205h53v132zm-12-131 38-52 39 52z" />
                    <path d="M578 337V173h64v164zm-14-163 46-65 46 65z" />
                    <path d="M675 337V213h48v124zm-10-123 34-49 35 49z" />
                    <path d="M742 337V182h57v155zm-13-154 41-57 42 57z" />
                </g>
                <g fill="#e9c776" opacity=".9">
                    <path d="M151 223h8v17h-8zm78 5h8v18h-8zm108 17h8v19h-8zm79-61h8v20h-8zm36 0h8v20h-8zm78 53h8v18h-8zm78-47h8v19h-8zm100 44h8v18h-8z" />
                </g>
                <path d="M0 348q130-21 260 3t263-1q162-23 377 2v58H0Z" fill="#101825" />
                <g fill="#e4bd70" opacity=".56">
                    <path d="M92 360h2v18h-2zm312-7h2v20h-2zm301 4h2v19h-2zm145-2h2v17h-2z" />
                </g>
                <rect y="397" width="900" height="13" fill="#101725" opacity=".56" />
            </svg>

            <Box className="banner-row" aria-label="Cuatro palabras que describen a Sandy">
                {banners.map((banner) => (
                    <Box
                        key={banner.color}
                        className={`guild-banner guild-banner-${banner.color}`}
                        aria-label={`Sandy es ${banner.label.toLowerCase()}`}
                    >
                        <span className="banner-symbol" aria-hidden="true">
                            <svg viewBox="0 0 32 32" fill="none">
                                {banner.motif === 'flame' && (
                                    <path d="M17 3c2 7-5 8-3 14 1-2 3-3 5-5 4 5 5 8 3 12-1 3-4 5-8 5-5 0-9-4-8-9 0-4 3-7 6-10 0 5 1 6 2 7 0-5 5-8 3-14Z" />
                                )}
                                {banner.motif === 'leaf' && (
                                    <>
                                        <path d="M27 5C14 4 6 9 6 18c0 5 4 9 9 9 9 0 14-9 12-22Z" />
                                        <path d="M7 27 23 10m-9 9 8 1" />
                                    </>
                                )}
                                {banner.motif === 'star' && (
                                    <>
                                        <path d="m16 3 3.4 8.5L28 15l-8.6 3.5L16 27l-3.4-8.5L4 15l8.6-3.5L16 3Z" />
                                        <circle cx="16" cy="15" r="3" />
                                    </>
                                )}
                                {banner.motif === 'wave' && (
                                    <>
                                        <path d="M4 13c4-5 7 5 12 0s8 5 12 0M4 20c4-5 7 5 12 0s8 5 12 0" />
                                        <path d="M16 4v4m-2-2h4" />
                                    </>
                                )}
                            </svg>
                            <span>{banner.label}</span>
                        </span>
                    </Box>
                ))}
            </Box>
            <Box className="poster-art-caption">
                <span>ASÍ TE VEO, SANDY</span>
                <i />
                <span>UNA PERSONA INOLVIDABLE</span>
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
