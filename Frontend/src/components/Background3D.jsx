import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = ({ isExamActive }) => {
  const pointsRef = useRef();

  // Generate 5000 random particles inside a sphere
  const particlesCount = 5000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      // Random position inside a sphere
      const r = 15 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Slow down rotation when exam is active
      const speed = isExamActive ? 0.02 : 0.1;
      pointsRef.current.rotation.y -= delta * speed;
      pointsRef.current.rotation.x -= delta * (speed / 2);
    }
  });

  // Dim colors during exam
  const particleColor = isExamActive ? '#4a5568' : '#7BB2D9';
  const particleSize = isExamActive ? 0.03 : 0.05;

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={particleColor}
        size={particleSize}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

export default function Background3D({ isExamActive }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      pointerEvents: 'none',
      background: 'var(--gradient-bg)', // Use the application's gradient behind particles
      transition: 'background 1s ease-in-out'
    }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ParticleField isExamActive={isExamActive} />
      </Canvas>
    </div>
  );
}
