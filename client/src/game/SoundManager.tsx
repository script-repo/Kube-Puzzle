import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";

export function SoundManager() {
  const { 
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound,
    backgroundMusic,
    isMuted,
    playSuccess
  } = useAudio();
  
  const phase = useGame(state => state.phase);
  
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);
    
    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;
    setHitSound(hit);
    
    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.6;
    setSuccessSound(success);
    
    return () => {
      bgMusic.pause();
      bgMusic.src = "";
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);
  
  useEffect(() => {
    if (backgroundMusic) {
      if (!isMuted && phase === "playing") {
        backgroundMusic.play().catch(() => {});
      } else {
        backgroundMusic.pause();
      }
    }
  }, [backgroundMusic, isMuted, phase]);
  
  useEffect(() => {
    if (phase === "levelComplete" || phase === "gameComplete") {
      playSuccess();
    }
  }, [phase, playSuccess]);
  
  return null;
}
