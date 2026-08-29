"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

type PaneType = "fixed" | "sash" | "door";

type Window3DProps = {
  width: number;       // mm
  height: number;      // mm
  verticalDivisions: number;
  horizontalDivisions: number;
  frameThickness: number;
  paneTypes: Record<string, PaneType>;
  hDividerPos: number;
  vDividerPos: number;
  profileColor: string;
};

// Profile color mapping
const COLOR_MAP: Record<string, string> = {
  "Beyaz": "#f0f0f0",
  "Antrasit Gri": "#3a3a3a",
  "Altinmese": "#c49a3c",
  "Ceviz": "#5c3a1e",
  "Siyah": "#1a1a1a",
  "Mahogany": "#4a1c1c",
};

function WindowFrame({ width, height, verticalDivisions, horizontalDivisions, frameThickness, paneTypes, hDividerPos, vDividerPos, profileColor }: Window3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Convert mm to 3D units (1 unit = 100mm)
  const w = width / 1000;
  const h = height / 1000;
  const depth = 0.07; // frame depth
  const ft = frameThickness / 1000; // frame thickness
  const mullionW = 0.025; // mullion width
  
  const frameColor = COLOR_MAP[profileColor] || "#f0f0f0";
  
  // Calculate row heights and col widths as fractions
  const getRowFractions = (): number[] => {
    if (horizontalDivisions === 1) return [1];
    if (horizontalDivisions === 2) return [hDividerPos / 100, 1 - hDividerPos / 100];
    const first = hDividerPos / 100;
    const rest = (1 - first) / (horizontalDivisions - 1);
    return [first, ...Array(horizontalDivisions - 1).fill(rest)];
  };
  
  const getColFractions = (): number[] => {
    if (verticalDivisions === 1) return [1];
    if (verticalDivisions === 2) return [vDividerPos / 100, 1 - vDividerPos / 100];
    const first = vDividerPos / 100;
    const rest = (1 - first) / (verticalDivisions - 1);
    return [first, ...Array(verticalDivisions - 1).fill(rest)];
  };
  
  const rowFracs = getRowFractions();
  const colFracs = getColFractions();
  
  const innerW = w - ft * 2;
  const innerH = h - ft * 2;
  
  // Frame material
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: frameColor,
    roughness: 0.3,
    metalness: 0.1,
    envMapIntensity: 0.8,
  }), [frameColor]);
  
  // Glass material
  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#88ccff",
    transparent: true,
    opacity: 0.25,
    roughness: 0.05,
    metalness: 0.0,
    transmission: 0.9,
    thickness: 0.02,
    envMapIntensity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    ior: 1.5,
  }), []);

  // Sash frame material (slightly different tint)
  const sashMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: frameColor,
    roughness: 0.25,
    metalness: 0.15,
    envMapIntensity: 0.9,
  }), [frameColor]);

  // Handle material
  const handleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#c0c0c0",
    roughness: 0.2,
    metalness: 0.8,
  }), []);

  // Build geometry
  const elements: React.ReactNode[] = [];
  let key = 0;
  
  // Outer frame - 4 pieces
  // Top
  elements.push(
    <mesh key={key++} position={[0, h/2 - ft/2, 0]} material={frameMaterial}>
      <boxGeometry args={[w, ft, depth]} />
    </mesh>
  );
  // Bottom
  elements.push(
    <mesh key={key++} position={[0, -h/2 + ft/2, 0]} material={frameMaterial}>
      <boxGeometry args={[w, ft, depth]} />
    </mesh>
  );
  // Left
  elements.push(
    <mesh key={key++} position={[-w/2 + ft/2, 0, 0]} material={frameMaterial}>
      <boxGeometry args={[ft, h - ft*2, depth]} />
    </mesh>
  );
  // Right
  elements.push(
    <mesh key={key++} position={[w/2 - ft/2, 0, 0]} material={frameMaterial}>
      <boxGeometry args={[ft, h - ft*2, depth]} />
    </mesh>
  );

  // Vertical mullions
  if (verticalDivisions > 1) {
    let xOffset = -innerW / 2;
    for (let i = 0; i < verticalDivisions - 1; i++) {
      xOffset += innerW * colFracs[i];
      elements.push(
        <mesh key={key++} position={[xOffset, 0, 0]} material={frameMaterial}>
          <boxGeometry args={[mullionW, innerH, depth]} />
        </mesh>
      );
    }
  }

  // Horizontal mullions
  if (horizontalDivisions > 1) {
    let yOffset = innerH / 2;
    for (let i = 0; i < horizontalDivisions - 1; i++) {
      yOffset -= innerH * rowFracs[i];
      elements.push(
        <mesh key={key++} position={[0, yOffset, 0]} material={frameMaterial}>
          <boxGeometry args={[innerW, mullionW, depth]} />
        </mesh>
      );
    }
  }

  // Glass panes + sash frames + handles
  let yStart = innerH / 2;
  for (let r = 0; r < horizontalDivisions; r++) {
    const rowH = innerH * rowFracs[r];
    let xStart = -innerW / 2;
    
    for (let c = 0; c < verticalDivisions; c++) {
      const colW = innerW * colFracs[c];
      const cx = xStart + colW / 2;
      const cy = yStart - rowH / 2;
      const type = paneTypes[`${r}-${c}`] || "fixed";
      
      const gap = mullionW / 2 + 0.002;
      const paneW = colW - gap * 2;
      const paneH = rowH - gap * 2;

      // Glass
      elements.push(
        <mesh key={key++} position={[cx, cy, 0]} material={glassMaterial}>
          <planeGeometry args={[paneW, paneH]} />
        </mesh>
      );

      if (type === "sash") {
        // Sash sub-frame
        const sf = 0.012;
        const sfDepth = depth + 0.01;
        // Top
        elements.push(<mesh key={key++} position={[cx, cy + paneH/2 - sf/2, 0.005]} material={sashMaterial}><boxGeometry args={[paneW, sf, sfDepth]} /></mesh>);
        // Bottom
        elements.push(<mesh key={key++} position={[cx, cy - paneH/2 + sf/2, 0.005]} material={sashMaterial}><boxGeometry args={[paneW, sf, sfDepth]} /></mesh>);
        // Left
        elements.push(<mesh key={key++} position={[cx - paneW/2 + sf/2, cy, 0.005]} material={sashMaterial}><boxGeometry args={[sf, paneH, sfDepth]} /></mesh>);
        // Right
        elements.push(<mesh key={key++} position={[cx + paneW/2 - sf/2, cy, 0.005]} material={sashMaterial}><boxGeometry args={[sf, paneH, sfDepth]} /></mesh>);
        
        // Handle
        const mid = (verticalDivisions - 1) / 2;
        const handleX = c < mid ? cx + paneW/2 - 0.02 : cx - paneW/2 + 0.02;
        elements.push(
          <mesh key={key++} position={[handleX, cy, depth/2 + 0.01]} material={handleMaterial}>
            <boxGeometry args={[0.008, 0.04, 0.015]} />
          </mesh>
        );
      }

      if (type === "door") {
        // Door frame (thicker)
        const df = 0.018;
        const dfDepth = depth + 0.015;
        elements.push(<mesh key={key++} position={[cx, cy + paneH/2 - df/2, 0.005]} material={sashMaterial}><boxGeometry args={[paneW, df, dfDepth]} /></mesh>);
        elements.push(<mesh key={key++} position={[cx, cy - paneH/2 + df/2, 0.005]} material={sashMaterial}><boxGeometry args={[paneW, df, dfDepth]} /></mesh>);
        elements.push(<mesh key={key++} position={[cx - paneW/2 + df/2, cy, 0.005]} material={sashMaterial}><boxGeometry args={[df, paneH, dfDepth]} /></mesh>);
        elements.push(<mesh key={key++} position={[cx + paneW/2 - df/2, cy, 0.005]} material={sashMaterial}><boxGeometry args={[df, paneH, dfDepth]} /></mesh>);
        
        // Door panel (bottom 35%)
        const panelH = paneH * 0.35;
        elements.push(
          <mesh key={key++} position={[cx, cy - paneH/2 + df + panelH/2, 0.003]} material={sashMaterial}>
            <boxGeometry args={[paneW - df*2, panelH, depth * 0.6]} />
          </mesh>
        );
        
        // Door handle
        const mid2 = (verticalDivisions - 1) / 2;
        const dhX = c < mid2 ? cx + paneW/2 - 0.03 : cx - paneW/2 + 0.03;
        elements.push(
          <mesh key={key++} position={[dhX, cy - paneH * 0.05, depth/2 + 0.015]} material={handleMaterial}>
            <boxGeometry args={[0.01, 0.06, 0.018]} />
          </mesh>
        );
      }
      
      xStart += colW;
    }
    yStart -= rowH;
  }

  // Slow auto-rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {elements}
    </group>
  );
}

export default function Window3DViewer(props: Window3DProps) {
  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} color="#b0c4ff" />
        <pointLight position={[0, 2, 3]} intensity={0.6} color="#ffffff" />
        
        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* The Window */}
        <WindowFrame {...props} />

        {/* Floor shadow */}
        <ContactShadows
          position={[0, -(props.height / 2000) - 0.05, 0]}
          opacity={0.4}
          scale={3}
          blur={2.5}
          far={4}
        />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={1}
          maxDistance={5}
          autoRotate={false}
          makeDefault
        />
      </Canvas>
      
      {/* Overlay instructions */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full">
        <p className="text-[11px] text-slate-300 text-center">
          🖱️ Surukle: Dondur &nbsp;|&nbsp; Scroll: Yakınlastir
        </p>
      </div>
    </div>
  );
}
