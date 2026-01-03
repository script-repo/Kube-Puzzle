import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Text3D, Center } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/lib/stores/useGame";
import { Pod } from "./Pod";
import { Node } from "./Node";
import { Player } from "./Player";

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[10, 10, -10]} intensity={0.5} color="#8b5cf6" />
      <hemisphereLight args={["#1e1b4b", "#312e81", 0.5]} />
    </>
  );
}

function Ground() {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -2, 0]} 
      receiveShadow
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#0f172a" 
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function GridFloor() {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 2;
    }
  });
  
  return (
    <group position={[0, -1.99, 0]}>
      <gridHelper 
        ref={gridRef}
        args={[100, 50, "#3b82f6", "#1e3a8a"]} 
      />
    </group>
  );
}

function DataStreams() {
  const count = 50;
  const positions = useRef<[number, number, number][]>([]);
  
  if (positions.current.length === 0) {
    for (let i = 0; i < count; i++) {
      positions.current.push([
        (Math.random() - 0.5) * 60,
        Math.random() * 30 + 5,
        (Math.random() - 0.5) * 60 - 20,
      ]);
    }
  }
  
  return (
    <group>
      {positions.current.map((pos, i) => (
        <Float
          key={i}
          speed={1 + Math.random()}
          rotationIntensity={0.2}
          floatIntensity={2}
          position={pos}
        >
          <mesh>
            <boxGeometry args={[0.1, 0.5 + Math.random() * 2, 0.1]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#8b5cf6" : "#10b981"}
              emissive={i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#8b5cf6" : "#10b981"}
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function ClusterTitle() {
  const { currentLevel, levels, phase } = useGame();
  const level = levels[currentLevel];
  
  if (phase !== "playing") return null;
  
  return (
    <group position={[0, 8, -15]}>
      <Center>
        <Text3D
          font="/fonts/inter.json"
          size={1.2}
          height={0.2}
          curveSegments={12}
        >
          {level?.name || "Cluster Conductor"}
          <meshStandardMaterial 
            color="#fff" 
            emissive="#3b82f6"
            emissiveIntensity={0.3}
          />
        </Text3D>
      </Center>
    </group>
  );
}

function CameraController() {
  const { camera } = useThree();
  
  useFrame(() => {
    camera.position.lerp(new THREE.Vector3(0, 12, 18), 0.02);
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

export function Scene() {
  const { nodes, pods, phase } = useGame();
  
  if (phase === "menu") {
    return (
      <>
        <Lighting />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <Ground />
        <GridFloor />
        <DataStreams />
        <CameraController />
      </>
    );
  }
  
  return (
    <>
      <Lighting />
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
      <Ground />
      <GridFloor />
      <DataStreams />
      <ClusterTitle />
      
      {nodes.map((node) => (
        <Node key={node.id} node={node} />
      ))}
      
      {pods.map((pod) => (
        <Pod key={pod.id} pod={pod} />
      ))}
      
      <Player />
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={10}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
      />
    </>
  );
}
