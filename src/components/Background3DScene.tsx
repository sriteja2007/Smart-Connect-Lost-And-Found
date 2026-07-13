import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Animated drifting particles component
function FuturisticParticles({ count = 200 }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random positions and velocities for particles
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Position particles in a large space
      pos[i * 3] = (Math.random() - 0.5) * 12; // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4; // Z

      // Micro drift velocities
      vels[i * 3] = (Math.random() - 0.5) * 0.015;
      vels[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }
    return [pos, vels];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      // Apply velocity drift
      positionsArray[i * 3] += velocities[i * 3];
      positionsArray[i * 3 + 1] += velocities[i * 3 + 1];
      positionsArray[i * 3 + 2] += velocities[i * 3 + 2];

      // Add a subtle wave/sinusoidal perturbation
      positionsArray[i * 3 + 1] += Math.sin(time + positionsArray[i * 3]) * 0.001;

      // Wrap around bounds so particles stay in frame
      if (Math.abs(positionsArray[i * 3]) > 7) velocities[i * 3] *= -1;
      if (Math.abs(positionsArray[i * 3 + 1]) > 7) velocities[i * 3 + 1] *= -1;
      if (positionsArray[i * 3 + 2] > 2 || positionsArray[i * 3 + 2] < -12) velocities[i * 3 + 2] *= -1;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate the overall system extremely slowly
    pointsRef.current.rotation.y = time * 0.012;
    pointsRef.current.rotation.x = time * 0.006;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a855f7"
        size={0.035}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Aurora soft glowing gradient mesh component
function AuroraGradientBlob({ color, speed = 1, scale = 1, position = [0, 0, 0] }: { color: string; speed?: number; scale?: number; position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speed;
    
    // Smooth floating drift motion
    meshRef.current.position.x = position[0] + Math.sin(time * 0.4) * 1.5;
    meshRef.current.position.y = position[1] + Math.cos(time * 0.3) * 1.2;
    meshRef.current.position.z = position[2] + Math.sin(time * 0.2) * 1.0;
    
    // Rotate slightly
    meshRef.current.rotation.x = time * 0.1;
    meshRef.current.rotation.y = time * 0.15;
  });

  return (
    <mesh ref={meshRef} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial 
        color={color} 
        transparent={true} 
        opacity={0.11} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Background3DScene() {
  const [webglSupported, setWebglSupported] = useState(true);

  // Safely check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const support = !!(
        window.WebGLRenderingContext && 
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setWebglSupported(support);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    // Beautiful pure CSS fallback for system constraints
    return (
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#020617]">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/10 blur-[140px] animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[130px] animate-pulse" style={{ animationDuration: "18s" }} />
        <div className="absolute top-[40%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/5 blur-[120px] animate-pulse" style={{ animationDuration: "15s" }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none bg-[#020617]">
      {/* Dark vignette to focus content */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-10" />

      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} className="w-full h-full">
        <ambientLight intensity={1.5} />
        
        {/* Soft floating colored lights to construct Aurora-style ambient backlighting */}
        <pointLight position={[-10, -10, -10]} intensity={2.5} color="#3b82f6" />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#a855f7" />
        <pointLight position={[0, -5, 5]} intensity={1.5} color="#06b6d4" />

        {/* Floating gradient aurora blobs */}
        <AuroraGradientBlob color="#3b82f6" speed={0.5} scale={3.2} position={[-2.5, 1.5, -4]} />
        <AuroraGradientBlob color="#a855f7" speed={0.4} scale={3.5} position={[2.5, -1.5, -4]} />
        <AuroraGradientBlob color="#06b6d4" speed={0.6} scale={2.8} position={[0.5, 2.0, -5]} />
        <AuroraGradientBlob color="#ec4899" speed={0.3} scale={2.5} position={[-1.5, -2.0, -3.5]} />

        {/* Futuristic particles */}
        <FuturisticParticles count={250} />
      </Canvas>
    </div>
  );
}
