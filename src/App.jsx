import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
// ✨ تم استدعاء Bvh لتسريع معالجة المجسمات العملاقة
import { OrbitControls, useGLTF, DragControls, Bvh } from '@react-three/drei';
import * as THREE from 'three';

const _spotPos = new THREE.Vector3();
const _dirToSpot = new THREE.Vector3();
const _camDir = new THREE.Vector3();
const _vector = new THREE.Vector3();

const initialHotspotsData = [
  { id: 0, label: "Gate 1", pos: [0.617, 4.5, 533.24], type: "gate" },
  { id: 1, label: "Gate 3", pos: [542.04, 4.5, -0.315], type: "gate" },
  { id: 2, label: "Gate 4", pos: [2.698, 4.5, -543.82], type: "gate" },
  { id: 3, label: "Gate 5", pos: [-387.31, 4.5, -379.75], type: "gate" },
  { id: 4, label: "Gate 6", pos: [-534.51, 4.5, 0.93], type: "gate" },
  { id: 5, label: "Gate 2", pos: [386.92, 4.5, 378.80], type: "gate" },
  { id: 6, label: "VIP 1 Parking: 128", pos: [104.51, 4.5, 158.40], type: "parking" },
  { id: 7, label: "VIP 2 Parking: 130", pos: [-102.18, 4.5, 159.59], type: "parking" },
  { id: 8, label: "A1 Parking: 71", pos: [155.07, 4.5, 99.22], type: "parking" },
  { id: 9, label: "A2 Parking: 17", pos: [179.79, 4.5, 32.78], type: "parking" },
  { id: 10, label: "A1 Parking: 92", pos: [180.21, 4.5, -34.29], type: "parking" },
  { id: 11, label: "A1 Parking: 119", pos: [104.60, 4.5, -147.53], type: "parking" },
  { id: 12, label: "A1 Parking: 112", pos: [-37.15, 4.5, -177.72], type: "parking" },
  { id: 13, label: "A1 Parking: 130", pos: [-154.60, 4.5, -96.13], type: "parking" },
  { id: 14, label: "A1 Parking: 0", pos: [-176.35, 4.5, 33.66], type: "parking" },
  { id: 15, label: "A2 Parking: 134", pos: [-177.09, 4.5, -32.80], type: "parking" },
  { id: 16, label: "A2 Parking: 154", pos: [-104.20, 4.5, -146.21], type: "parking" },
  { id: 17, label: "A2 Parking: 138", pos: [38.44, 4.5, -176.67], type: "parking" },
  { id: 18, label: "A2 Parking: 158", pos: [152.83, 4.5, -95.32], type: "parking" },
  { id: 19, label: "A2 Parking: 72", pos: [-150.94, 4.5, 96.63], type: "parking" },
  { id: 20, label: "B1 Parking: 231", pos: [235.86, 4.5, 153.04], type: "parking" },
  { id: 21, label: "B1 Parking: 247", pos: [275.66, 4.5, -53.69], type: "parking" },
  { id: 22, label: "B1 Parking: 272", pos: [161.66, 4.5, -230.00], type: "parking" },
  { id: 23, label: "B1 Parking: 253", pos: [-53.80, 4.5, -278.26], type: "parking" },
  { id: 24, label: "B1 Parking: 40", pos: [-236.51, 4.5, -155.47], type: "parking" },
  { id: 25, label: "B1 Parking: 215", pos: [-275.39, 4.5, 53.65], type: "parking" },
  { id: 26, label: "B2 Parking: 234", pos: [278.04, 4.5, 49.75], type: "parking" },
  { id: 27, label: "B2 Parking: 42", pos: [235.07, 4.5, -156.36], type: "parking" },
  { id: 28, label: "B2 Parking: 289", pos: [55.12, 4.5, -276.52], type: "parking" },
  { id: 29, label: "B2 Parking: 286", pos: [-161.66, 4.5, -230.64], type: "parking" },
  { id: 30, label: "B2 Parking: 231", pos: [-276.48, 4.5, -51.77], type: "parking" },
  { id: 31, label: "B2 Parking: 192", pos: [-233.81, 4.5, 154.46], type: "parking" },
  { id: 32, label: "C1 Parking: 794", pos: [348.25, 4.5, 228.08], type: "parking" },
  { id: 33, label: "C2 Parking: 879", pos: [409.93, 4.5, 77.06], type: "parking" },
  { id: 34, label: "C1 Parking: 824", pos: [406.53, 4.5, -84.73], type: "parking" },
  { id: 35, label: "C2 Parking: 952", pos: [347.81, 4.5, -229.80], type: "parking" },
  { id: 36, label: "C1 Parking: 960", pos: [234.47, 4.5, -344.72], type: "parking" },
  { id: 37, label: "C2 Parking: 951", pos: [82.21, 4.5, -408.55], type: "parking" },
  { id: 38, label: "C1 Parking: 893", pos: [-87.71, 4.5, -407.04], type: "parking" },
  { id: 39, label: "C2 Parking: 890", pos: [-236.53, 4.5, -341.84], type: "parking" },
  { id: 40, label: "C1 Parking: 882", pos: [-351.04, 4.5, -223.25], type: "parking" },
  { id: 41, label: "C2 Parking: 873", pos: [-408.37, 4.5, -80.02], type: "parking" },
  { id: 42, label: "C2 Parking: 734", pos: [-343.53, 4.5, 233.16], type: "parking" },
  { id: 43, label: "Cancelled Parking area 787 MDLBeast", pos: [-406.48, 4.5, 90.64], type: "parking" },
  { id: 44, label: "120 Handheld Ticket \nScanners By Zebra", pos: [0.68, 4.5, -222.66], type: "parking" },
  { id: 45, label: "Ticket Booth (VIP) 1", pos: [64.08, 4.5, 113.19], type: "gate" },
  { id: 46, label: "VIP Entrance 1", pos: [74.77, 4.5, 106.72], type: "gate" },
  { id: 47, label: "Gold & Silver Entrance 1", pos: [84.39, 4.5, 98.44], type: "gate" },
  { id: 48, label: "Handicap Entrance 5", pos: [137.51, 4.5, 24.60], type: "gate" },
  { id: 49, label: "Ticket Booth 5", pos: [137.89, 4.5, 12.25], type: "gate" },
  { id: 50, label: "Ticket Booth 4", pos: [108.03, 4.5, -77.10], type: "gate" },
  { id: 51, label: "Handicap Entrance 4", pos: [24.03, 4.5, -124.70], type: "gate" },
  { id: 52, label: "Ticket Booth 3", pos: [-20.42, 4.5, -126.79], type: "gate" },
  { id: 53, label: "Handicap Entrance 3", pos: [-80.32, 4.5, -104.12], type: "gate" },
  { id: 54, label: "Ticket Booth 2", pos: [-99.33, 4.5, -89.41], type: "gate" },
  { id: 55, label: "Handicap Entrance 2", pos: [-115.50, 4.5, -73.56], type: "gate" },
  { id: 56, label: "Ticket Booth 1", pos: [-136.89, 4.5, -21.86], type: "gate" },
  { id: 57, label: "Ticket Booth (VIP) 2", pos: [-43.35, 4.5, 121.99], type: "gate" },
  { id: 58, label: "VIP Entrance 2", pos: [-56.78, 4.5, 116.48], type: "gate" },
  { id: 59, label: "Gold & Silver Entrance 2", pos: [-68.28, 4.5, 111.45], type: "gate" },
  { id: 60, label: "Player's Entrance", pos: [0.11, 6.00, 49.42], type: "gate" },
  { id: 61, label: "Silver Lounge 3\n1,581 Seats+4 handicaps\n4 IPTV", pos: [0.13, 11.51, 65.13], type: "gate" },
  { id: 62, label: "Gold Lounge 3.5\n1,462 Seats\n13 IPTV\n2 Toilets\nReception Café screen: 4.8*2.7m\nTOP AREA screen: 5.76*5.94m", pos: [-0.11, 17.65, 74.71], type: "gate" },
  { id: 63, label: "Royal Entrance", pos: [-1.26, 6.65, -126.16], type: "gate" },
  { id: 64, label: "LUX Avg. 3100\nGrass Area. 110m x 70m\nField of play 105m x 68m\nPitch area 126m x 82m", pos: [0.00, 4.50, 0.00], type: "gate" },
  { id: 65, label: "Royal 4\n153 Seats\n15 IPTV (includes control and rooms)\nToilets: ECC 2, Royal 3, King's room 2, Prince's Room 1", pos: [-3.29, 24.89, 81.50], type: "gate" },
  { id: 66, label: "Media 5\n600 seats", pos: [0.42, 34.00, 90.39], type: "gate" },
  { id: 67, label: "18 VIP Boxes 4\n272 seats\n18 IPTV\n4 Toilets\n2 Kitchens", pos: [50.47, 24.96, 82.24], type: "gate" },
  { id: 68, label: "Ribbon Board\nlevel3: 543*96=521m\nlevel4: 605*96=580.8m", pos: [84.83, 11.60, 2.62], type: "gate" },
  { id: 69, label: "Stadium Area: 60,750 m2\nCapacity : 59,204 seats\nParking: 13,646 - A/V:12,449\n5 floors\n3 levels (stands)\n153 IPTV\n15 Elevators\n4 Escalators\n19 POS - 13 LVL 3, 6 LVL 5", pos: [2.98, 56.94, 107.73], type: "gate" },
  { id: 70, label: "25 First Aids Boxes\n1,237 Fire Extinguishers\n4 Main Electric Fire Fighting\nPumps including Panel\n2 Fire Fighting Jockey Pumps\nincluding Panel\n80 Fire Hose Reel/Rack Cabinet\n9 Fire Hydrant", pos: [1.89, 62.00, -95.43], type: "gate" },
  { id: 71, label: "eGate 1\nTurnstile: 21\nTicketing system\nHandshake by skidata", pos: [147.12, 6.50, 57.47], type: "gate" },
  { id: 72, label: "eGate 2\nTurnstile: 22\nTicketing system\nHandshake by skidata", pos: [149.81, 6.50, -60.58], type: "gate" },
  { id: 73, label: "eGate 3\nTurnstile: 22\nTicketing system\nHandshake by skidata", pos: [64.10, 6.50, -144.79], type: "gate" },
  { id: 74, label: "eGate 4\nTurnstile: 22\nTicketing system\nHandshake by skidata", pos: [-66.02, 6.50, -144.37], type: "gate" },
  { id: 75, label: "eGate 5\nTurnstile: 22\nTicketing system\nHandshake by skidata", pos: [-151.66, 6.50, -61.45], type: "gate" },
  { id: 76, label: "eGate 6\nTurnstile: 21\nTicketing system\nHandshake by skidata", pos: [-153.64, 6.50, 61.69], type: "gate" },
  { id: 77, label: "LVL 1\n36 Blocks (101-136)\n+ 4 Silver (3)\nPress Conference Room 98 Seats\n1 Main Kitchen\n1 Main Clinic\n53 Toilets\n4 Players Rooms/25 lockers", pos: [0.45, 8.55, -55.88], type: "gate" },
  { id: 78, label: "LVL 3\n45 Blocks (301-345)\n+ 5 Gold (3.5)\n3 Clinic\n13 POS\n18 Toilets\n20 Baby Changing Rooms", pos: [0.13, 19.00, -74.17], type: "gate" },
  { id: 79, label: "LVL 5\n47 Blocks (502-548)\n+ 1 Block for Media (501) & 69 Seats From Each Blocks (502 & 548)\n6 Clinic\n6 POS\n14 Toilets", pos: [-0.16, 28.02, -88.36], type: "gate" },
  { id: 80, label: "2 Giant Screens\n16.32*9.6 m", pos: [-118.79, 29.73, -0.67], type: "gate" },
  { id: 81, label: "POS 1\n78.73 m2\n2 Shutters", pos: [14.28, 12.46, 65.86], type: "gate" },
  { id: 82, label: "POS 2\n78.73 m2\n2 Shutters", pos: [-12.66, 14.83, 66.54], type: "gate" },
  { id: 83, label: "POS 3\n32.13 m2\n1 Shutter", pos: [-40.88, 11.07, 64.75], type: "gate" },
  { id: 84, label: "POS 4\n49.73 m2\n2 Shutter", pos: [-78.32, 11.81, 47.80], type: "gate" },
  { id: 85, label: "POS 5\n50,80 m2\n2 Shutter", pos: [-83.21, 11.26, -7.92], type: "gate" },
  { id: 86, label: "POS 6\n46.68 m2\n2 Shutter", pos: [-74.47, 11.94, -52.33], type: "gate" },
  { id: 87, label: "POS 7\n33.03 m2\n1 Shutter", pos: [-40.22, 11.78, -65.28], type: "gate" },
  { id: 88, label: "POS 8\n173.25 m2\n3 Shutter", pos: [0.68, 11.88, -66.62], type: "gate" },
  { id: 89, label: "POS 9\n27.36 m2\n1 Shutter", pos: [60.13, 11.81, -62.03], type: "gate" },
  { id: 90, label: "POS 10\n48.63 m2\n2 Shutter", pos: [80.88, 11.87, -41.92], type: "gate" },
  { id: 91, label: "POS 11\n51.82 m2\n2 Shutter", pos: [85.07, 12.13, 6.70], type: "gate" },
  { id: 92, label: "POS 12\n48.41 m2\n2 Shutter", pos: [70.17, 11.37, 56.97], type: "gate" },
  { id: 93, label: "POS 13\n32.31 m2\n1 Shutter", pos: [40.51, 12.08, 66.07], type: "gate" },
  { id: 94, label: "POS 1\n41.40 m2\n3 Shutter", pos: [0.95, 29.74, 118.07], type: "gate" },
  { id: 95, label: "POS 2\n41.40 m2\n3 Shutter", pos: [-113.71, 29.73, 29.18], type: "gate" },
  { id: 96, label: "POS 3\n38.71 m2000\n1 Shutter", pos: [-112.93, 29.73, -29.80], type: "gate" },
  { id: 97, label: "POS 4\n41.40 m2\n3 Shutter", pos: [2.46, 29.74, -116.53], type: "gate" },
  { id: 98, label: "POS 5\n38.71 m2\n1 Shutter", pos: [111.25, 29.73, -29.66], type: "gate" },
  { id: 99, label: "POS 6\n38.71 m2\n2 Shutter", pos: [110.19, 29.73, 27.31], type: "gate" }
];

function StadiumModel({ onLoadComplete, onMeshClick, onMeshDblClick }) {
  const { scene } = useGLTF("/045_King_Abdullah_Stadium-v2.glb");
  
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.material.map) {
            child.material.map.generateMipmaps = true;
            child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
            child.material.map.magFilter = THREE.LinearFilter;
            child.material.map.anisotropy = 4; 
            child.material.map.needsUpdate = true;
          }
          child.material.depthWrite = true;
          child.material.depthTest = true;
        }
      });
      onLoadComplete();
    }
  }, [scene, onLoadComplete]);

  return (
    <Bvh firstHitOnly>
      <primitive 
        object={scene} 
        onClick={(e) => {
          e.stopPropagation();
          // السماح بالكليك اليسار فقط (button 0) للنقرات على الملعب
          if (e.nativeEvent.button === 0 && e.point) {
            onMeshClick(e.point);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (e.nativeEvent.button === 0 && e.point) {
            onMeshDblClick(e.point);
          }
        }}
        onPointerEnter={(e) => e.stopPropagation()} 
        onPointerDown={(e) => e.stopPropagation()}
      />
    </Bvh>
  );
}

function OptimizedHotspots({ data, activeEditId, onRightClickSpot, tooltipRef, isOrbitingRef, isDragging }) {
  const hoverMeshRef = useRef(); 
  // ✨ تحسين رقم 1: جلب size لمنع حساب الأبعاد باستمرار
  const { camera, size } = useThree(); 

  const [positions, colors] = useMemo(() => {
    const posArray = new Float32Array(data.length * 3);
    const colorArray = new Float32Array(data.length * 3);
    data.forEach((spot, i) => {
      posArray[i * 3] = spot.pos[0];
      posArray[i * 3 + 1] = spot.pos[1];
      posArray[i * 3 + 2] = spot.pos[2];
      colorArray[i * 3] = spot.type === 'parking' ? 1.0 : 1.0;
      colorArray[i * 3 + 1] = spot.type === 'parking' ? 1.0 : 1.0;
      colorArray[i * 3 + 2] = spot.type === 'parking' ? 1.0 : 1.0;
    });
    return [posArray, colorArray];
  }, [data]);

  const dotTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.beginPath(); ctx.arc(32, 32, 22, 0, 2 * Math.PI); ctx.fillStyle = '#ffffff'; ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(() => {
    if (!tooltipRef.current || !hoverMeshRef.current || !hoverMeshRef.current.visible || isOrbitingRef.current || isDragging) return;
    
    _vector.copy(hoverMeshRef.current.position).project(camera);
    // ✨ تحسين رقم 2: استخدام size.width بدل window.innerWidth لأداء أسرع بكثير
    tooltipRef.current.style.left = `${(_vector.x * 0.5 + 0.5) * size.width}px`;
    tooltipRef.current.style.top = `${(-_vector.y * 0.5 + 0.5) * size.height - 30}px`;
  });

  return (
    <group>
      {/* 1. النقاط الأصلية */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={15} vertexColors map={dotTexture} transparent opacity={0.7} sizeAttenuation={false} depthWrite={false} />
      </points>

      {/* 2. نقاط الاصطدام (خفية) */}
      <group>
        {data.map((spot, index) => (
          <mesh 
            key={spot.id}
            position={spot.pos}
            onPointerEnter={(e) => {
              e.stopPropagation();
              if (activeEditId === spot.id) return;
              hoverMeshRef.current.position.set(spot.pos[0], spot.pos[1], spot.pos[2]);
              hoverMeshRef.current.material.color.setHex(spot.type === 'parking' ? 0xffffff : 0xffffff);
              hoverMeshRef.current.visible = true;
              
              tooltipRef.current.innerText = spot.label;
              tooltipRef.current.style.opacity = '1';
              tooltipRef.current.style.visibility = 'visible';
            }}
            onPointerLeave={() => {
              hoverMeshRef.current.visible = false;
              tooltipRef.current.style.opacity = '0';
              tooltipRef.current.style.visibility = 'hidden';
            }}
            onPointerDown={(e) => { 
              e.stopPropagation(); 
              // ✨ حل المشكلة: التأكد من أن التعديل لا يفتح إلا بالكليك اليمين (رقم 2)
              if (e.nativeEvent.button === 2) {
                onRightClickSpot(spot); 
              }
            }}
          >
            <sphereGeometry args={[5, 8, 8]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        ))}
      </group>

      {/* 3. نقطة التوهج */}
      <points ref={hoverMeshRef} visible={false}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array([0,0,0]), 3]} /></bufferGeometry>
        <pointsMaterial size={30} map={dotTexture} transparent opacity={1} sizeAttenuation={false} depthWrite={false} />
      </points>
    </group>
  );
}

export default function App() {
  const [hotspots, setHotspots] = useState(() => {
    const saved = localStorage.getItem("stadium_r3f_hotspots");
    const data = saved ? JSON.parse(saved) : initialHotspotsData;
    return data.map(spot => ({
      ...spot,
      pos: [spot.pos[0], Math.max(4.5, spot.pos[1]), spot.pos[2]]
    }));
  });

  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(""); 
  
  const tooltipRef = useRef(null); 
  const editMeshRef = useRef(null); 
  const orbitTimeoutRef = useRef(null); 
  
  const [activeEditId, setActiveEditId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSpotLabel, setEditSpotLabel] = useState("");
  const [editSpotType, setEditSpotType] = useState("gate");
  const [backupPos, setBackupPos] = useState(null); 
  
  const [isDragging, setIsDragging] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSpotPos, setNewSpotPos] = useState([0, 0, 0]);
  const [newSpotLabel, setNewSpotLabel] = useState("");
  const [newSpotType, setNewSpotType] = useState("gate");

  const isOrbitingRef = useRef(false);

  useEffect(() => {
    if (activeEditId === null) return;

    const moveStep = 2.0;

    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return; 

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'z', 'x'].includes(key)) {
        setHotspots(prev => prev.map(spot => {
          if (spot.id === activeEditId) {
            let [x, y, z] = spot.pos;
            if (key === 'a') x -= moveStep;
            if (key === 'd') x += moveStep;
            if (key === 'w') y += moveStep;
            if (key === 's') y -= moveStep;
            if (key === 'z') z -= moveStep; 
            if (key === 'x') z += moveStep; 

            y = Math.max(5.5, y); 

            return { ...spot, pos: [parseFloat(x.toFixed(3)), parseFloat(y.toFixed(3)), parseFloat(z.toFixed(3))] };
          }
          return spot;
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeEditId]);

  useEffect(() => {
    localStorage.setItem("stadium_r3f_hotspots", JSON.stringify(hotspots));
  }, [hotspots]);

  const filteredSpots = useMemo(() => {
    return hotspots.filter(spot => {
      if (filter === "gates") return spot.type === "gate";
      if (filter === "parking") return spot.type === "parking";
      return true;
    });
  }, [hotspots, filter]);

  const handleMeshClick = (point) => {
    if (activeEditId === null || isOrbitingRef.current || isDragging) return;
    
    setHotspots(prev => prev.map(spot => {
      if (spot.id === activeEditId) {
        const safeY = Math.max(4.5, parseFloat(point.y.toFixed(3)));
        return { ...spot, pos: [parseFloat(point.x.toFixed(3)), safeY, parseFloat(point.z.toFixed(3))] };
      }
      return spot;
    }));
  };

  const handleMeshDblClick = (point) => {
    if (activeEditId !== null) return; 
    setNewSpotPos([parseFloat(point.x.toFixed(3)), Math.max(4.5, parseFloat(point.y.toFixed(3))), parseFloat(point.z.toFixed(3))]);
    setNewSpotLabel("");
    setNewSpotType("gate");
    setShowAddModal(true);
  };

  const handleSaveNewSpot = () => {
    if (!newSpotLabel.trim()) return;
    const newSpot = { id: Date.now(), label: newSpotLabel, pos: newSpotPos, type: newSpotType };
    setHotspots(prev => [...prev, newSpot]);
    setShowAddModal(false);
  };

  const handleRightClickSpot = (spot) => {
    setActiveEditId(spot.id);
    setEditSpotLabel(spot.label);
    setEditSpotType(spot.type);
    setBackupPos([...spot.pos]); 
    setShowEditModal(true);
  };

  const handleSaveEditSpot = () => {
    setHotspots(prev => prev.map(spot => {
      if (spot.id === activeEditId) {
        return { ...spot, label: editSpotLabel, type: editSpotType };
      }
      return spot;
    }));
    setActiveEditId(null);
    setShowEditModal(false);
  };

  const handleCancelEditSpot = () => {
    if (backupPos && activeEditId !== null) {
      setHotspots(prev => prev.map(spot => {
        if (spot.id === activeEditId) {
          return { ...spot, pos: backupPos };
        }
        return spot;
      }));
    }
    setActiveEditId(null);
    setShowEditModal(false);
  };

  const handleDeleteSpot = () => {
    setHotspots(prev => prev.filter(spot => spot.id !== activeEditId));
    setActiveEditId(null);
    setShowEditModal(false);
  };

  const handleResetToDefault = () => {
    if (window.confirm("Are you sure you want to restore defaults?")) {
      localStorage.removeItem("stadium_r3f_hotspots");
      setHotspots(initialHotspotsData);
      setActiveEditId(null);
      setShowEditModal(false);
    }
  };

  const handleCopyAllData = () => {
    const formattedArray = "[\n" + hotspots.map(s => 
      `  { id: ${s.id}, label: ${JSON.stringify(s.label)}, pos: [${s.pos.join(', ')}], type: "${s.type}" }`
    ).join(",\n") + "\n];";
    
    navigator.clipboard.writeText(formattedArray);
    setCopyFeedback("Copied All!");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const handleCopySingleSpot = () => {
    const spot = hotspots.find(h => h.id === activeEditId);
    if (!spot) return;
    
    const str = `{ id: ${spot.id}, label: ${JSON.stringify(spot.label)}, pos: [${spot.pos.join(', ')}], type: "${spot.type}" }`;
    navigator.clipboard.writeText(str);
    setCopyFeedback("Spot Copied!");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  const editDotTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.beginPath(); ctx.arc(32, 32, 22, 0, 2 * Math.PI); ctx.fillStyle = '#ffffff'; ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <div className="app-container" onContextMenu={(e) => e.preventDefault()}>
      
      {isLoading && (
        <div className="loading-overlay">
          <img src="/Ministry-of-Sports-1.png" alt="Loading Stadium..." className="loading-logo" />
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="sidebar-controls">
        <button className={`side-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter("all")}>All Hotspots</button>
        <button className={`side-btn ${filter === 'gates' ? 'active' : ''}`} onClick={() => setFilter("gates")}>Gates & Stadium</button>
        <button className={`side-btn ${filter === 'parking' ? 'active' : ''}`} onClick={() => setFilter("parking")}>Parking Areas</button>
        
        <button className="side-btn btn-copy-all" onClick={handleCopyAllData}>
          📋 Copy All Data
        </button>
        
        <button className="side-btn btn-reset" onClick={handleResetToDefault}>Reset Layout</button>
        
        {copyFeedback === "Copied All!" && (
          <span className="copy-feedback">
            ✓ All Data Copied
          </span>
        )}
      </div>

      <div ref={tooltipRef} className="hotspot-tooltip" />

      <div className="right-panel">
        {showAddModal && (
          <div className="modal-card modal-add">
            <h3 className="modal-title text-blue">Add New Hotspot 📍</h3>
            
            <label className="modal-label">Hotspot Label:</label>
            <textarea
              rows="3"
              value={newSpotLabel}
              onChange={(e) => setNewSpotLabel(e.target.value)}
              placeholder="Enter text..."
              className="modal-input"
            />
            
            <label className="modal-label mt-10">Category:</label>
            <select value={newSpotType} onChange={(e) => setNewSpotType(e.target.value)} className="modal-input">
              <option value="gate">Gate / Interior Asset</option>
              <option value="parking">Parking Slot</option>
            </select>
            
            <div className="modal-actions">
              <button className="btn-action btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-action btn-save" onClick={handleSaveNewSpot}>Save Spot</button>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="modal-card modal-edit">
            <div className="modal-header">
               <h3 className="modal-title text-red">Edit Hotspot ✏️</h3>
               <button onClick={handleCopySingleSpot} className="btn-copy-spot">
                 {copyFeedback === "Spot Copied!" ? "✓ Copied" : "📋 Copy Code"}
               </button>
            </div>
            
            <p className="modal-hint">
              💡 Hint: W/S (Y-Axis), A/D (X-Axis), Z/X (Z-Axis). Drag directly or left-click any new spot on the stadium.
            </p>

            <label className="modal-label">Edit Label Text:</label>
            <textarea
              rows="4"
              value={editSpotLabel}
              onChange={(e) => setEditSpotLabel(e.target.value)}
              className="modal-input"
            />

            <label className="modal-label mt-10">Change Category:</label>
            <select value={editSpotType} onChange={(e) => setEditSpotType(e.target.value)} className="modal-input">
              <option value="gate">Gate / Interior Asset</option>
              <option value="parking">Parking Slot</option>
            </select>

            <div className="modal-actions space-between">
              <button className="btn-action btn-delete" onClick={handleDeleteSpot}>Delete</button>
              <div className="action-group">
                <button className="btn-action btn-cancel" onClick={handleCancelEditSpot}>Cancel</button>
                <button className="btn-action btn-save-edit" onClick={handleSaveEditSpot}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Canvas 
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1} 
        camera={{ position: [0, 500, 1000], fov: 45, near: 5, far: 10000 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance", precision: "highp" }}
        onCreated={({ scene, gl }) => {
          scene.background = new THREE.Color('#18181c');
          gl.toneMapping = THREE.LinearToneMapping; 
          gl.toneMappingExposure = 2;
        }}
      >
        <ambientLight intensity={0.7} /> 
        <directionalLight position={[800, 2000, 800]} intensity={1.0} color="#ffffff" />
        <directionalLight position={[-800, 1000, -800]} intensity={0.4} color="#ffffff" />
        
        <StadiumModel 
          onLoadComplete={() => setIsLoading(false)} 
          onMeshClick={handleMeshClick}
          onMeshDblClick={handleMeshDblClick}
        />

        {activeEditId !== null && (
          (() => {
            const currentSpot = hotspots.find(h => h.id === activeEditId);
            if (!currentSpot) return null;

            return (
              <DragControls
                key={activeEditId} 
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => {
                  if (editMeshRef.current) {
                    const finalGlobalPos = new THREE.Vector3();
                    editMeshRef.current.getWorldPosition(finalGlobalPos);
                    
                    const safeY = Math.max(4.5, parseFloat(finalGlobalPos.y.toFixed(3)));

                    setHotspots(prev => prev.map(spot => 
                      spot.id === activeEditId 
                        ? { ...spot, pos: [parseFloat(finalGlobalPos.x.toFixed(3)), safeY, parseFloat(finalGlobalPos.z.toFixed(3))] } 
                        : spot
                    ));
                  }
                  setTimeout(() => setIsDragging(false), 50); 
                }}
              >
                <points 
                  ref={editMeshRef}
                  position={[currentSpot.pos[0], currentSpot.pos[1], currentSpot.pos[2]]} 
                >
                  <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[new Float32Array([0, 0, 0]), 3]} />
                  </bufferGeometry>
                  <pointsMaterial 
                    size={20} 
                    color="#791111" 
                    map={editDotTexture}
                    transparent={true}
                    opacity={1.0}
                    sizeAttenuation={false} 
                    depthWrite={false}
                  />
                </points>
              </DragControls>
            );
          })()
        )}

        <OptimizedHotspots 
          data={filteredSpots} 
          activeEditId={activeEditId}
          onRightClickSpot={handleRightClickSpot}
          tooltipRef={tooltipRef}
          isOrbitingRef={isOrbitingRef} 
          isDragging={isDragging}
        />

        <OrbitControls 
          makeDefault 
          enabled={!isDragging} 
          enableZoom={true} 
          zoomSpeed={2.5}
          screenSpacePanning={true}
          enableDamping={true} 
          dampingFactor={0.05} 
          maxDistance={1120}
          minDistance={80}
          maxPolarAngle={Math.PI / 2.1} 
          minPolarAngle={Math.PI / 12}
          onStart={() => { 
            isOrbitingRef.current = true; 
            clearTimeout(orbitTimeoutRef.current);
          }}
          onChange={() => { 
            isOrbitingRef.current = true; 
            clearTimeout(orbitTimeoutRef.current);
            orbitTimeoutRef.current = setTimeout(() => {
               isOrbitingRef.current = false;
            }, 100);
          }}
          onEnd={() => { 
            clearTimeout(orbitTimeoutRef.current);
            isOrbitingRef.current = false; 
          }}
        />
      </Canvas>
    </div>
  );
}