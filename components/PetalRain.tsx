
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const SoapBubble = ({ position, rotation, scale, speed, color }: { position: THREE.Vector3, rotation: THREE.Euler, scale: number, speed: number, color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const driftRef = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Floating upwards
      meshRef.current.position.y += 0.015 * speed;
      
      // Gentle horizontal drift
      meshRef.current.position.x = position.x + Math.sin(t * 0.4 + driftRef.current) * 0.8;
      
      // Subtle rotation
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.z += 0.002;

      // Loop back to bottom when out of view
      if (meshRef.current.position.y > 15) {
        meshRef.current.position.y = -15;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.4}
        roughness={0.1}
        metalness={0.1}
        transmission={0.9}
        ior={1.2}
      />
    </mesh>
  );
};

export const Bubbles = ({ count = 40 }: { count?: number }) => {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Start from various heights, mostly from bottom half
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 35,
        (Math.random() - 1.0) * 15, 
        (Math.random() - 0.5) * 20
      );
      const rotation = new THREE.Euler();
      const scale = 0.3 + Math.random() * 0.7;
      const speed = 0.5 + Math.random() * 1.5;
      const colors = ['#A3E4D7', '#FADBD8', '#D6EAF8', '#EBDEF0', '#FFFFFF'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      temp.push({ position, rotation, scale, speed, color });
    }
    return temp;
  }, [count]);

  return (
    <group>
      {particles.map((p, i) => (
        <SoapBubble key={i} {...p} />
      ))}
    </group>
  );
};

export const PetalRain = React.memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-40" style={{ zIndex: 0 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} style={{ pointerEvents: 'none' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#FFF5F7" />
        <Bubbles count={40} />
      </Canvas>
    </div>
  );
});
