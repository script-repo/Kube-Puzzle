import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useGame, ControlPlaneNode as CPNode } from "@/lib/stores/useGame";

interface ControlPlaneProps {
  node: CPNode;
}

export function ControlPlane({ node }: ControlPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { hoveredControlPlaneId, hoverControlPlane } = useGame();
  const isHovered = hoveredControlPlaneId === node.id;

  // Component-specific colors
  const getComponentColor = () => {
    switch (node.componentType) {
      case 'etcd': return "#10b981";          // Green
      case 'apiserver': return "#ef4444";     // Red
      case 'scheduler': return "#f59e0b";     // Orange
      case 'controller-manager': return "#8b5cf6";  // Purple
      default: return "#6b7280";
    }
  };

  const componentColor = getComponentColor();

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + node.id.length) * 0.1;

      // Pulse when hovered
      if (isHovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const handlePointerEnter = () => {
    setHovered(true);
    hoverControlPlane(node.id);
    document.body.style.cursor = "help";
  };

  const handlePointerLeave = () => {
    setHovered(false);
    hoverControlPlane(null);
    document.body.style.cursor = "default";
  };

  return (
    <group position={node.position}>
      {/* Main component box - smaller and more stylized than worker nodes */}
      <RoundedBox
        ref={meshRef}
        args={[1.5, 1.5, 1.5]}
        radius={0.15}
        smoothness={4}
        castShadow
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <meshStandardMaterial
          color={componentColor}
          emissive={componentColor}
          emissiveIntensity={node.healthy ? 0.4 : 0.1}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </RoundedBox>

      {/* Status indicator ring */}
      {node.healthy && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1, 1.1, 32]} />
          <meshBasicMaterial
            color={componentColor}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Component label */}
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {node.componentType}
      </Text>

      {/* Health status icon */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.15}
        color={node.healthy ? "#10b981" : "#ef4444"}
        anchorX="center"
        anchorY="middle"
      >
        {node.healthy ? "✓ healthy" : "✗ unhealthy"}
      </Text>
    </group>
  );
}
