import React, { useState } from "react";
import { MapPin, ZoomIn, ZoomOut, Eye, Sparkles, AlertTriangle, Layers, Info, Compass, Cpu } from "lucide-react";
import { ItemCategory } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface InteractiveMapProps {
  lostItems: any[];
  foundItems: any[];
}

interface CampusBuilding {
  name: string;
  x: number; // percentage
  y: number; // percentage
  w: number; // percentage width
  h: number; // percentage height
  color: string;
  label: string;
}

export default function InteractiveMap({ lostItems, foundItems }: InteractiveMapProps) {
  const [mapOverlay, setMapOverlay] = useState<"ALL" | "LOST" | "FOUND" | "HEATMAP">("ALL");
  const [hoveredPin, setHoveredPin] = useState<any | null>(null);

  // Pre-defined key campus buildings for the stylized vector map
  const buildings: CampusBuilding[] = [
    { name: "Engineering Library", x: 10, y: 15, w: 25, h: 20, color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300", label: "Engineering Quad & Library" },
    { name: "Student Union", x: 45, y: 10, w: 30, h: 25, color: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300", label: "Student Union & Cafeteria" },
    { name: "Science Hall", x: 15, y: 55, w: 22, h: 28, color: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300", label: "Science & Lab Halls" },
    { name: "Central Fountain Plaza", x: 48, y: 50, w: 16, h: 16, color: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-300 rounded-full", label: "Fountain Plaza" },
    { name: "Campus Gym", x: 70, y: 45, w: 22, h: 22, color: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300", label: "Recreation & Gym" },
    { name: "Quad Parking Lot", x: 40, y: 75, w: 45, h: 18, color: "bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/30 text-slate-300", label: "Parking Lots" }
  ];

  // Map coordinates plotter based on location name mapping
  const getCoordinates = (locationName: string, idHash: string): { x: number; y: number } => {
    const loc = locationName.toLowerCase();
    
    // Hash-based deterministic offset to avoid absolute overlaps
    const charSum = idHash ? idHash.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) : 0;
    const offsetX = (charSum % 10) - 5; // -5% to +5%
    const offsetY = ((charSum >> 2) % 10) - 5;

    if (loc.includes("library") || loc.includes("engineering")) {
      return { x: 20 + offsetX, y: 25 + offsetY };
    }
    if (loc.includes("union") || loc.includes("cafeteria") || loc.includes("desk")) {
      return { x: 60 + offsetX, y: 20 + offsetY };
    }
    if (loc.includes("science") || loc.includes("lab") || loc.includes("hall c")) {
      return { x: 26 + offsetX, y: 68 + offsetY };
    }
    if (loc.includes("fountain") || loc.includes("plaza") || loc.includes("sidewalk")) {
      return { x: 56 + offsetX, y: 58 + offsetY };
    }
    if (loc.includes("gym") || loc.includes("recreation") || loc.includes("locker")) {
      return { x: 80 + offsetX, y: 56 + offsetY };
    }
    if (loc.includes("parking") || loc.includes("quad") || loc.includes("lot")) {
      return { x: 65 + offsetX, y: 84 + offsetY };
    }
    
    // Centered default coordinates
    return { x: 45 + (charSum % 15), y: 40 + ((charSum >> 3) % 15) };
  };

  // Compile active loss coordinates
  const lostPins = lostItems.map(item => ({
    ...item,
    type: "LOST",
    color: "bg-amber-500 border-amber-400 ring-amber-500/35",
    ...getCoordinates(item.lastSeenLocation, item.id)
  }));

  // Compile active found coordinates
  const foundPins = foundItems.map(item => ({
    ...item,
    type: "FOUND",
    color: "bg-blue-500 border-blue-400 ring-blue-500/35",
    ...getCoordinates(item.foundLocation, item.id)
  }));

  // Display map pins according to filters
  const visiblePins = [
    ...(mapOverlay === "ALL" || mapOverlay === "LOST" ? lostPins : []),
    ...(mapOverlay === "ALL" || mapOverlay === "FOUND" ? foundPins : [])
  ];

  // Pre-defined incident coordinates for high-risk zones overlay heatmap
  const hotspots = [
    { name: "Student Union Cafeteria", x: 60, y: 22, intensity: "bg-red-500/20 w-32 h-32 shadow-[0_0_40px_rgba(239,68,68,0.2)]" },
    { name: "Engineering Library 3rd Floor", x: 18, y: 20, intensity: "bg-rose-500/15 w-24 h-24 shadow-[0_0_30px_rgba(244,63,94,0.15)]" },
    { name: "Rec Gym Locker Rooms", x: 81, y: 58, intensity: "bg-red-500/15 w-28 h-28 shadow-[0_0_35px_rgba(239,68,68,0.15)]" }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-100">
      
      {/* Title Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 rounded-[28px] border border-white/10 shadow-lg"
      >
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-mono uppercase flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400" />
            Interactive Coordinate Mesh
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Overlay popular high-risk incident heatmaps, lost/found pins, and secure collection centers.</p>
        </div>
        
        {/* Filter Overlay */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setMapOverlay("ALL")}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider transition-all cursor-pointer border ${mapOverlay === "ALL" ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:border-white/10"}`}
          >
            ALL COORDS
          </button>
          <button 
            onClick={() => setMapOverlay("LOST")}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider transition-all cursor-pointer border ${mapOverlay === "LOST" ? "bg-amber-500/20 border-amber-500/30 text-amber-300 shadow-lg" : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:border-white/10"}`}
          >
            LOST PINS
          </button>
          <button 
            onClick={() => setMapOverlay("FOUND")}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider transition-all cursor-pointer border ${mapOverlay === "FOUND" ? "bg-blue-500/20 border-blue-500/30 text-blue-300 shadow-lg" : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:border-white/10"}`}
          >
            FOUND PINS
          </button>
          <button 
            onClick={() => setMapOverlay("HEATMAP")}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider transition-all cursor-pointer border ${mapOverlay === "HEATMAP" ? "bg-red-500/20 border-red-500/30 text-red-300 shadow-lg" : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:border-white/10"}`}
          >
            INCIDENT HEATMAP
          </button>
        </div>
      </motion.div>

      {/* Main Map Box */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Styled Vector Map Panel (Left 3 columns) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-3 bg-slate-950 border border-white/10 rounded-[28px] overflow-hidden relative shadow-inner h-[500px]"
        >
          {/* Subtle scanning lines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-30"></div>
          
          {/* Heatmap Overlay */}
          {(mapOverlay === "ALL" || mapOverlay === "HEATMAP") && hotspots.map((hs, i) => (
            <div 
              key={i} 
              className={`absolute rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-pulse ${hs.intensity}`}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
            ></div>
          ))}

          {/* Stylized Buildings Grid */}
          {buildings.map((b, i) => (
            <div
              key={i}
              className={`absolute border border-dashed p-3.5 flex flex-col justify-between transition-all duration-300 ${b.color} rounded-2xl`}
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
            >
              <span className="text-[8px] font-extrabold font-mono tracking-widest opacity-40">GRID SEC-0{i + 1}</span>
              <span className="text-xs font-extrabold tracking-tight leading-tight block">{b.name}</span>
            </div>
          ))}

          {/* Map Grid Guidelines */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none opacity-[0.05]">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border border-white"></div>
            ))}
          </div>

          {/* Coordinates Pins */}
          {mapOverlay !== "HEATMAP" && visiblePins.map((pin, i) => (
            <button
              key={i}
              onMouseEnter={() => setHoveredPin(pin)}
              onMouseLeave={() => setHoveredPin(null)}
              onClick={() => setHoveredPin(pin)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border-2 border-slate-950 cursor-pointer ring-4 transition-all duration-300 hover:scale-125 z-20 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] ${pin.color}`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            ></button>
          ))}

          {/* Pin Hover Overlay Detail Popovers */}
          <AnimatePresence>
            {hoveredPin && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute bg-slate-900/95 backdrop-blur-md text-white p-4.5 rounded-2xl shadow-2xl w-64 z-30 pointer-events-none text-xs border border-white/10 transform -translate-x-1/2 -translate-y-[115%]"
                style={{ left: `${hoveredPin.x}%`, top: `${hoveredPin.y}%` }}
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                  <span className={`font-mono text-[8px] px-2 py-0.5 rounded font-extrabold uppercase tracking-widest ${hoveredPin.type === "LOST" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}`}>
                    {hoveredPin.type}
                  </span>
                  <span className="opacity-50 text-[9px] font-mono">{hoveredPin.category}</span>
                </div>
                <h4 className="font-extrabold text-white text-sm mb-1.5 truncate">{hoveredPin.name}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2 mb-3">{hoveredPin.description}</p>
                
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Pinpoint:</span>
                  <strong className="text-white truncate max-w-[130px]">{hoveredPin.type === "LOST" ? hoveredPin.lastSeenLocation : hoveredPin.foundLocation}</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Watermark Label */}
          <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] text-slate-300 font-bold z-10 shadow-lg font-mono">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>CAMPUS MESH v2.1</span>
          </div>
        </motion.div>

        {/* Legend & Details Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel border border-white/10 p-6 rounded-[28px] shadow-lg flex flex-col justify-between"
        >
          <div className="space-y-6">
            <h3 className="font-extrabold text-slate-400 text-xs uppercase tracking-widest font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Mesh Legends
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-amber-500 border border-slate-950 ring-4 ring-amber-500/20"></div>
                <div>
                  <span className="font-extrabold text-white text-xs block font-mono">Active Lost Reports</span>
                  <span className="text-[10px] text-slate-400">Reports filed by students</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500 border border-slate-950 ring-4 ring-blue-500/20"></div>
                <div>
                  <span className="font-extrabold text-white text-xs block font-mono">Active Found Listings</span>
                  <span className="text-[10px] text-slate-400">Secured physical logs</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/25 border border-red-500/10 flex items-center justify-center text-[10px] font-bold text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  ⚠️
                </div>
                <div>
                  <span className="font-extrabold text-white text-xs block font-mono">Popular Loss Zones</span>
                  <span className="text-[10px] text-slate-400">Heatmap intelligence overlay</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-5 space-y-3.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Info className="w-4 h-4 text-cyan-400" />
                Security Advisory
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-light">
                Markers are deterministically plotted using description-to-vector extraction. Physical vault collections remain housed exclusively at the Student Union Ground floor locker 102. Coordinate online claims prior to retrieval.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-white/5 shadow-inner rounded-2xl p-4 text-[10px] text-slate-400 font-mono mt-6 leading-relaxed">
            💡 Pro-Tip: Hover or touch any colored coordinate point on the grid mesh to reveal smart property popovers instantly!
          </div>
        </motion.div>

      </div>
    </div>
  );
}
