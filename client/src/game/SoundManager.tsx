import { useEffect, useRef } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";

export function SoundManager() {
  const {
    setHitSound,
    setSuccessSound,
    isMuted,
    playSuccess
  } = useAudio();

  const { phase, currentLevel } = useGame();

  // Store references to all music tracks
  const musicTracks = useRef<Record<string, HTMLAudioElement>>({});
  const currentTrack = useRef<HTMLAudioElement | null>(null);
  const levelMusicCache = useRef<Record<number, string>>({});

  // Initialize sound effects and music tracks
  useEffect(() => {
    // Load sound effects
    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.6;
    setSuccessSound(success);

    // Load all music tracks
    for (let i = 1; i <= 9; i++) {
      const track = new Audio(`/sounds/Game Soundtrack - strings - ${i}.mp3`);
      track.loop = true;
      track.volume = 0.25;
      musicTracks.current[`track${i}`] = track;
    }

    return () => {
      // Cleanup all music tracks
      Object.values(musicTracks.current).forEach(track => {
        track.pause();
        track.src = "";
      });
    };
  }, [setHitSound, setSuccessSound]);

  // Function to smoothly transition between tracks
  const switchTrack = (newTrack: HTMLAudioElement) => {
    if (currentTrack.current === newTrack) {
      return; // Already playing this track
    }

    // Fade out current track
    if (currentTrack.current) {
      const oldTrack = currentTrack.current;
      const fadeOut = setInterval(() => {
        if (oldTrack.volume > 0.05) {
          oldTrack.volume = Math.max(0, oldTrack.volume - 0.05);
        } else {
          oldTrack.pause();
          oldTrack.currentTime = 0;
          oldTrack.volume = 0.25;
          clearInterval(fadeOut);
        }
      }, 50);
    }

    // Fade in new track
    currentTrack.current = newTrack;
    newTrack.volume = 0;
    newTrack.play().catch(() => {});

    const fadeIn = setInterval(() => {
      if (newTrack.volume < 0.20) {
        newTrack.volume = Math.min(0.25, newTrack.volume + 0.05);
      } else {
        clearInterval(fadeIn);
      }
    }, 50);
  };

  // Function to get appropriate track based on phase and level
  const getTrackForState = (): HTMLAudioElement | null => {
    // Menu, briefing, or completion screens: Track 1
    if (phase === "menu" || phase === "briefing" || phase === "levelComplete" || phase === "gameComplete") {
      return musicTracks.current.track1;
    }

    // Playing phase: Select based on level
    if (phase === "playing") {
      const levelNum = currentLevel + 1; // Convert 0-indexed to 1-indexed

      // Level 8 (index 7): Track 9
      if (levelNum === 8) {
        return musicTracks.current.track9;
      }

      // Level 7 (index 6): Track 8
      if (levelNum === 7) {
        return musicTracks.current.track8;
      }

      // Levels 1-6: Random from tracks 2-7 (but keep same track for same level)
      if (levelNum >= 1 && levelNum <= 6) {
        // Check if we already selected a track for this level
        if (!levelMusicCache.current[levelNum]) {
          // Select a random track from 2-7
          const randomTrack = Math.floor(Math.random() * 6) + 2; // 2-7
          levelMusicCache.current[levelNum] = `track${randomTrack}`;
        }
        return musicTracks.current[levelMusicCache.current[levelNum]];
      }
    }

    return null;
  };

  // Handle music playback based on phase and mute state
  useEffect(() => {
    const track = getTrackForState();

    if (track && !isMuted) {
      switchTrack(track);
    } else if (currentTrack.current) {
      // Pause current track if muted or no track selected
      currentTrack.current.pause();
    }
  }, [phase, currentLevel, isMuted]);

  // Play success sound on level/game complete
  useEffect(() => {
    if (phase === "levelComplete" || phase === "gameComplete") {
      playSuccess();
    }
  }, [phase, playSuccess]);

  return null;
}
