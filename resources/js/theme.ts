import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#704061',
            dark: '#4d2a4d',
            light: '#a66b83',
        },
        secondary: {
            main: '#a77a3f',
        },
        background: {
            default: '#100e22',
            paper: '#21182e',
        },
        text: {
            primary: '#fff2d6',
            secondary: '#ded3e4',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: '"Palatino Linotype", "Book Antiqua", "Baskerville", Georgia, serif',
        h1: {
            fontFamily: '"Palatino Linotype", "Book Antiqua", "Baskerville", Georgia, serif',
            fontWeight: 600,
            letterSpacing: '-0.025em',
        },
        h2: {
            fontFamily: '"Palatino Linotype", "Book Antiqua", "Baskerville", Georgia, serif',
            fontWeight: 600,
            letterSpacing: '-0.02em',
        },
        h3: {
            fontFamily: '"Palatino Linotype", "Book Antiqua", "Baskerville", Georgia, serif',
            fontWeight: 600,
        },
        h4: {
            fontFamily: '"Palatino Linotype", "Book Antiqua", "Baskerville", Georgia, serif',
            fontWeight: 600,
        },
        h5: {
            fontFamily: '"Palatino Linotype", "Book Antiqua", "Baskerville", Georgia, serif',
            fontWeight: 600,
        },
        h6: {
            fontFamily: '"Palatino Linotype", "Book Antiqua", "Baskerville", Georgia, serif',
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
});
