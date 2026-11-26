import { useEffect, useRef, useState } from 'react';
import VolumeOffRounded from '@mui/icons-material/VolumeOffRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import IconButton from '@mui/material/IconButton';

export default function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playMusic = async () => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        try {
            await audio.play();
            setIsPlaying(true);
        } catch {
            setIsPlaying(false);
        }
    };

    const toggleMusic = () => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            void playMusic();
        }
    };

    useEffect(() => {
        const startOnFirstInteraction = () => {
            void playMusic();
        };

        window.addEventListener('pointerdown', startOnFirstInteraction, { once: true });
        window.addEventListener('keydown', startOnFirstInteraction, { once: true });

        return () => {
            window.removeEventListener('pointerdown', startOnFirstInteraction);
            window.removeEventListener('keydown', startOnFirstInteraction);
        };
    }, []);

    return (
        <>
            <audio
                ref={audioRef}
                src={`${import.meta.env.BASE_URL}musica.mp3`}
                loop
                preload="auto"
            />
            <IconButton
                className="music-toggle"
                onClick={toggleMusic}
                aria-label={isPlaying ? 'Silenciar música' : 'Reproducir música'}
                title={isPlaying ? 'Silenciar música' : 'Reproducir música'}
            >
                {isPlaying
                    ? <VolumeUpRounded />
                    : <VolumeOffRounded />}
            </IconButton>
        </>
    );
}
