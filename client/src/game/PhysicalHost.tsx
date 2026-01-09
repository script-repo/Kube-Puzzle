import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useGame, PhysicalHost as HostType } from "@/lib/stores/useGame";

interface PhysicalHostProps {
  host: HostType;
  nodePositions: Array<[number, number, number]>;  // Positions of VMs on this host
}

/**
 * Renders a subtle visual grouping indicator for VMs on the same physical host
 * Shows as a faint outline box connecting all VMs
 */
export function PhysicalHost({ host, nodePositions }: PhysicalHostProps) {
  const meshRef = useRef<THREE.LineSegments>(null);
  const { hoveredPhysicalHostId } = useGame();

  if (nodePositions.length === 0) return null;

  // Calculate bounding box for all nodes on this host
  const minX = Math.min(...nodePositions.map(p => p[0])) - 3;
  const maxX = Math.max(...nodePositions.map(p => p[0])) + 3;
  const minZ = Math.min(...nodePositions.map(p => p[2])) - 2.5;
  const maxZ = Math.max(...nodePositions.map(p => p[2])) + 2.5;

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const width = maxX - minX;
  const depth = maxZ - minZ;

  const isHighlighted = hoveredPhysicalHostId === host.id;

  useFrame(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.LineBasicMaterial;
      material.opacity = isHighlighted ? 0.5 : 0.15;
    }
  });

  // Create outline geometry
  const points = [
    new THREE.Vector3(minX, -1.5, minZ),
    new THREE.Vector3(maxX, -1.5, minZ),
    new THREE.Vector3(maxX, -1.5, maxZ),
    new THREE.Vector3(minX, -1.5, maxZ),
    new THREE.Vector3(minX, -1.5, minZ),
  ];

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      {/* Physical host boundary outline */}
      <lineSegments ref={meshRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.15}
          linewidth={2}
        />
      </lineSegments>

      {/* Physical host label (only when highlighted) */}
      {isHighlighted && (
        <Text
          position={[centerX, -1.8, minZ - 1]}
          fontSize={0.25}
          color="#8b5cf6"
          anchorX="center"
          anchorY="middle"
        >
          {host.name}
        </Text>
      )}

      {/* Resource indicator (subtle floor plane) */}
      <mesh
        position={[centerX, -1.99, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={isHighlighted ? 0.05 : 0.02}
        />
      </mesh>
    </group>
  );
}
