import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useGame, Node as NodeType } from "@/lib/stores/useGame";

interface NodeProps {
  node: NodeType;
}

export function Node({ node }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { 
    selectedPodId, 
    hoveredNodeId, 
    hoverNode, 
    movePodToNode,
    pods 
  } = useGame();
  
  const isHighlighted = selectedPodId !== null && (hovered || hoveredNodeId === node.id);
  const isFull = node.pods.length >= node.capacity;
  const utilizationPercent = (node.pods.length / node.capacity) * 100;

  // Extract node type from name
  const getNodeType = () => {
    const name = node.name.toLowerCase();
    if (name.includes('worker')) return 'Worker Node';
    if (name.includes('prod')) return 'Production';
    if (name.includes('dev')) return 'Development';
    if (name.includes('high-mem')) return 'High Memory';
    if (name.includes('high-cpu')) return 'High CPU';
    if (name.includes('gpu')) return 'GPU Node';
    if (name.includes('storage')) {
      if (name.includes('zone-a')) return 'Storage Zone A';
      if (name.includes('zone-b')) return 'Storage Zone B';
      if (name.includes('zone-c')) return 'Storage Zone C';
    }
    return 'Compute Node';
  };
  
  const getStatusColor = () => {
    if (isFull) return "#ef4444";
    if (utilizationPercent > 50) return "#f59e0b";
    return "#10b981";
  };
  
  useFrame((state) => {
    if (meshRef.current) {
      if (isHighlighted && !isFull) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.05, 1.05, 1.05), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
    
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  
  const handleClick = () => {
    if (!selectedPodId) return;
    
    const selectedPod = pods.find(p => p.id === selectedPodId);
    if (!selectedPod) return;
    
    if (selectedPod.nodeId === node.id) {
      return;
    }
    
    const isMovingFromAnotherNode = selectedPod.nodeId !== null;
    const effectiveCapacity = isMovingFromAnotherNode ? node.capacity : node.capacity;
    const hasRoom = node.pods.length < effectiveCapacity;
    
    if (hasRoom) {
      movePodToNode(selectedPodId, node.id);
    }
  };
  
  const handlePointerEnter = () => {
    setHovered(true);
    hoverNode(node.id);
    const canPlace = selectedPodId && !isFull;
    document.body.style.cursor = canPlace ? "pointer" : "default";
  };
  
  const handlePointerLeave = () => {
    setHovered(false);
    hoverNode(null);
    document.body.style.cursor = "default";
  };
  
  return (
    <group position={node.position}>
      <RoundedBox
        ref={meshRef}
        args={[5, 0.5, 4]}
        radius={0.1}
        smoothness={4}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <meshStandardMaterial
          color={isHighlighted && !isFull ? "#1e40af" : "#1e293b"}
          metalness={0.6}
          roughness={0.3}
        />
      </RoundedBox>
      
      <mesh position={[0, 0.26, 0]} ref={glowRef}>
        <boxGeometry args={[4.8, 0.02, 3.8]} />
        <meshStandardMaterial
          color={getStatusColor()}
          emissive={getStatusColor()}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <group position={[-2, 0.4, -1.5]}>
        {Array.from({ length: node.capacity }).map((_, i) => (
          <mesh key={i} position={[i * 0.4, 0, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.3]} />
            <meshStandardMaterial
              color={i < node.pods.length ? getStatusColor() : "#334155"}
              emissive={i < node.pods.length ? getStatusColor() : "#000"}
              emissiveIntensity={i < node.pods.length ? 0.5 : 0}
            />
          </mesh>
        ))}
      </group>
      
      <Text
        position={[0, 0.5, 1.5]}
        fontSize={0.3}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {node.name}
      </Text>
      
      <Text
        position={[0, 0.5, 1.1]}
        fontSize={0.2}
        color={getStatusColor()}
        anchorX="center"
        anchorY="middle"
      >
        {node.pods.length}/{node.capacity} pods
      </Text>

      <group position={[0, -0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
          <meshStandardMaterial
            color="#1e3a8a"
            emissive="#3b82f6"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[-1.5, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
          <meshStandardMaterial
            color="#1e3a8a"
            emissive="#3b82f6"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[1.5, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
          <meshStandardMaterial
            color="#1e3a8a"
            emissive="#3b82f6"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
      
      {[-2.6, 2.6].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 0]}>
          <boxGeometry args={[0.1, 0.2, 3.5]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.2}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
