import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Center, PerspectiveCamera } from "@react-three/drei";
import { ItemCategory } from "../types";
import { Sparkles, RotateCw, ZoomIn, Eye, Layers, HelpCircle } from "lucide-react";
import * as THREE from "three";

// Map descriptive color strings to Hex colors for the 3D model
export function getHexColor(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  if (normalized.includes("red")) return "#EF4444";
  if (normalized.includes("blue") || normalized.includes("navy")) return "#3B82F6";
  if (normalized.includes("green")) return "#10B981";
  if (normalized.includes("yellow") || normalized.includes("gold") || normalized.includes("amber")) return "#F59E0B";
  if (normalized.includes("orange")) return "#F97316";
  if (normalized.includes("purple") || normalized.includes("violet") || normalized.includes("plum")) return "#8B5CF6";
  if (normalized.includes("pink")) return "#EC4899";
  if (normalized.includes("grey") || normalized.includes("gray") || normalized.includes("silver") || normalized.includes("space")) return "#94A3B8";
  if (normalized.includes("black") || normalized.includes("dark") || normalized.includes("charcoal")) return "#1E293B";
  if (normalized.includes("white") || normalized.includes("light") || normalized.includes("cream")) return "#F8FAFC";
  if (normalized.includes("brown") || normalized.includes("tan") || normalized.includes("beige")) return "#78350F";
  
  // Deterministic fallback based on string hashing
  let hash = 0;
  for (let i = 0; i < colorName.length; i++) {
    hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "000000".substring(0, 6 - c.length) + c;
}

// Subcomponent to select proper material
function ItemMaterial({ color, materialType }: { color: string; materialType: "glass" | "metal" | "hologram" | "matte" }) {
  if (materialType === "glass") {
    return (
      <meshPhysicalMaterial
        color={color}
        roughness={0.1}
        metalness={0.1}
        transparent={true}
        opacity={0.65}
        transmission={0.9}
        thickness={1.5}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    );
  }
  if (materialType === "metal") {
    return (
      <meshStandardMaterial
        color={color}
        roughness={0.25}
        metalness={0.9}
      />
    );
  }
  if (materialType === "hologram") {
    return (
      <meshBasicMaterial
        color="#a855f7"
        wireframe={true}
        transparent={true}
        opacity={0.8}
      />
    );
  }
  // Matte plastic default
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.7}
      metalness={0.1}
    />
  );
}

// Laptop / Smartphone Assembly for ELECTRONICS
function ElectronicsModel({ color, materialType }: { color: string; materialType: "glass" | "metal" | "hologram" | "matte" }) {
  return (
    <group>
      {/* Laptop Base */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.08, 1.4]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>
      
      {/* Keyboard area detail (only visible on non-wireframe) */}
      {materialType !== "hologram" && (
        <mesh position={[0, -0.15, 0.1]}>
          <boxGeometry args={[1.6, 0.01, 0.7]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      )}

      {/* Laptop Screen (tilted up slightly) */}
      <group position={[0, -0.16, -0.68]} rotation={[0.4, 0, 0]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[2.0, 1.3, 0.06]} />
          <ItemMaterial color={color} materialType={materialType} />
        </mesh>
        
        {/* Screen Bezel / Glass Panel */}
        {materialType !== "hologram" && (
          <mesh position={[0, 0.65, 0.035]}>
            <boxGeometry args={[1.88, 1.18, 0.01]} />
            <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.2} />
          </mesh>
        )}
      </group>
    </group>
  );
}

// Book Assembly for BOOKS
function BookModel({ color, materialType }: { color: string; materialType: "glass" | "metal" | "hologram" | "matte" }) {
  return (
    <group>
      {/* Main Cover */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 1.7, 0.35]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>
      
      {/* Book Spine Edge (left rounded detail) */}
      <mesh position={[-0.6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.175, 0.175, 1.7, 16]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>

      {/* Book Paper Pages Block (slightly indented) */}
      {materialType !== "hologram" && (
        <mesh position={[0.05, 0, 0]}>
          <boxGeometry args={[1.05, 1.62, 0.28]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ID Card Assembly for ID_CARDS
function IDCardModel({ color, materialType }: { color: string; materialType: "glass" | "metal" | "hologram" | "matte" }) {
  return (
    <group rotation={[0.2, 0, 0]}>
      {/* Card Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.0, 1.2, 0.04]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>

      {/* Magnetic Stripe detail */}
      {materialType !== "hologram" && (
        <mesh position={[0, 0.3, -0.021]}>
          <boxGeometry args={[2.0, 0.22, 0.005]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      )}

      {/* Hologram/Photo placeholder details */}
      {materialType !== "hologram" && (
        <group>
          {/* Photo area */}
          <mesh position={[-0.55, -0.15, 0.021]}>
            <boxGeometry args={[0.55, 0.65, 0.005]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          {/* Chip area */}
          <mesh position={[0.55, 0.1, 0.021]}>
            <boxGeometry args={[0.3, 0.25, 0.005]} />
            <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Wallet Assembly for WALLETS
function WalletModel({ color, materialType }: { color: string; materialType: "glass" | "metal" | "hologram" | "matte" }) {
  return (
    <group>
      {/* Folded Wallet main block */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 1.0, 0.45]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>

      {/* Metal Clasp / Button detail */}
      {materialType !== "hologram" && (
        <mesh position={[0.4, 0, 0.23]} rotation={[1.57, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.03, 16]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.9} />
        </mesh>
      )}
    </group>
  );
}

// Key Ring / Fob Assembly for KEYS
function KeysModel({ color, materialType }: { color: string; materialType: "glass" | "metal" | "hologram" | "matte" }) {
  return (
    <group>
      {/* Metal split ring */}
      <mesh position={[0, 0.3, 0]} rotation={[1.57, 0, 0]} castShadow>
        <torusGeometry args={[0.5, 0.06, 12, 32]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Key Fob fob block */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.9, 0.16]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>

      {/* Metallic Key Blade dangling down */}
      <group position={[0.3, -0.1, 0.05]} rotation={[0, 0, -0.5]}>
        <mesh position={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[0.12, 1.0, 0.03]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// Clothing Assembly (Folded sweater / T-Shirt shape) for CLOTHING
function ClothingModel({ color, materialType }: { color: string; materialType: "glass" | "metal" | "hologram" | "matte" }) {
  return (
    <group>
      {/* Main folded body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.3, 1.3, 0.5]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>

      {/* Sleeves details on sides */}
      <mesh position={[-0.75, 0.1, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.4, 1.0, 0.45]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>
      
      <mesh position={[0.75, 0.1, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.4, 1.0, 0.45]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>
    </group>
  );
}

// Accessories Assembly (Sunglasses shape) for ACCESSORIES
function AccessoriesModel({ color, materialType }: { color: string; materialType: "glass" | "metal" | "hologram" | "matte" }) {
  return (
    <group rotation={[0.2, 0, 0]}>
      {/* Left Frame Rim */}
      <mesh position={[-0.45, 0, 0]} castShadow>
        <torusGeometry args={[0.32, 0.06, 8, 24]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>

      {/* Right Frame Rim */}
      <mesh position={[0.45, 0, 0]} castShadow>
        <torusGeometry args={[0.32, 0.06, 8, 24]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>

      {/* Bridge connecting rims */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.3, 0.06, 0.06]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>

      {/* Left Temple (arm going back on Z) */}
      <mesh position={[-0.75, 0, -0.45]} rotation={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[0.04, 0.06, 0.9]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>

      {/* Right Temple (arm going back on Z) */}
      <mesh position={[0.75, 0, -0.45]} rotation={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.04, 0.06, 0.9]} />
        <ItemMaterial color={color} materialType={materialType} />
      </mesh>
    </group>
  );
}

// 3D Polyhedral geometry placeholder for OTHERS / Fallback
function OthersModel({ color, materialType }: { color: string; materialType: "glass" | "metal" | "hologram" | "matte" }) {
  return (
    <mesh castShadow receiveShadow>
      <icosahedronGeometry args={[0.9, 1]} />
      <ItemMaterial color={color} materialType={materialType} />
    </mesh>
  );
}

// Component that switches mesh assemblies based on category
function ModelSelector({ category, color, materialType }: { category: ItemCategory; color: string; materialType: "glass" | "metal" | "hologram" | "matte" }) {
  switch (category) {
    case "ELECTRONICS":
      return <ElectronicsModel color={color} materialType={materialType} />;
    case "BOOKS":
      return <BookModel color={color} materialType={materialType} />;
    case "ID_CARDS":
      return <IDCardModel color={color} materialType={materialType} />;
    case "WALLETS":
      return <WalletModel color={color} materialType={materialType} />;
    case "KEYS":
      return <KeysModel color={color} materialType={materialType} />;
    case "CLOTHING":
      return <ClothingModel color={color} materialType={materialType} />;
    case "ACCESSORIES":
      return <AccessoriesModel color={color} materialType={materialType} />;
    default:
      return <OthersModel color={color} materialType={materialType} />;
  }
}

// Subcomponent to trigger automatic rotation on the inner assembly
function AutoRotatingGroup({ autoRotate, children }: { autoRotate: boolean; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
}

interface ItemPreview3DProps {
  category: ItemCategory;
  colorName: string;
  itemName: string;
  compact?: boolean;
}

export default function ItemPreview3D({ category, colorName, itemName, compact = false }: ItemPreview3DProps) {
  const [materialType, setMaterialType] = useState<"glass" | "metal" | "hologram" | "matte">("glass");
  const [autoRotate, setAutoRotate] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);
  const hexColor = getHexColor(colorName);

  // Check if WebGL is available to prevent runtime Canvas crashes
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

  if (compact) {
    return (
      <div className="w-full h-full relative select-none">
        {webglSupported ? (
          <Canvas shadows className="w-full h-full">
            <PerspectiveCamera makeDefault position={[0, 0, 3.2]} fov={50} />
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={2} castShadow />
            <directionalLight position={[-5, 8, -5]} intensity={1.0} />
            
            <Center>
              <AutoRotatingGroup autoRotate={true}>
                <ModelSelector category={category} color={hexColor} materialType="glass" />
              </AutoRotatingGroup>
            </Center>
            
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              minDistance={2} 
              maxDistance={5}
              autoRotate={false}
            />
          </Canvas>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-2 bg-slate-950/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-mono mt-1">{category}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-panel border border-white/10 rounded-[28px] overflow-hidden p-5 flex flex-col justify-between h-[450px] relative shadow-2xl bg-gradient-to-b from-[#0F172A]/40 to-[#020617]/80">
      
      {/* Technical Header Controls overlay */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3.5 z-10">
        <div>
          <span className="text-[10px] font-extrabold text-blue-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
            3D HOLOGRAPHIC RENDERER
          </span>
          <h4 className="font-extrabold text-white text-xs mt-0.5 truncate max-w-[210px]">{itemName}</h4>
        </div>

        {/* Rotation toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-xl border cursor-pointer transition-all ${autoRotate ? "bg-blue-600/20 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]" : "bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300"}`}
          title="Toggle Auto-Rotate"
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "4s" }} />
        </button>
      </div>

      {/* Styled Canvas Area */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center my-2 select-none">
        {webglSupported ? (
          <div className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing">
            <Canvas shadows className="w-full h-full">
              <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
              <ambientLight intensity={1.5} />
              <pointLight position={[10, 10, 10]} intensity={2.5} castShadow />
              <directionalLight position={[-5, 8, -5]} intensity={1.2} />
              
              <Center>
                <AutoRotatingGroup autoRotate={autoRotate}>
                  <ModelSelector category={category} color={hexColor} materialType={materialType} />
                </AutoRotatingGroup>
              </Center>
              
              <OrbitControls 
                enableZoom={true} 
                enablePan={false} 
                minDistance={2.5} 
                maxDistance={6}
                autoRotate={false}
              />
            </Canvas>
          </div>
        ) : (
          /* Robust elegant CSS-animated 3D card fallback in case WebGL fails / is disabled */
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30 animate-spin" style={{ animationDuration: "16s" }}></div>
              <div className="absolute inset-2 rounded-full border border-blue-500/20 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }}></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center shadow-lg transform hover:rotate-12 transition-all duration-500">
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">SIMULATION LIVE</span>
              <p className="text-xs text-slate-300 font-mono">WebGL limits detected: Vector map render fallback active.</p>
              <span className="text-[9px] text-slate-500 font-mono">Properties: {category} | {colorName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Cyber material switcher footer controls */}
      <div className="border-t border-white/5 pt-3.5 mt-auto z-10 flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-500 uppercase font-extrabold">VECTOR COLOR:</span>
          <span className="text-white flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/20" style={{ backgroundColor: hexColor }}></span>
            {hexColor} ({colorName})
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/5 shadow-inner">
          <button
            onClick={() => setMaterialType("glass")}
            className={`flex-1 text-[9px] font-extrabold font-mono py-1.5 rounded-lg transition-all cursor-pointer ${materialType === "glass" ? "bg-blue-600/20 text-blue-300 border border-blue-500/25" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}
          >
            GLASS
          </button>
          <button
            onClick={() => setMaterialType("metal")}
            className={`flex-1 text-[9px] font-extrabold font-mono py-1.5 rounded-lg transition-all cursor-pointer ${materialType === "metal" ? "bg-blue-600/20 text-blue-300 border border-blue-500/25" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}
          >
            METAL
          </button>
          <button
            onClick={() => setMaterialType("hologram")}
            className={`flex-1 text-[9px] font-extrabold font-mono py-1.5 rounded-lg transition-all cursor-pointer ${materialType === "hologram" ? "bg-blue-600/20 text-blue-300 border border-blue-500/25" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}
          >
            HOLOGRAM
          </button>
          <button
            onClick={() => setMaterialType("matte")}
            className={`flex-1 text-[9px] font-extrabold font-mono py-1.5 rounded-lg transition-all cursor-pointer ${materialType === "matte" ? "bg-blue-600/20 text-blue-300 border border-blue-500/25" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}
          >
            MATTE
          </button>
        </div>
      </div>

    </div>
  );
}
