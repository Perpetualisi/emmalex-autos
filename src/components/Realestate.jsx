import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const WA = "https://wa.me/971501234567";
const WA_MSG = (property) =>
  `${WA}?text=${encodeURIComponent(`Hello! I'm interested in the ${property.title} at ${property.address}. Please send me more details and availability.`)}`;
const WA_OTHER = `${WA}?text=${encodeURIComponent(`Hello! I'm interested in your other luxury real estate offerings. Please share your complete portfolio.`)}`;

/* ══════════════════════════════════════════════════
   PREMIUM PROPERTY CATALOGUE - 5 ICONIC PROPERTIES
══════════════════════════════════════════════════ */
const PROPERTIES = [
  { 
    id: 1, 
    title: "Burj Khalifa Sky Penthouse", 
    address: "Downtown Dubai", 
    category: "Penthouse", 
    tag: "ULTRA LUX", 
    specs: ["7,200 sq.ft", "5 Beds", "6 Baths", "Panoramic Views"], 
    bodyColor: 0x1a1a2e, 
    accentColor: 0xffd700, 
    style: "ultramodern", 
    sceneType: "city_night",
    description: "The pinnacle of luxury living at 148th floor with unparalleled views of Dubai skyline."
  },
  { 
    id: 2, 
    title: "Palm Jumeirah Signature Villa", 
    address: "Frond G, Palm Jumeirah", 
    category: "Luxury Villa", 
    tag: "BEACHFRONT", 
    specs: ["9,500 sq.ft", "6 Beds", "8 Baths", "Private Beach"], 
    bodyColor: 0xf5e6d3, 
    accentColor: 0x20b2aa, 
    style: "mediterranean", 
    sceneType: "beach_paradise",
    description: "Oceanfront masterpiece with infinity pool, private beach access, and breathtaking sunset views."
  },
  { 
    id: 3, 
    title: "Emirates Hills Mansion", 
    address: "Emirates Hills, Dubai", 
    category: "Luxury Villa", 
    tag: "GOLF COURSE", 
    specs: ["15,000 sq.ft", "7 Beds", "9 Baths", "Golf View"], 
    bodyColor: 0xd4b896, 
    accentColor: 0xc6a84b, 
    style: "mediterranean", 
    sceneType: "desert_evening",
    description: "Architectural masterpiece overlooking the world-class golf course. The address of billionaires."
  },
  { 
    id: 4, 
    title: "Dubai Marina Infinity Tower", 
    address: "Dubai Marina", 
    category: "Modern Apartment", 
    tag: "WATERFRONT", 
    specs: ["2,400 sq.ft", "3 Beds", "4 Baths", "Marina View"], 
    bodyColor: 0x2c3e50, 
    accentColor: 0x3498db, 
    style: "contemporary", 
    sceneType: "marina",
    description: "Sleek modern living with panoramic marina and sea views. Resort-style amenities."
  },
  { 
    id: 5, 
    title: "Al Barari Nature Retreat", 
    address: "Al Barari, Dubai", 
    category: "Luxury Villa", 
    tag: "ECO LUXURY", 
    specs: ["10,500 sq.ft", "6 Beds", "7 Baths", "Botanical Garden"], 
    bodyColor: 0xd4c4a8, 
    accentColor: 0x2e8b57, 
    style: "tropical", 
    sceneType: "forest",
    description: "Surrounded by 60% greenery, this sanctuary offers unparalleled privacy and natural beauty."
  },
];

/* ══════════════════════════════════════════════════
   MATERIAL SYSTEM
══════════════════════════════════════════════════ */
const createMaterial = {
  stucco: (color, roughness = 0.62) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 }),
  marble: (color, roughness = 0.12) => new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0.55, clearcoat: 0.9, clearcoatRoughness: 0.1 }),
  glass: (opacity = 0.78, color = 0xaaddff) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.04, metalness: 0.96, transparent: true, opacity, clearcoat: 1.0 }),
  wood: (color, roughness = 0.48) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04 }),
  metal: (color, roughness = 0.12, metalness = 0.96) => new THREE.MeshStandardMaterial({ color, roughness, metalness }),
  water: () => new THREE.MeshPhysicalMaterial({ color: 0x1a6d8f, roughness: 0.06, metalness: 0.94, transparent: true, opacity: 0.92 }),
  roofTile: (color = 0xbc7a3e) => new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.02 }),
  terrazzo: (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.28, metalness: 0.06 }),
  gold: () => new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.15, metalness: 0.98, emissive: 0x442200, emissiveIntensity: 0.12 }),
};

/* ══════════════════════════════════════════════════
   WEATHER EFFECTS SYSTEM
══════════════════════════════════════════════════ */
class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.weatherType = "clear";
    this.particles = null;
    this.originalFog = null;
  }

  setWeather(type) {
    this.weatherType = type;
    this.clearEffects();
    
    switch(type) {
      case "rain":
        this.createRain();
        this.scene.fog = new THREE.FogExp2(0x446688, 0.018);
        break;
      case "snow":
        this.createSnow();
        this.scene.fog = new THREE.FogExp2(0xaaccdd, 0.012);
        break;
      case "fog":
        this.scene.fog = new THREE.FogExp2(0x8899aa, 0.022);
        break;
      default:
        this.scene.fog = null;
    }
  }

  createRain() {
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.03, transparent: true, opacity: 0.4 });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    this.animateRain = true;
  }

  createSnow() {
    const particleCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.6 });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    this.animateSnow = true;
  }

  clearEffects() {
    if (this.particles) this.scene.remove(this.particles);
    this.animateRain = false;
    this.animateSnow = false;
  }

  update() {
    if (this.animateRain && this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] -= 0.06;
        if (positions[i * 3 + 1] < -1) positions[i * 3 + 1] = 7;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
    if (this.animateSnow && this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] -= 0.025;
        positions[i * 3] += (Math.random() - 0.5) * 0.02;
        if (positions[i * 3 + 1] < -1) positions[i * 3 + 1] = 7;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }
}

/* ══════════════════════════════════════════════════
   SCENE ENVIRONMENTS
══════════════════════════════════════════════════ */

function createCityNightScene(scene, accentColor) {
  scene.background = new THREE.Color(0x050b1a);
  scene.fog = new THREE.FogExp2(0x050b1a, 0.006);
  
  const cityLight = new THREE.PointLight(0x88aaff, 0.8, 30);
  cityLight.position.set(0, 2, 5);
  scene.add(cityLight);
  
  const neonLight = new THREE.PointLight(accentColor, 0.6, 20);
  neonLight.position.set(-2, 1, 4);
  scene.add(neonLight);
  
  const ambientCity = new THREE.AmbientLight(0x222233, 0.4);
  scene.add(ambientCity);
  
  const lightCount = 300;
  const lightGeo = new THREE.BufferGeometry();
  const lightPositions = new Float32Array(lightCount * 3);
  for (let i = 0; i < lightCount; i++) {
    lightPositions[i * 3] = (Math.random() - 0.5) * 16;
    lightPositions[i * 3 + 1] = Math.random() * 5;
    lightPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }
  lightGeo.setAttribute("position", new THREE.BufferAttribute(lightPositions, 3));
  const lightPoints = new THREE.Points(lightGeo, new THREE.PointsMaterial({ color: 0xffaa66, size: 0.012, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending }));
  scene.add(lightPoints);
  
  return { cityLight, neonLight, lightPoints };
}

function createBeachParadiseScene(scene, accentColor) {
  scene.background = new THREE.Color(0x1a8faa);
  scene.fog = new THREE.FogExp2(0x1a8faa, 0.007);
  
  const tropicalSun = new THREE.PointLight(0xffaa66, 1.4, 40);
  tropicalSun.position.set(3, 6, -5);
  scene.add(tropicalSun);
  
  const oceanGlow = new THREE.PointLight(0x44aaff, 0.5, 20);
  oceanGlow.position.set(0, -0.8, 0);
  scene.add(oceanGlow);
  
  const waterPlane = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), createMaterial.water());
  waterPlane.rotation.x = -Math.PI / 2;
  waterPlane.position.y = -1.1;
  scene.add(waterPlane);
  
  const particleCount = 500;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 16;
    particlePositions[i * 3 + 1] = Math.random() * 3.5;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0xffaa66, size: 0.01, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending }));
  scene.add(particles);
  
  return { tropicalSun, oceanGlow, particles, waterPlane };
}

function createDesertEveningScene(scene, accentColor) {
  scene.background = new THREE.Color(0x2d1b0a);
  scene.fog = new THREE.FogExp2(0x2d1b0a, 0.005);
  
  const desertSun = new THREE.PointLight(0xff8855, 1.3, 35);
  desertSun.position.set(4, 5, -6);
  scene.add(desertSun);
  
  const ambientWarm = new THREE.AmbientLight(0x442200, 0.5);
  scene.add(ambientWarm);
  
  const sandCount = 400;
  const sandGeo = new THREE.BufferGeometry();
  const sandPositions = new Float32Array(sandCount * 3);
  for (let i = 0; i < sandCount; i++) {
    sandPositions[i * 3] = (Math.random() - 0.5) * 15;
    sandPositions[i * 3 + 1] = Math.random() * 0.4;
    sandPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }
  sandGeo.setAttribute("position", new THREE.BufferAttribute(sandPositions, 3));
  const sand = new THREE.Points(sandGeo, new THREE.PointsMaterial({ color: 0xccaa77, size: 0.006, transparent: true, opacity: 0.5 }));
  scene.add(sand);
  
  return { desertSun, sand };
}

function createMarinaScene(scene, accentColor) {
  scene.background = new THREE.Color(0x0a1628);
  scene.fog = new THREE.FogExp2(0x0a1628, 0.005);
  
  const waterLight = new THREE.PointLight(0x4488aa, 0.7, 25);
  waterLight.position.set(0, -0.5, 0);
  scene.add(waterLight);
  
  const waterPlane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), createMaterial.water());
  waterPlane.rotation.x = -Math.PI / 2;
  waterPlane.position.y = -1.1;
  scene.add(waterPlane);
  
  const marinaLights = [];
  for (let i = 0; i < 6; i++) {
    const light = new THREE.PointLight(0xffaa44, 0.35, 15);
    const angle = (i / 6) * Math.PI * 2;
    light.position.set(Math.cos(angle) * 3.8, 0.5, Math.sin(angle) * 3.8);
    scene.add(light);
    marinaLights.push(light);
  }
  
  return { waterLight, marinaLights, waterPlane };
}

function createForestScene(scene, accentColor) {
  scene.background = new THREE.Color(0x0a1a0a);
  scene.fog = new THREE.FogExp2(0x0a1a0a, 0.008);
  
  const forestLight = new THREE.DirectionalLight(0xaaffaa, 0.9);
  forestLight.position.set(3, 8, 4);
  scene.add(forestLight);
  
  const greenFill = new THREE.PointLight(0x44aa44, 0.4);
  greenFill.position.set(-2, 2, 3);
  scene.add(greenFill);
  
  const pollenCount = 300;
  const pollenGeo = new THREE.BufferGeometry();
  const pollenPositions = new Float32Array(pollenCount * 3);
  for (let i = 0; i < pollenCount; i++) {
    pollenPositions[i * 3] = (Math.random() - 0.5) * 13;
    pollenPositions[i * 3 + 1] = Math.random() * 3.5;
    pollenPositions[i * 3 + 2] = (Math.random() - 0.5) * 11;
  }
  pollenGeo.setAttribute("position", new THREE.BufferAttribute(pollenPositions, 3));
  const pollen = new THREE.Points(pollenGeo, new THREE.PointsMaterial({ color: 0xaaffaa, size: 0.006, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending }));
  scene.add(pollen);
  
  return { forestLight, greenFill, pollen };
}

/* ══════════════════════════════════════════════════
   ARCHITECTURAL MODELS
══════════════════════════════════════════════════ */

// Ultramodern - Burj Khalifa Sky Penthouse style
function buildUltramodernPenthouse(colorHex, accentHex) {
  const group = new THREE.Group();
  const glassMat = createMaterial.glass(0.85);
  const steelMat = createMaterial.metal(0xb8c4d0, 0.06, 0.95);
  const accentMat = createMaterial.metal(accentHex, 0.1, 0.94);
  const terraceMat = createMaterial.terrazzo(0xe8e0d0);
  
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.55, 2.8), steelMat);
  base.position.y = 0.2;
  base.castShadow = true;
  group.add(base);
  
  const mid = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 2.4), steelMat);
  mid.position.y = 0.7;
  mid.castShadow = true;
  group.add(mid);
  
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 2.0), steelMat);
  top.position.y = 1.25;
  top.castShadow = true;
  group.add(top);

  // Floor-to-ceiling windows
  const windowRows = [0.55, 1.0];
  windowRows.forEach(yPos => {
    for (let x = -1.05; x <= 1.05; x += 1.05) {
      const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.58, 0.06), glassMat);
      winGlass.position.set(x, yPos, 1.45);
      winGlass.castShadow = true;
      group.add(winGlass);
    }
  });

  // Terrace with railing
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 2.4), terraceMat);
  terrace.position.set(0, 1.72, 0);
  terrace.castShadow = true;
  group.add(terrace);
  
  const railGlass = new THREE.Mesh(new THREE.BoxGeometry(2.88, 0.4, 0.04), createMaterial.glass(0.55));
  railGlass.position.set(0, 1.94, 1.28);
  group.add(railGlass);

  // Infinity pool element
  const poolBase = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 1.1), terraceMat);
  poolBase.position.set(0.8, 1.78, -0.9);
  group.add(poolBase);
  const poolWater = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.05, 0.95), createMaterial.water());
  poolWater.position.set(0.8, 1.85, -0.9);
  group.add(poolWater);

  return group;
}

// Mediterranean - Palm Jumeirah Villa style
function buildMediterraneanVilla(colorHex, accentHex) {
  const group = new THREE.Group();
  const wallMat = createMaterial.stucco(colorHex);
  const trimMat = createMaterial.marble(0xf5f0e0, 0.12);
  const roofMat = createMaterial.roofTile(0xc47e3a);
  const glassMat = createMaterial.glass(0.78);
  const woodMat = createMaterial.wood(0x8b5e3c, 0.52);
  const accentMat = createMaterial.metal(accentHex, 0.15, 0.94);

  const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.82, 2.9), wallMat);
  mainBlock.position.y = 0.3;
  mainBlock.castShadow = true;
  mainBlock.receiveShadow = true;
  group.add(mainBlock);

  const secondFloor = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.72, 2.5), wallMat);
  secondFloor.position.y = 0.84;
  secondFloor.castShadow = true;
  group.add(secondFloor);

  const roofBase = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 2.25, 0.35, 16), roofMat);
  roofBase.position.y = 1.27;
  roofBase.castShadow = true;
  group.add(roofBase);
  
  const roofCap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12), trimMat);
  roofCap.position.y = 1.48;
  group.add(roofCap);

  // Arched windows
  const windowPositions = [
    [-1.15, 0.45, 1.52], [-0.4, 0.45, 1.52], [0.4, 0.45, 1.52], [1.15, 0.45, 1.52],
    [-1.15, 0.95, 1.52], [0, 0.95, 1.52], [1.15, 0.95, 1.52]
  ];
  windowPositions.forEach(pos => {
    const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.42, 0.05), glassMat);
    winGlass.position.set(pos[0], pos[1], pos[2] + 0.04);
    winGlass.castShadow = true;
    group.add(winGlass);
  });

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.12, 0.1), woodMat);
  door.position.set(0, 0.55, 1.6);
  door.castShadow = true;
  group.add(door);
  
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.22, 0.08), accentMat);
  doorFrame.position.set(0, 0.55, 1.66);
  group.add(doorFrame);

  return group;
}

// Contemporary - Dubai Marina Tower style
function buildContemporaryTower(colorHex, accentHex) {
  const group = new THREE.Group();
  const glassMat = createMaterial.glass(0.82);
  const frameMat = createMaterial.metal(0xc8d0d8, 0.06, 0.94);
  const accentMat = createMaterial.metal(accentHex, 0.08, 0.95);
  
  const tower = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 2.5), frameMat);
  tower.position.y = 1.15;
  tower.castShadow = true;
  group.add(tower);
  
  for (let floor = 0; floor < 3; floor++) {
    const yBase = 0.35 + floor * 0.85;
    for (let x = -1.05; x <= 1.05; x += 1.05) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.72, 0.06), glassMat);
      panel.position.set(x, yBase, 1.28);
      panel.castShadow = true;
      group.add(panel);
    }
  }
  
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.35, 12), accentMat);
  crown.position.y = 2.45;
  crown.castShadow = true;
  group.add(crown);
  
  // Balcony accents
  for (let x = -0.9; x <= 0.9; x += 0.9) {
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.35), frameMat);
    balcony.position.set(x, 0.7, 1.32);
    group.add(balcony);
  }
  
  return group;
}

// Tropical - Al Barari style
function buildTropicalRetreat(colorHex, accentHex) {
  const group = new THREE.Group();
  const woodMat = createMaterial.wood(0xc48a5c, 0.52);
  const thatchMat = new THREE.MeshStandardMaterial({ color: 0xb88a4a, roughness: 0.85 });
  const glassMat = createMaterial.glass(0.82);
  const stuccoMat = createMaterial.stucco(colorHex);
  
  const mainFloor = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 2.15, 0.42, 24), woodMat);
  mainFloor.position.y = 0.1;
  mainFloor.castShadow = true;
  group.add(mainFloor);
  
  const walls = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.88, 0.88, 24), stuccoMat);
  walls.position.y = 0.65;
  walls.castShadow = true;
  group.add(walls);
  
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.25, 0.95, 12), thatchMat);
  roof.position.y = 1.15;
  roof.castShadow = true;
  group.add(roof);
  
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const x = Math.cos(angle) * 1.6;
    const z = Math.sin(angle) * 1.6;
    const winGlass = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.68, 0.05), glassMat);
    winGlass.position.set(x, 0.62, z);
    winGlass.castShadow = true;
    group.add(winGlass);
  }
  
  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.1, 3.8), woodMat);
  deck.position.y = -0.12;
  deck.receiveShadow = true;
  group.add(deck);
  
  return group;
}

/* ══════════════════════════════════════════════════
   MAIN SHOWROOM SCENE
══════════════════════════════════════════════════ */
function ShowroomScene({ property }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const composerRef = useRef(null);
  const modelRef = useRef(null);
  const environmentRef = useRef(null);
  const weatherSystemRef = useRef(null);
  const timeRef = useRef(0);
  const [weather, setWeather] = useState("clear");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x050b14, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 55);
    camera.position.set(0, 1.8, 7.2);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.zoomSpeed = 0.8;
    controls.target.set(0, 0.8, 0);
    controlsRef.current = controls;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    let environment;
    switch (property.sceneType) {
      case "city_night": environment = createCityNightScene(scene, property.accentColor); break;
      case "beach_paradise": environment = createBeachParadiseScene(scene, property.accentColor); break;
      case "desert_evening": environment = createDesertEveningScene(scene, property.accentColor); break;
      case "marina": environment = createMarinaScene(scene, property.accentColor); break;
      case "forest": environment = createForestScene(scene, property.accentColor); break;
      default: environment = createCityNightScene(scene, property.accentColor);
    }
    environmentRef.current = environment;

    const weatherSystem = new WeatherSystem(scene);
    weatherSystemRef.current = weatherSystem;

    const baseAmbient = new THREE.AmbientLight(0x404060, 0.35);
    scene.add(baseAmbient);

    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a1030, roughness: 0.08, metalness: 0.85 });
    const groundPlane = new THREE.Mesh(new THREE.PlaneGeometry(22, 18), groundMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -1.1;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);
    
    const gridMat = new THREE.MeshBasicMaterial({ color: property.accentColor, wireframe: true, transparent: true, opacity: 0.03 });
    const gridPlane = new THREE.Mesh(new THREE.PlaneGeometry(18, 15, 48, 48), gridMat);
    gridPlane.rotation.x = -Math.PI / 2;
    gridPlane.position.y = -1.08;
    scene.add(gridPlane);

    let model;
    switch (property.style) {
      case "ultramodern": model = buildUltramodernPenthouse(property.bodyColor, property.accentColor); break;
      case "mediterranean": model = buildMediterraneanVilla(property.bodyColor, property.accentColor); break;
      case "contemporary": model = buildContemporaryTower(property.bodyColor, property.accentColor); break;
      case "tropical": model = buildTropicalRetreat(property.bodyColor, property.accentColor); break;
      default: model = buildMediterraneanVilla(property.bodyColor, property.accentColor);
    }
    model.castShadow = true;
    model.receiveShadow = true;
    scene.add(model);
    modelRef.current = model;
    
    // Ghost outline effect
    const ghost = model.clone();
    ghost.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({ color: property.accentColor, wireframe: true, transparent: true, opacity: 0.02 });
      }
    });
    scene.add(ghost);

    // Decorative rings
    const ringMatDeco = new THREE.MeshBasicMaterial({ color: property.accentColor, transparent: true, opacity: 0.12 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.01, 48, 160), ringMatDeco);
    ring1.rotation.x = 0.7;
    ring1.rotation.z = 0.2;
    scene.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.008, 48, 180), ringMatDeco);
    ring2.rotation.x = 1.2;
    ring2.rotation.z = -0.4;
    scene.add(ring2);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.5, 0.25, 0.7);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 0.45;
    bloomPass.radius = 0.5;
    
    const effectComposer = new EffectComposer(renderer);
    effectComposer.addPass(renderScene);
    effectComposer.addPass(bloomPass);
    composerRef.current = effectComposer;

    let lastTime = 0;
    
    const animate = () => {
      const now = performance.now();
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;
      timeRef.current += dt;
      const t = timeRef.current;
      
      controls.update();
      weatherSystem.update();
      
      if (modelRef.current) {
        ghost.rotation.copy(modelRef.current.rotation);
        ghost.rotation.y += t * 0.025;
        ghost.position.copy(modelRef.current.position);
      }
      
      if (environment) {
        if (environment.tropicalSun) environment.tropicalSun.intensity = 1.3 + Math.sin(t * 0.7) * 0.15;
        if (environment.desertSun) environment.desertSun.intensity = 1.2 + Math.sin(t * 0.8) * 0.1;
        if (environment.marinaLights) {
          environment.marinaLights.forEach((light, idx) => {
            light.intensity = 0.3 + Math.sin(t * 1.2 + idx) * 0.1;
          });
        }
        if (environment.waterPlane && !property.sceneType === "city_night") {
          environment.waterPlane.position.y = -1.1 + Math.sin(t * 0.8) * 0.02;
        }
      }
      
      if (modelRef.current) {
        ring1.position.copy(modelRef.current.position);
        ring1.rotation.y += 0.003;
        ring2.position.copy(modelRef.current.position);
        ring2.rotation.y -= 0.0025;
      }
      
      effectComposer.render();
      frameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      effectComposer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);
    
    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [property]);

  const changeWeather = (newWeather) => {
    setWeather(newWeather);
    if (weatherSystemRef.current) {
      weatherSystemRef.current.setWeather(newWeather);
    }
    if (controlsRef.current && newWeather !== "clear") {
      controlsRef.current.autoRotate = false;
      setTimeout(() => {
        if (controlsRef.current) controlsRef.current.autoRotate = true;
      }, 3000);
    }
  };

  return (
    <>
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
      
      {/* Weather Control UI */}
      <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 30, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select onChange={(e) => changeWeather(e.target.value)} value={weather} style={{ background: "rgba(0,0,0,0.85)", color: `#${property.accentColor.toString(16)}`, border: `1px solid #${property.accentColor.toString(16)}`, padding: "8px 14px", cursor: "pointer", fontSize: "11px", fontFamily: "monospace", borderRadius: "4px", backdropFilter: "blur(8px)" }}>
          <option value="clear">☀️ Clear Sky</option>
          <option value="rain">🌧️ Rain</option>
          <option value="snow">❄️ Snow</option>
          <option value="fog">🌫️ Fog</option>
        </select>
      </div>
      
      <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 30, textAlign: "right" }}>
        <div style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: "6px 12px", borderRadius: "4px", fontSize: "9px", color: `#${property.accentColor.toString(16)}`, fontFamily: "monospace" }}>
          🖱️ Drag to rotate • Scroll to zoom
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════
   SVG DECORATIVE ELEMENTS
══════════════════════════════════════════════════ */
const CornerTL = ({ a }) => (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ position: "absolute", top: 0, left: 0, opacity: 0.4, pointerEvents: "none", zIndex: 12 }}><path d="M0 44L0 0L44 0" stroke={a} strokeWidth="0.9" fill="none" /><circle cx="0" cy="0" r="2.5" fill={a} opacity="0.85" /></svg>);
const CornerBR = ({ a }) => (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.4, pointerEvents: "none", zIndex: 12 }}><path d="M44 0L44 44L0 44" stroke={a} strokeWidth="0.9" fill="none" /><circle cx="44" cy="44" r="2.5" fill={a} opacity="0.85" /></svg>);
const Reticle = ({ a }) => (<svg width="48" height="48" viewBox="0 0 60 60" fill="none" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.04, pointerEvents: "none", zIndex: 8, animation: "reticleSpin 24s linear infinite" }}><circle cx="30" cy="30" r="28" stroke={a} strokeWidth="0.7" strokeDasharray="5 7" /><line x1="30" y1="0" x2="30" y2="10" stroke={a} strokeWidth="0.9" /><line x1="30" y1="50" x2="30" y2="60" stroke={a} strokeWidth="0.9" /><line x1="0" y1="30" x2="10" y2="30" stroke={a} strokeWidth="0.9" /><line x1="50" y1="30" x2="60" y2="30" stroke={a} strokeWidth="0.9" /></svg>);

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function RealEstate() {
  const [activeProperty, setActiveProperty] = useState(PROPERTIES[0]);
  const [transitioning, setTransitioning] = useState(false);
  const [scanY, setScanY] = useState(25);
  const [mobileView, setMobileView] = useState("list");

  const selectProperty = useCallback((property) => {
    if (property.id === activeProperty.id) return;
    setTransitioning(true);
    setTimeout(() => { setActiveProperty(property); setTransitioning(false); }, 400);
    if (window.innerWidth <= 900) setMobileView("viewer");
  }, [activeProperty]);

  useEffect(() => {
    let y = 25, raf;
    const tick = () => { y = (y + 0.05) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section id="realestate" style={{ background: "#000", position: "relative", overflow: "hidden", fontFamily: "'Overpass Mono', monospace" }}>
      <style>{`
        @keyframes reticleSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
        @keyframes cardSlideUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes marqueeScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes scanBeam{0%{background-position:0 -200px}100%{background-position:0 100%}}

        #realestate::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image:linear-gradient(rgba(255,255,255,0.005) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.005) 1px,transparent 1px);
          background-size:58px 58px;}

        .re-scan{position:absolute;inset:0;pointer-events:none;z-index:1;
          background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.008) 50%,transparent);
          background-size:100% 200px;animation:scanBeam 12s linear infinite;}

        .ch{max-width:1400px;margin:0 auto;padding:clamp(85px,12vw,120px) 5% 0;position:relative;z-index:4;}
        .ch-inner{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:24px;}
        .ch-eyebrow{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
        .ch-eb-bar{width:28px;height:2.5px;background:#C6A84B;border-radius:3px;}
        .ch-eb-txt{font-size:9px;font-weight:700;letter-spacing:0.65em;text-transform:uppercase;color:#C6A84B;}
        .ch-title{font-family:'DM Serif Display',serif;font-size:clamp(32px,5vw,62px);font-weight:400;color:#fff;letter-spacing:-0.02em;line-height:1.08;}
        .ch-title em{font-style:italic;color:rgba(255,255,255,0.28);}
        .ch-right{text-align:right;}
        .ch-num{font-family:'DM Serif Display',serif;font-size:clamp(42px,6vw,78px);font-weight:400;color:#C6A84B;line-height:1;letter-spacing:-0.03em;}
        .ch-num-lbl{font-size:8px;font-weight:600;letter-spacing:0.5em;text-transform:uppercase;color:rgba(255,255,255,0.22);margin-top:6px;}
        .ch-rule{width:60px;height:2px;background:linear-gradient(90deg,#C6A84B,transparent);margin-top:24px;border-radius:3px;}

        .mob-toggle{display:none;max-width:1400px;margin:0 auto;padding:24px 5% 0;gap:2px;position:relative;z-index:4;}
        .mob-tab{flex:1;font-family:'Overpass Mono',monospace;font-size:8.5px;font-weight:600;letter-spacing:0.42em;text-transform:uppercase;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.3);padding:14px;cursor:pointer;text-align:center;transition:all 0.3s;}
        .mob-tab.on{background:rgba(198,168,75,0.12);border-color:rgba(198,168,75,0.45);color:#C6A84B;}
        @media(max-width:900px){.mob-toggle{display:flex;}}

        .re-grid{max-width:1400px;margin:0 auto;padding:32px 5% 0;display:grid;grid-template-columns:440px 1fr;gap:0;position:relative;z-index:4;}
        @media(max-width:1100px){.re-grid{grid-template-columns:380px 1fr;}}
        @media(max-width:900px){.re-grid{grid-template-columns:1fr;padding:0;}}

        .re-list{border:1px solid rgba(255,255,255,0.06);overflow-y:auto;max-height:76vh;scrollbar-width:thin;scrollbar-color:rgba(198,168,75,0.3) transparent;position:relative;background:#000;}
        .re-list::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(198,168,75,0.4),transparent);z-index:5;pointer-events:none;}
        .re-list::-webkit-scrollbar{width:2.5px;}
        .re-list::-webkit-scrollbar-thumb{background:rgba(198,168,75,0.35);border-radius:4px;}
        @media(max-width:900px){
          .re-list{border:none;border-top:1px solid rgba(255,255,255,0.05);max-height:none;overflow-y:visible;}
          .re-list.hidden{display:none;}
        }

        .pr{background:#000;padding:18px 22px;cursor:pointer;display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:16px;border-left:2.5px solid transparent;border-bottom:1px solid rgba(255,255,255,0.045);transition:all 0.25s ease;position:relative;animation:cardSlideUp 0.55s ease both;}
        .pr:last-child{border-bottom:none;}
        .pr:hover{background:rgba(255,255,255,0.028);border-left-color:rgba(198,168,75,0.45);}
        .pr.sel{background:rgba(198,168,75,0.07);border-left-color:#C6A84B;}
        .pr-idx{font-family:'DM Serif Display',serif;font-size:13px;color:rgba(255,255,255,0.1);text-align:right;}
        .pr.sel .pr-idx{color:rgba(198,168,75,0.55);}
        .pr-title{font-family:'DM Serif Display',serif;font-size:clamp(16px,2vw,19px);font-weight:400;color:#fff;line-height:1.2;margin:0;}
        .pr-address{font-size:7.5px;font-weight:600;letter-spacing:0.48em;text-transform:uppercase;color:rgba(255,255,255,0.28);margin-top:3px;}
        .pr-category{font-size:6.5px;font-weight:600;letter-spacing:0.4em;text-transform:uppercase;color:rgba(255,255,255,0.18);margin-top:2px;}
        .pr-tag{font-size:5.5px;font-weight:700;letter-spacing:0.32em;text-transform:uppercase;padding:3px 8px;border:1px solid;white-space:nowrap;}
        .pr-arrow{font-size:15px;opacity:0;transition:opacity 0.25s;color:rgba(198,168,75,0.6);}
        .pr:hover .pr-arrow,.pr.sel .pr-arrow{opacity:1;}
        .pr-sel-line{position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,var(--accent,#C6A84B),transparent);opacity:0;transition:opacity 0.35s;}
        .pr.sel .pr-sel-line{opacity:0.65;}

        .re-viewer{position:relative;border:1px solid rgba(255,255,255,0.06);border-left:none;overflow:hidden;display:flex;flex-direction:column;min-height:72vh;background:#000;}
        @media(max-width:900px){
          .re-viewer{border:none;border-top:1px solid rgba(255,255,255,0.05);min-height:0;}
          .re-viewer.hidden{display:none;}
        }

        .cv-canvas{position:relative;flex:1;min-height:420px;cursor:grab;}
        .cv-canvas:active{cursor:grabbing;}
        @media(max-width:600px){.cv-canvas{min-height:65vw;}}

        .cv-bg{position:absolute;inset:0;z-index:1;pointer-events:none;transition:background 1.2s ease;}
        .cv-scan-line{position:absolute;left:0;right:0;height:80px;background:linear-gradient(to bottom,transparent,var(--accent-color)0a,var(--accent-color)12,var(--accent-color)0a,transparent);pointer-events:none;z-index:6;transition:top 0.05s linear;}
        .cv-3d{position:absolute;inset:0;z-index:5;transition:opacity 0.4s ease;}
        .cv-fade-b{position:absolute;bottom:0;left:0;right:0;height:90px;background:linear-gradient(180deg,transparent,#000);pointer-events:none;z-index:7;}
        .cv-fade-l{position:absolute;top:0;left:0;bottom:0;width:70px;background:linear-gradient(90deg,#000,transparent);pointer-events:none;z-index:7;}
        @media(max-width:900px){.cv-fade-l{display:none;}}

        .hud-tl{position:absolute;top:16px;left:16px;z-index:20;display:flex;align-items:center;gap:10px;font-size:7px;letter-spacing:0.48em;text-transform:uppercase;background:rgba(0,0,0,0.85);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.06);padding:7px 14px;border-radius:4px;}
        .hud-dot{width:5px;height:5px;border-radius:50%;animation:pulse 2.2s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        .hud-br{position:absolute;bottom:20px;right:20px;z-index:20;text-align:right;pointer-events:none;}
        .hud-br-address{font-size:7.5px;font-weight:600;letter-spacing:0.58em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:4px;}
        .hud-br-title{font-family:'DM Serif Display',serif;font-style:italic;font-size:clamp(14px,1.8vw,20px);}
        .instruction{position:absolute;bottom:20px;left:20px;z-index:20;font-size:6.5px;letter-spacing:0.35em;text-transform:uppercase;background:rgba(0,0,0,0.65);backdrop-filter:blur(12px);padding:6px 12px;border-radius:3px;color:rgba(255,255,255,0.4);pointer-events:none;}

        .cv-detail{padding:24px 28px 28px;border-top:1px solid rgba(255,255,255,0.06);background:#000;position:relative;z-index:10;transition:opacity 0.4s;}
        .cv-detail::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(198,168,75,0.55),transparent);}

        .cvd-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:0;flex-wrap:wrap;}
        .cvd-badge-row{display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;}
        .cvd-category{font-size:8px;font-weight:700;letter-spacing:0.52em;text-transform:uppercase;color:#C6A84B;}
        .cvd-cat-tag{font-size:6px;font-weight:600;letter-spacing:0.35em;text-transform:uppercase;padding:3px 10px;border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.3);}
        .cvd-title{font-family:'DM Serif Display',serif;font-size:clamp(24px,3.5vw,38px);font-weight:400;color:#fff;letter-spacing:-0.01em;line-height:1.05;margin:0;}
        .cvd-address{font-size:9.5px;color:rgba(255,255,255,0.4);margin-top:8px;letter-spacing:0.02em;}
        .cvd-desc{font-size:7.5px;color:rgba(255,255,255,0.35);margin-top:8px;max-width:380px;line-height:1.5;letter-spacing:0.02em;}

        .btn-enquire-sm{font-family:'Overpass Mono',monospace;font-size:8px;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:#000;background:#C6A84B;border:none;padding:12px 22px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all 0.35s ease;white-space:nowrap;border-radius:2px;}
        .btn-enquire-sm:hover{filter:brightness(1.18);transform:translateY(-1.5px);box-shadow:0 8px 28px rgba(198,168,75,0.35);}

        .cvd-specs{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid rgba(255,255,255,0.07);margin-top:18px;background:rgba(255,255,255,0.012);}
        .cvd-spec{text-align:center;padding:14px 10px;border-right:1px solid rgba(255,255,255,0.06);}
        .cvd-spec:last-child{border-right:none;}
        .cvd-spec:hover{background:rgba(198,168,75,0.04);}
        .cvd-spec-val{font-family:'DM Serif Display',serif;font-size:clamp(14px,2vw,20px);font-weight:400;}
        .cvd-spec-lbl{font-size:6.5px;font-weight:600;letter-spacing:0.48em;text-transform:uppercase;color:rgba(255,255,255,0.28);margin-top:6px;}

        .cvd-btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px;}
        .btn-wa{font-family:'Overpass Mono',monospace;font-size:8.5px;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:#000;background:linear-gradient(135deg,#c6a84b 0%,#e8c87a 50%,#c6a84b 100%);background-size:200% 100%;border:none;padding:15px 26px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:10px;transition:all 0.45s ease;border-radius:2px;}
        .btn-wa:hover{background-position:100% 0;transform:translateY(-2px);box-shadow:0 12px 38px rgba(198,168,75,0.4);}
        .btn-wa-ghost{font-family:'Overpass Mono',monospace;font-size:8.5px;font-weight:600;letter-spacing:0.38em;text-transform:uppercase;color:rgba(255,255,255,0.4);background:transparent;border:1.2px solid rgba(255,255,255,0.12);padding:15px 24px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:10px;transition:all 0.35s ease;border-radius:2px;}
        .btn-wa-ghost:hover{border-color:#25D366;color:#25D366;transform:translateY(-2px);box-shadow:0 8px 28px rgba(37,211,102,0.18);}

        .re-marquee-wrap{border-top:1px solid rgba(255,255,255,0.045);overflow:hidden;padding:18px 0;background:#000;position:relative;z-index:4;margin-top:48px;}
        .re-marquee{display:flex;gap:58px;animation:marqueeScroll 32s linear infinite;width:max-content;}
        .re-marquee-item{font-size:8px;font-weight:600;letter-spacing:0.48em;text-transform:uppercase;color:rgba(198,168,75,0.32);white-space:nowrap;}
        .re-bottom-rule{height:1px;background:linear-gradient(90deg,transparent,rgba(198,168,75,0.22),transparent);}

        @media(max-width:900px){
          .ch{padding:85px 5% 0;}
          .ch-title{font-size:clamp(28px,9vw,42px);}
          .pr{padding:16px 18px;gap:12px;}
          .pr-title{font-size:clamp(15px,5vw,18px);}
          .cv-detail{padding:22px 6% 28px;}
          .cvd-title{font-size:clamp(22px,7vw,30px);}
          .cvd-btns{flex-direction:column;}
          .btn-wa,.btn-wa-ghost{justify-content:center;padding:14px;width:100%;}
          .btn-enquire-sm{padding:10px 18px;font-size:7.5px;}
          .instruction{display:none;}
        }
        @media(max-width:480px){
          .ch-inner{flex-direction:column;gap:16px;}
          .ch-right{text-align:left;}
          .cvd-header{flex-direction:column;gap:16px;}
          .cvd-specs{grid-template-columns:repeat(2,1fr);}
          .cvd-spec{padding:12px 6px;}
          .cvd-spec-val{font-size:clamp(13px,4.5vw,16px);}
          .cvd-spec-lbl{font-size:5.5px;letter-spacing:0.32em;}
        }
      `}</style>

      <div className="re-scan" />

      <div className="ch">
        <div className="ch-inner">
          <div className="ch-left">
            <div className="ch-eyebrow">
              <div className="ch-eb-bar" />
              <div className="ch-eb-txt">EMMALEX REALTY · PREMIER PROPERTIES</div>
            </div>
            <h2 className="ch-title">
              Dubai's Finest<br /><em>Estates.</em>
            </h2>
          </div>
          <div className="ch-right">
            <div className="ch-num">50+</div>
            <div className="ch-num-lbl">Luxury Listings</div>
          </div>
        </div>
        <div className="ch-rule" />
      </div>

      <div className="mob-toggle">
        <button className={`mob-tab${mobileView === "list" ? " on" : ""}`} onClick={() => setMobileView("list")}>Collection</button>
        <button className={`mob-tab${mobileView === "viewer" ? " on" : ""}`} onClick={() => setMobileView("viewer")}>3D Preview</button>
      </div>

      <div className="re-grid">
        <div className={`re-list${mobileView === "viewer" ? " hidden" : ""}`}>
          {PROPERTIES.map((property, i) => (
            <div key={property.id}
              className={`pr${activeProperty.id === property.id ? " sel" : ""}`}
              style={{ "--accent": `#${property.accentColor.toString(16)}`, animationDelay: `${i * 0.05}s` }}
              onClick={() => selectProperty(property)}>
              <div className="pr-sel-line" />
              <div className="pr-idx">{String(i + 1).padStart(2, "0")}</div>
              <div className="pr-info">
                <div className="pr-title">{property.title}</div>
                <div className="pr-address">{property.address}</div>
                <div className="pr-category">{property.category}</div>
              </div>
              <div className="pr-right">
                {property.tag && <div className="pr-tag" style={{ color: `#${property.accentColor.toString(16)}`, borderColor: `${`#${property.accentColor.toString(16)}`}44` }}>{property.tag}</div>}
                <div className="pr-arrow">›</div>
              </div>
            </div>
          ))}
        </div>

        <div className={`re-viewer${mobileView === "list" ? " hidden" : ""}`}>
          <div className="cv-canvas">
            <div className="cv-bg" style={{ background: `radial-gradient(ellipse at 55% 45%, ${`#${activeProperty.accentColor.toString(16)}`}15 0%, transparent 70%)` }} />
            <div className="cv-scan-line" style={{ top: `${scanY}%`, "--accent-color": `#${activeProperty.accentColor.toString(16)}` }} />
            <CornerTL a={`#${activeProperty.accentColor.toString(16)}`} />
            <CornerBR a={`#${activeProperty.accentColor.toString(16)}`} />
            <Reticle a={`#${activeProperty.accentColor.toString(16)}`} />

            <div className="cv-3d" style={{ opacity: transitioning ? 0 : 1 }}>
              <ShowroomScene property={activeProperty} />
            </div>

            <div className="cv-fade-b" />
            <div className="cv-fade-l" />

            <div className="hud-tl" style={{ color: `#${activeProperty.accentColor.toString(16)}`, borderColor: `${`#${activeProperty.accentColor.toString(16)}`}22` }}>
              <div className="hud-dot" style={{ background: `#${activeProperty.accentColor.toString(16)}` }} />
              Live 3D Preview
            </div>
            
            <div className="instruction">
              🖱️ Drag to rotate • Scroll to zoom • 🌦️ Change weather
            </div>

            <div className="hud-br">
              <div className="hud-br-address">{activeProperty.address.split(',')[0]}</div>
              <div className="hud-br-title" style={{ color: `${`#${activeProperty.accentColor.toString(16)}`}99` }}>{activeProperty.title}</div>
            </div>
          </div>

          <div className="cv-detail" style={{ opacity: transitioning ? 0 : 1 }}>
            <div className="cvd-header">
              <div className="cvd-left">
                <div className="cvd-badge-row">
                  <div className="cvd-category">{activeProperty.category}</div>
                  {activeProperty.tag && <div className="pr-tag" style={{ color: `#${activeProperty.accentColor.toString(16)}`, borderColor: `${`#${activeProperty.accentColor.toString(16)}`}44`, fontSize: "5.5px" }}>{activeProperty.tag}</div>}
                </div>
                <div className="cvd-title">{activeProperty.title}</div>
                <div className="cvd-address">{activeProperty.address}</div>
                <div className="cvd-desc">{activeProperty.description}</div>
              </div>
              <div className="cvd-right">
                <a href={WA_MSG(activeProperty)} target="_blank" rel="noopener noreferrer" className="btn-enquire-sm">
                  <span style={{ fontSize: 13 }}>💬</span>
                  Inquire
                </a>
              </div>
            </div>

            <div className="cvd-specs">
              {activeProperty.specs.map((s, i) => (
                <div key={i} className="cvd-spec">
                  <div className="cvd-spec-val" style={{ color: `#${activeProperty.accentColor.toString(16)}` }}>{s}</div>
                  <div className="cvd-spec-lbl">{["Area", "Beds", "Baths", "Views"][i] || "Detail"}</div>
                </div>
              ))}
            </div>

            <div className="cvd-btns">
              <a href={WA_MSG(activeProperty)} target="_blank" rel="noopener noreferrer" className="btn-wa">
                <span>💬</span>
                Inquire on WhatsApp
              </a>
              <a href={WA_OTHER} target="_blank" rel="noopener noreferrer" className="btn-wa-ghost">
                <span>🏠</span>
                View Other Properties
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Banner - Other Properties Available */}
      <div style={{ maxWidth: "1400px", margin: "32px auto 0", padding: "0 5%" }}>
        <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0a0a1a)", border: "1px solid rgba(198,168,75,0.2)", borderRadius: "8px", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "32px" }}>🏗️</div>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(16px, 3vw, 20px)", color: "#fff" }}>Looking for something else?</div>
              <div style={{ fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Explore our complete portfolio of 50+ luxury properties</div>
            </div>
          </div>
          <a href={WA_OTHER} target="_blank" rel="noopener noreferrer" style={{ background: "#25D366", color: "#000", border: "none", padding: "12px 28px", fontSize: "8px", fontWeight: "700", letterSpacing: "0.35em", textTransform: "uppercase", textDecoration: "none", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "10px", transition: "all 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            <span>📱</span> Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="re-marquee-wrap">
        <div className="re-marquee">
          {["Burj Khalifa Sky Penthouse", "Palm Jumeirah Signature Villa", "Emirates Hills Mansion", "Dubai Marina Infinity Tower", "Al Barari Nature Retreat",
            "Burj Khalifa Sky Penthouse", "Palm Jumeirah Signature Villa", "Emirates Hills Mansion", "Dubai Marina Infinity Tower", "Al Barari Nature Retreat"
          ].map((b, i) => <span key={i} className="re-marquee-item">{b} &nbsp;·</span>)}
        </div>
      </div>

      <div className="re-bottom-rule" />
    </section>
  );
}