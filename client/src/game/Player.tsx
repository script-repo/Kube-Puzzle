import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

enum Controls {
  forward = "forward",
  backward = "backward",
  left = "left",
  right = "right",
}

export function Player() {
  const meshRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const [, getKeys] = useKeyboardControls();
  
  const SPEED = 8;
  const DAMPING = 0.9;
  const BOUNDS = { x: 15, z: 20 };
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    const keys = getKeys();
    const direction = new THREE.Vector3();
    
    if (keys.forward) direction.z -= 1;
    if (keys.backward) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;
    
    if (direction.length() > 0) {
      direction.normalize();
      velocity.current.x += direction.x * SPEED * delta;
      velocity.current.z += direction.z * SPEED * delta;
    }
    
    velocity.current.multiplyScalar(DAMPING);
    
    meshRef.current.position.x += velocity.current.x;
    meshRef.current.position.z += velocity.current.z;
    
    meshRef.current.position.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, meshRef.current.position.x));
    meshRef.current.position.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, meshRef.current.position.z));
    
    if (velocity.current.length() > 0.01) {
      const targetRotation = Math.atan2(velocity.current.x, velocity.current.z);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation,
        0.1
      );
    }
  });
  
  return (
    <group ref={meshRef} position={[0, 0.5, 10]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#4f46e5"
          emissiveIntensity={0.3}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
      
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={[0.12, 0.55, 0.15]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[-0.12, 0.55, 0.15]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.3]} />
        <meshStandardMaterial
          color="#1e293b"
          emissive="#3b82f6"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <pointLight
        position={[0, 1, 0]}
        color="#6366f1"
        intensity={0.5}
        distance={3}
      />
    </group>
  );
}
