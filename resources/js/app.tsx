import { CssBaseline, ThemeProvider } from '@mui/material';
import { createInertiaApp } from '@inertiajs/react';
import type { ReactNode } from 'react';
import BackgroundMusic from './components/BackgroundMusic';
import { theme } from './theme';
import '../css/app.css';

createInertiaApp({
    title: (title) => title ? `${title} · Una cita contigo` : 'Una cita contigo',
    pages: {
        path: './pages',
        extension: '.tsx',
    },
    strictMode: true,
    withApp: (app: ReactNode) => (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {app}
            <BackgroundMusic />
        </ThemeProvider>
    ),
});
