import { useRef, useState, useMemo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Text, RoundedBox, Float } from "@react-three/drei";
import * as THREE from "three";
import { useGame, Pod as PodType } from "@/lib/stores/useGame";

interface PodProps {
  pod: PodType;
}

export function Pod({ pod }: PodProps) {
  const meshRef = useRef<THREE.Group>(null);
  const cubeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { selectedPodId, selectPod } = useGame();
  const isSelected = selectedPodId === pod.id;
  const isScheduled = pod.nodeId !== null;
  
  const emissiveColor = useMemo(() => new THREE.Color(pod.color), [pod.color]);
  
  useFrame((state) => {
    if (cubeRef.current) {
      if (isSelected) {
        cubeRef.current.rotation.y += 0.02;
        const scale = 1.1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
        cubeRef.current.scale.setScalar(scale);
      } else if (hovered) {
        cubeRef.current.scale.lerp(new THREE.Vector3(1.05, 1.05, 1.05), 0.1);
      } else {
        cubeRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        cubeRef.current.rotation.y = 0;
      }
    }
  });
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectPod(isSelected ? null : pod.id);
  };
  
  const handlePointerEnter = () => {
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  
  const handlePointerLeave = () => {
    setHovered(false);
    document.body.style.cursor = "default";
  };
  
  const getStatusIcon = () => {
    switch (pod.status) {
      case "running": return "●";
      case "pending": return "○";
      case "terminating": return "◌";
    }
  };
  
  const containerContent = (
    <group 
      ref={meshRef}
      position={pod.position}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <RoundedBox
        ref={cubeRef}
        args={[1, 1, 1]}
        radius={0.1}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color={pod.color}
          emissive={emissiveColor}
          emissiveIntensity={isSelected ? 0.8 : isScheduled ? 0.4 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </RoundedBox>
      
      {isSelected && (
        <mesh>
          <ringGeometry args={[0.7, 0.8, 32]} />
          <meshBasicMaterial 
            color="#fff" 
            transparent 
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      <mesh position={[0, 0.51, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.6]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {[[-0.3, 0, -0.3], [0.3, 0, -0.3], [-0.3, 0, 0.3], [0.3, 0, 0.3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color={pod.status === "running" ? "#10b981" : "#f59e0b"}
            emissive={pod.status === "running" ? "#10b981" : "#f59e0b"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {pod.name}
      </Text>
      
      <Text
        position={[0, -0.9, 0]}
        fontSize={0.12}
        color={pod.status === "running" ? "#10b981" : "#f59e0b"}
        anchorX="center"
        anchorY="middle"
      >
        {getStatusIcon()} {pod.status}
      </Text>
    </group>
  );
  
  if (!isScheduled) {
    return (
      <Float
        speed={2}
        rotationIntensity={0.3}
        floatIntensity={0.5}
      >
        {containerContent}
      </Float>
    );
  }
  
  return containerContent;
}
