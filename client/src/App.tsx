import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";

import { Scene } from "./game/Scene";
import { GameUI } from "./game/UI";
import { SoundManager } from "./game/SoundManager";

const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
];

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading Cluster...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        <Canvas
          shadows
          camera={{
            position: [0, 12, 18],
            fov: 50,
            near: 0.1,
            far: 200
          }}
          gl={{
            antialias: true,
            powerPreference: "default"
          }}
        >
          <color attach="background" args={["#0a0a1a"]} />
          <fog attach="fog" args={["#0a0a1a", 30, 80]} />
          
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
        
        <GameUI />
        <SoundManager />
      </KeyboardControls>
    </div>
  );
}

export default App;
