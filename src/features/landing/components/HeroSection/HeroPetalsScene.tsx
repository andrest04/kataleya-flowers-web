"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useRef, useState } from "react";
import * as THREE from "three";

const PETAL_COUNT = 48;

/**
 * Lee la paleta de marca desde las CSS custom properties para mantener
 * `src/lib/constants.ts` y `globals.css` como única fuente de verdad.
 */
function readBrandPalette(): THREE.Color[] {
  if (typeof window === "undefined") {
    return [new THREE.Color("#c0392b")];
  }
  const css = getComputedStyle(document.documentElement);
  const primary = css.getPropertyValue("--color-primary").trim() || "#c0392b";
  const secondary =
    css.getPropertyValue("--color-secondary").trim() || "#e8b84b";
  const cream = css.getPropertyValue("--color-cream").trim() || "#fdfcfa";

  const base = new THREE.Color(primary);
  const gold = new THREE.Color(secondary);
  const creamCol = new THREE.Color(cream);

  // Derivamos pétalos rosados/melocotón desde el rojo de marca + crema.
  const blush = base.clone().lerp(creamCol, 0.55);
  const peach = base.clone().lerp(gold, 0.45).lerp(creamCol, 0.3);

  return [base, gold, creamCol, blush, peach];
}

/**
 * Geometría de pétalo construida con bézier — silueta de gota asimétrica.
 */
function buildPetalGeometry(): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.55, 0.18, 0.48, 1.15, 0, 1.55);
  shape.bezierCurveTo(-0.48, 1.15, -0.55, 0.18, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 28);
  geo.translate(0, -0.78, 0);
  return geo;
}

interface PetalState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  rotSpeed: THREE.Vector3;
  fallSpeed: number;
  driftFreq: number;
  driftAmp: number;
  driftPhase: number;
  scale: number;
}

function buildInitialPetals(): PetalState[] {
  return Array.from({ length: PETAL_COUNT }, () => ({
    position: new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      Math.random() * 14 + 2,
      (Math.random() - 0.5) * 9 - 1.5,
    ),
    rotation: new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    ),
    rotSpeed: new THREE.Vector3(
      (Math.random() - 0.5) * 0.45,
      (Math.random() - 0.5) * 0.6,
      (Math.random() - 0.5) * 0.35,
    ),
    fallSpeed: 0.22 + Math.random() * 0.38,
    driftFreq: 0.25 + Math.random() * 0.65,
    driftAmp: 0.35 + Math.random() * 0.95,
    driftPhase: Math.random() * Math.PI * 2,
    scale: 0.22 + Math.random() * 0.5,
  }));
}

// Fuera del árbol de React: Three.js muta Vector3/Euler/Object3D cada frame
// por performance y `react-hooks/immutability` no permite eso sobre estado.
const PETALS: PetalState[] = buildInitialPetals();
const DUMMY = new THREE.Object3D();

function Petals() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [geometry] = useState(() => buildPetalGeometry());

  const colorsApplied = useRef(false);
  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!colorsApplied.current) {
      const palette = readBrandPalette();
      for (let i = 0; i < PETAL_COUNT; i++) {
        const c = palette[Math.floor(Math.random() * palette.length)];
        mesh.setColorAt(i, c);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      colorsApplied.current = true;
    }

    const t = state.clock.elapsedTime;
    for (let i = 0; i < PETALS.length; i++) {
      const p = PETALS[i];
      p.position.y -= p.fallSpeed * delta;
      p.position.x +=
        Math.sin(t * p.driftFreq + p.driftPhase) * p.driftAmp * delta * 0.55;
      p.rotation.x += p.rotSpeed.x * delta;
      p.rotation.y += p.rotSpeed.y * delta;
      p.rotation.z += p.rotSpeed.z * delta;

      if (p.position.y < -9) {
        p.position.y = 10 + Math.random() * 5;
        p.position.x = (Math.random() - 0.5) * 20;
      }

      DUMMY.position.copy(p.position);
      DUMMY.rotation.copy(p.rotation);
      DUMMY.scale.setScalar(p.scale);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, PETAL_COUNT]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        side={THREE.DoubleSide}
        transparent
        opacity={0.88}
        roughness={0.65}
        metalness={0.08}
      />
    </instancedMesh>
  );
}

export default function HeroPetalsScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 6, 5]} intensity={0.95} />
      <directionalLight
        position={[-5, -3, 3]}
        intensity={0.35}
        color="#e8b84b"
      />
      <Petals />
      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.45}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.32} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
