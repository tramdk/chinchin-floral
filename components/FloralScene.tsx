
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const Flower = ({ position, color, speed = 1, scale = 1, mouseRef }: { 
  position: [number, number, number]; 
  color: string; 
  speed?: number; 
  scale?: number;
  mouseRef: React.MutableRefObject<THREE.Vector2>;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create 5 petals array
  const petals = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      rotation: (i / 5) * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Floating motion
      groupRef.current.position.y = position[1] + Math.sin(t * speed + position[0]) * 0.4;
      
      // Parallax effect following mouse
      const targetRotationX = mouseRef.current.y * 0.5;
      const targetRotationY = mouseRef.current.x * 0.5;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);

      // Rotation around axis
      groupRef.current.rotation.z += 0.01 * speed;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <Sphere args={[0.3, 32, 32]}>
        <meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.1} emissive="#C5A059" emissiveIntensity={0.1} />
      </Sphere>

      {petals.map((petal, i) => (
        <group key={i} rotation={[0, 0, petal.rotation]}>
          <mesh position={[0.6, 0, 0]}>
            <Sphere args={[0.7, 32, 32]} scale={[1.2, 0.6, 0.1]}>
              <MeshDistortMaterial
                color={color}
                speed={speed * 1.5}
                distort={0.3}
                radius={1}
                roughness={0.2}
                metalness={0.1}
              />
            </Sphere>
          </mesh>
        </group>
      ))}
    </group>
  );
};

const MiniPetal = ({ position, color, scale }: { position: [number, number, number], color: string, scale: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const randomSpeed = useMemo(() => 0.05 + Math.random() * 0.1, []);
  const randomOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const initialRotation = useMemo(() => new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI), []);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.position.y = position[1] + Math.sin(t * randomSpeed + randomOffset) * 0.3;
      ref.current.rotation.x += 0.005;
      ref.current.rotation.y += 0.003;
      ref.current.rotation.z += 0.008;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale} rotation={initialRotation}>
      <sphereGeometry args={[0.5, 24, 24]} />
      <MeshDistortMaterial 
        color={color} 
        transparent 
        opacity={0.4} 
        roughness={0.2} 
        speed={2} 
        distort={0.4} 
        radius={1}
        scale={[1, 0.5, 0.1]}
      />
    </mesh>
  );
};

const FloatingPetals = ({ count = 25 }: { count?: number }) => {
  const petals = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15
      ] as [number, number, number],
      color: Math.random() > 0.5 ? '#D88C9A' : '#FDF0F3',
      scale: 0.2 + Math.random() * 0.4
    }));
  }, [count]);

  return (
    <group>
      {petals.map((p, i) => (
        <MiniPetal key={i} {...p} />
      ))}
    </group>
  );
};

export const FloralScene = React.memo(() => {
  const mouse = useRef(new THREE.Vector2(0, 0));

  const handleMouseMove = (event: React.MouseEvent | MouseEvent) => {
    // Normalize mouse coordinates to [-1, 1]
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 z-0 opacity-70 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} style={{ pointerEvents: 'none' }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#D88C9A" />
        <spotLight position={[-10, 20, 10]} angle={0.3} penumbra={1} intensity={3} color="#FFFFFF" castShadow />
        
        {/* Main Central Flower */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <Flower mouseRef={mouse} position={[0, 0.5, 0]} color="#D88C9A" scale={1.4} speed={0.3} />
        </Float>
        
        {/* Surrounding floating elements */}
        <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
           <Flower mouseRef={mouse} position={[-6, 4, -4]} color="#FFD1DC" scale={0.7} speed={0.6} />
           <Flower mouseRef={mouse} position={[7, -1, -5]} color="#FDF0F3" scale={0.9} speed={0.5} />
           <Flower mouseRef={mouse} position={[-4, -5, 3]} color="#D88C9A" scale={0.5} speed={0.9} />
           <Flower mouseRef={mouse} position={[5, 5, -3]} color="#C5A059" scale={0.4} speed={0.4} />
           <Flower mouseRef={mouse} position={[-8, -2, -2]} color="#708D81" scale={0.3} speed={0.8} />
        </Float>

        <FloatingPetals count={30} />
        <Sparkles count={40} scale={15} size={2} speed={0.2} opacity={0.4} color="#D88C9A" />

        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <ringGeometry args={[5, 5.05, 64]} />
          <meshStandardMaterial color="#D88C9A" transparent opacity={0.05} />
        </mesh>

        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
});
