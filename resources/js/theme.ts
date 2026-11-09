import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#753d48',
            dark: '#58303b',
            light: '#a45d68',
        },
        secondary: {
            main: '#967638',
        },
        background: {
            default: '#111827',
            paper: '#f6efdf',
        },
        text: {
            primary: '#372b27',
            secondary: '#75645a',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: '"Avenir Next", Avenir, "Segoe UI", sans-serif',
        h1: {
            fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
            fontWeight: 500,
            letterSpacing: '-0.045em',
        },
        h2: {
            fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
            fontWeight: 500,
            letterSpacing: '-0.035em',
        },
        h3: {
            fontFamily: '"Palatino Linotype", "Book Antiqua", Georgia, serif',
            fontWeight: 500,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
});
