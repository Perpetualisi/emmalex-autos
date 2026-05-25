import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const WA = "https://wa.me/2347034627308";
const WA_MSG = (brand, model) =>
  `${WA}?text=${encodeURIComponent(`Hello Nigeria Used Cars! I'm interested in the ${brand} ${model}. Please send me more details.`)}`;
const WA_GENERAL = `${WA}?text=${encodeURIComponent(`Hello Nigeria Used Cars! I'm interested in your vehicle collection. Please send me more information about available cars.`)}`;

// Five most popular cars in Nigeria
const CARS = [
  { id:1, brand:"Toyota", model:"Hilux", category:"Pickup", tag:"BESTSELLER", specs:["2.8L Turbo","204 HP","4WD"], bodyColor:0x2c5a2c, rimColor:0xaaaaaa, accent:"#4CAF50", type:"pickup_truck", groundClearance:0.42, description:"Nigeria's #1 choice for business and family - rugged, reliable, unstoppable." },
  { id:2, brand:"Toyota", model:"Corolla", category:"Sedan", tag:"BEST VALUE", specs:["1.8L","140 HP","FWD"], bodyColor:0x1a2a4a, rimColor:0xc0c0c0, accent:"#3A7BD5", type:"sedan", groundClearance:0.28, description:"The best-selling sedan in Nigeria - fuel efficient, affordable, trusted nationwide." },
  { id:3, brand:"Honda", model:"CR-V", category:"SUV", tag:"FAMILY FAVORITE", specs:["1.5L Turbo","190 HP","AWD"], bodyColor:0x2a4a5a, rimColor:0xcccccc, accent:"#5DADE2", type:"crossover_suv", groundClearance:0.36, description:"Premium crossover comfort with legendary Honda reliability." },
  { id:4, brand:"Mercedes-Benz", model:"C300", category:"Luxury", tag:"ENTRY LUXURY", specs:["2.0L Turbo","255 HP","RWD"], bodyColor:0x1a1a1a, rimColor:0xc6a84b, accent:"#D4AF37", type:"luxury_sedan", groundClearance:0.26, description:"German engineering meets Nigerian style - the executive choice." },
  { id:5, brand:"Lexus", model:"RX 350", category:"Luxury SUV", tag:"PREMIUM CHOICE", specs:["3.5L V6","295 HP","AWD"], bodyColor:0x0a1a2a, rimColor:0xc6a84b, accent:"#C6A84B", type:"luxury_suv", groundClearance:0.34, description:"Ultimate luxury SUV for Nigerian roads - comfort, power, prestige." },
];

/* ─────────────────────────────────────────────────────────────
   MATERIALS
───────────────────────────────────────────────────────────── */
const GEO = {
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  cyl: (r1, r2, h, s) => new THREE.CylinderGeometry(r1, r2, h, s || 32),
  sphere: (r, ws, hs) => new THREE.SphereGeometry(r, ws || 32, hs || 32),
  torus: (r, t, rs, ts) => new THREE.TorusGeometry(r, t, rs || 32, ts || 64),
  cone: (r, h, s) => new THREE.ConeGeometry(r, h, s || 32),
  plane: (w, h) => new THREE.PlaneGeometry(w, h),
};

const MAT = {
  carPaint: (color, metalness = 0.88, roughness = 0.15) => new THREE.MeshStandardMaterial({
    color: color, metalness: metalness, roughness: roughness
  }),
  pearlPaint: (color) => new THREE.MeshStandardMaterial({
    color: color, metalness: 0.92, roughness: 0.1, emissive: color, emissiveIntensity: 0.02
  }),
  glass: () => new THREE.MeshPhysicalMaterial({
    color: 0xa8d0f0, metalness: 0.95, roughness: 0.1, transparent: true, opacity: 0.7, ior: 1.5
  }),
  chrome: () => new THREE.MeshStandardMaterial({
    color: 0xe8f0ff, metalness: 0.98, roughness: 0.04
  }),
  rubber: () => new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85, metalness: 0.05 }),
  plastic: () => new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6, metalness: 0.1 }),
  headlight: (color, intensity = 0.7) => new THREE.MeshStandardMaterial({
    color: color, emissive: color, emissiveIntensity: intensity, metalness: 0.9, roughness: 0.1
  }),
  taillight: () => new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 0.5 }),
  shadow: () => new THREE.ShadowMaterial({ opacity: 0.4, transparent: true }),
};

function mesh(geo, mat) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; }

function buildWheel(isPremium, rimColor) {
  const group = new THREE.Group();
  const tire = mesh(GEO.torus(0.39, 0.12, 32, 64), MAT.rubber());
  tire.rotation.x = Math.PI / 2;
  group.add(tire);
  const rimBase = mesh(GEO.cyl(0.28, 0.28, 0.12, 40), MAT.chrome());
  rimBase.rotation.x = Math.PI / 2;
  group.add(rimBase);
  const spokeCount = isPremium ? 7 : 6;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const spoke = mesh(GEO.box(0.04, 0.45, 0.04), MAT.chrome());
    spoke.position.set(Math.sin(angle) * 0.16, 0, Math.cos(angle) * 0.16);
    group.add(spoke);
  }
  const centerCap = mesh(GEO.cyl(0.09, 0.09, 0.1, 24), MAT.chrome());
  centerCap.rotation.x = Math.PI / 2;
  group.add(centerCap);
  return group;
}

/* ============================================================
   CAR MODELS
============================================================ */

// TOYOTA HILUX - Rugged pickup truck
function buildPickupTruck(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.carPaint(bodyColor, 0.75, 0.35);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  const plastic = MAT.plastic();
  
  // Bed
  const bed = mesh(GEO.box(4.9, 0.52, 2.15), paint);
  bed.position.y = -0.36;
  group.add(bed);
  
  // Cabin
  const cabin = mesh(GEO.box(2.6, 0.82, 2.15), paint);
  cabin.position.set(-1.35, 0.14, 0);
  group.add(cabin);
  
  // Windows
  const windowFront = mesh(GEO.box(0.4, 0.45, 1.95), glass);
  windowFront.position.set(-1.2, 0.48, 0);
  group.add(windowFront);
  const windowRear = mesh(GEO.box(0.35, 0.4, 1.9), glass);
  windowRear.position.set(-1.85, 0.46, 0);
  group.add(windowRear);
  
  // Grille with TOYOTA lettering
  const grille = mesh(GEO.box(0.13, 0.5, 1.78), chrome);
  grille.position.set(-2.55, -0.08, 0);
  group.add(grille);
  
  // Bull bar
  const bullBar = mesh(GEO.box(0.08, 0.42, 2.05), chrome);
  bullBar.position.set(-2.62, -0.05, 0);
  group.add(bullBar);
  
  // Headlights
  const headlightL = mesh(GEO.box(0.09, 0.16, 0.32), MAT.headlight(0xffeedd, 0.7));
  headlightL.position.set(-2.5, -0.14, 0.98);
  group.add(headlightL);
  const headlightR = mesh(GEO.box(0.09, 0.16, 0.32), MAT.headlight(0xffeedd, 0.7));
  headlightR.position.set(-2.5, -0.14, -0.98);
  group.add(headlightR);
  
  // Taillights
  const tailL = mesh(GEO.box(0.09, 0.18, 0.13), MAT.taillight());
  tailL.position.set(2.52, -0.1, 1.1);
  group.add(tailL);
  const tailR = mesh(GEO.box(0.09, 0.18, 0.13), MAT.taillight());
  tailR.position.set(2.52, -0.1, -1.1);
  group.add(tailR);
  
  // Side steps
  const step = mesh(GEO.box(3.8, 0.04, 0.18), chrome);
  step.position.set(-0.4, -0.48, 1.25);
  group.add(step);
  
  // Roof rails
  const railL = mesh(GEO.box(2.8, 0.05, 0.07), chrome);
  railL.position.set(-1.2, 0.68, 1.12);
  group.add(railL);
  
  // Wheels (off-road style)
  const wheels = [];
  const wheelPos = [[-1.78, -0.52, 1.22], [1.68, -0.52, 1.22], [-1.78, -0.52, -1.22], [1.68, -0.52, -1.22]];
  wheelPos.forEach(pos => { const w = buildWheel(false, 0xaaaaaa); w.position.set(pos[0], pos[1], pos[2]); group.add(w); wheels.push(w); });
  
  return { group, wheels };
}

// TOYOTA COROLLA - Sleek sedan
function buildSedan(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.carPaint(bodyColor, 0.85, 0.2);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  
  const body = mesh(GEO.box(4.3, 0.46, 1.88), paint);
  body.position.y = -0.44;
  group.add(body);
  
  const roof = mesh(GEO.box(3.0, 0.09, 1.68), paint);
  roof.position.set(-0.2, 0.42, 0);
  group.add(roof);
  
  const windshield = mesh(GEO.box(0.35, 0.38, 1.62), glass);
  windshield.position.set(-0.4, 0.52, 0);
  group.add(windshield);
  
  const grille = mesh(GEO.box(0.09, 0.32, 1.55), chrome);
  grille.position.set(2.18, -0.2, 0);
  group.add(grille);
  
  // Headlights
  const headlightL = mesh(GEO.box(0.09, 0.14, 0.32), MAT.headlight(0xffeedd, 0.7));
  headlightL.position.set(2.16, -0.16, 0.92);
  group.add(headlightL);
  const headlightR = mesh(GEO.box(0.09, 0.14, 0.32), MAT.headlight(0xffeedd, 0.7));
  headlightR.position.set(2.16, -0.16, -0.92);
  group.add(headlightR);
  
  // Taillights
  const tailL = mesh(GEO.box(0.07, 0.16, 0.13), MAT.taillight());
  tailL.position.set(-2.2, -0.14, 1.0);
  group.add(tailL);
  const tailR = mesh(GEO.box(0.07, 0.16, 0.13), MAT.taillight());
  tailR.position.set(-2.2, -0.14, -1.0);
  group.add(tailR);
  
  // Wheels
  const wheels = [];
  const wheelPos = [[-1.52, -0.56, 1.04], [1.52, -0.56, 1.04], [-1.52, -0.56, -1.04], [1.52, -0.56, -1.04]];
  wheelPos.forEach(pos => { const w = buildWheel(false, 0xcccccc); w.position.set(pos[0], pos[1], pos[2]); group.add(w); wheels.push(w); });
  
  return { group, wheels };
}

// HONDA CR-V - Crossover SUV
function buildCrossoverSUV(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.carPaint(bodyColor, 0.82, 0.25);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  
  const body = mesh(GEO.box(4.45, 0.52, 2.0), paint);
  body.position.y = -0.38;
  group.add(body);
  
  const roof = mesh(GEO.box(3.5, 0.09, 1.88), paint);
  roof.position.set(-0.1, 0.44, 0);
  group.add(roof);
  
  const grille = mesh(GEO.box(0.11, 0.4, 1.65), chrome);
  grille.position.set(2.28, -0.1, 0);
  group.add(grille);
  
  // Wing logo area
  const logoArea = mesh(GEO.box(0.05, 0.18, 0.45), chrome);
  logoArea.position.set(2.26, 0.02, 0);
  group.add(logoArea);
  
  // LED DRL strip
  const drlL = mesh(GEO.box(0.05, 0.05, 0.35), MAT.headlight(0x88aaff, 0.5));
  drlL.position.set(2.24, 0.08, 0.95);
  group.add(drlL);
  
  const headlightL = mesh(GEO.box(0.09, 0.15, 0.34), MAT.headlight(0xffeedd, 0.7));
  headlightL.position.set(2.24, -0.08, 0.95);
  group.add(headlightL);
  
  const tailL = mesh(GEO.box(0.08, 0.18, 0.14), MAT.taillight());
  tailL.position.set(-2.28, -0.06, 1.08);
  group.add(tailL);
  const tailR = mesh(GEO.box(0.08, 0.18, 0.14), MAT.taillight());
  tailR.position.set(-2.28, -0.06, -1.08);
  group.add(tailR);
  
  // Roof rails
  const railL = mesh(GEO.box(3.2, 0.05, 0.08), chrome);
  railL.position.set(-0.2, 0.62, 1.02);
  group.add(railL);
  const railR = mesh(GEO.box(3.2, 0.05, 0.08), chrome);
  railR.position.set(-0.2, 0.62, -1.02);
  group.add(railR);
  
  const wheels = [];
  const wheelPos = [[-1.62, -0.52, 1.14], [1.62, -0.52, 1.14], [-1.62, -0.52, -1.14], [1.62, -0.52, -1.14]];
  wheelPos.forEach(pos => { const w = buildWheel(true, 0xcccccc); w.position.set(pos[0], pos[1], pos[2]); group.add(w); wheels.push(w); });
  
  return { group, wheels };
}

// MERCEDES-BENZ C300 - Luxury sedan
function buildLuxurySedan(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.pearlPaint(bodyColor);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  
  const body = mesh(GEO.box(4.5, 0.48, 1.92), paint);
  body.position.y = -0.42;
  group.add(body);
  
  const roof = mesh(GEO.box(3.2, 0.1, 1.72), paint);
  roof.position.set(-0.15, 0.44, 0);
  group.add(roof);
  
  // Panoramic sunroof
  const sunroof = mesh(GEO.box(2.2, 0.03, 1.4), MAT.glass());
  sunroof.position.set(-0.2, 0.52, 0);
  group.add(sunroof);
  
  // Star grille
  const grille = mesh(GEO.box(0.12, 0.44, 1.7), chrome);
  grille.position.set(2.32, -0.08, 0);
  group.add(grille);
  
  const star = mesh(GEO.sphere(0.045, 16, 16), chrome);
  star.position.set(2.38, 0.04, 0);
  group.add(star);
  
  // LED headlights
  const headlightL = mesh(GEO.box(0.08, 0.14, 0.38), MAT.headlight(0xffeedd, 0.8));
  headlightL.position.set(2.28, -0.1, 0.96);
  group.add(headlightL);
  const drlL = mesh(GEO.box(0.04, 0.04, 0.32), MAT.headlight(0x88aaff, 0.6));
  drlL.position.set(2.26, 0.04, 0.96);
  group.add(drlL);
  
  const tailL = mesh(GEO.box(0.06, 0.15, 0.14), MAT.taillight());
  tailL.position.set(-2.28, -0.08, 1.02);
  group.add(tailL);
  const tailR = mesh(GEO.box(0.06, 0.15, 0.14), MAT.taillight());
  tailR.position.set(-2.28, -0.08, -1.02);
  group.add(tailR);
  
  // Dual exhaust
  const exhaustL = mesh(GEO.cyl(0.06, 0.06, 0.18, 16), chrome);
  exhaustL.position.set(-2.18, -0.48, 0.72);
  exhaustL.rotation.x = Math.PI / 2;
  group.add(exhaustL);
  const exhaustR = mesh(GEO.cyl(0.06, 0.06, 0.18, 16), chrome);
  exhaustR.position.set(-2.18, -0.48, -0.72);
  exhaustR.rotation.x = Math.PI / 2;
  group.add(exhaustR);
  
  const wheels = [];
  const wheelPos = [[-1.58, -0.56, 1.08], [1.58, -0.56, 1.08], [-1.58, -0.56, -1.08], [1.58, -0.56, -1.08]];
  wheelPos.forEach(pos => { const w = buildWheel(true, 0xc6a84b); w.position.set(pos[0], pos[1], pos[2]); group.add(w); wheels.push(w); });
  
  return { group, wheels };
}

// LEXUS RX 350 - Luxury SUV (spindle grille)
function buildLuxurySUV(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.pearlPaint(bodyColor);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  
  const body = mesh(GEO.box(4.7, 0.54, 2.08), paint);
  body.position.y = -0.35;
  group.add(body);
  
  const roof = mesh(GEO.box(3.9, 0.09, 1.96), paint);
  roof.position.set(0, 0.46, 0);
  group.add(roof);
  
  // Signature spindle grille
  const grille = mesh(GEO.box(0.13, 0.48, 1.72), chrome);
  grille.position.set(2.44, -0.05, 0);
  group.add(grille);
  
  // Mesh pattern
  for (let i = -0.75; i <= 0.75; i += 0.12) {
    const bar = mesh(GEO.box(0.04, 0.02, 0.04), chrome);
    bar.position.set(2.42, -0.05, i);
    group.add(bar);
  }
  
  // L-shaped headlights
  const headlightL = mesh(GEO.box(0.09, 0.15, 0.36), MAT.headlight(0xffeedd, 0.75));
  headlightL.position.set(2.4, -0.06, 0.94);
  group.add(headlightL);
  const drlLL = mesh(GEO.box(0.04, 0.04, 0.28), MAT.headlight(0xaaccff, 0.6));
  drlLL.position.set(2.38, 0.06, 0.94);
  group.add(drlLL);
  
  const tailL = mesh(GEO.box(0.08, 0.2, 0.14), MAT.taillight());
  tailL.position.set(-2.4, 0.0, 1.1);
  group.add(tailL);
  const tailR = mesh(GEO.box(0.08, 0.2, 0.14), MAT.taillight());
  tailR.position.set(-2.4, 0.0, -1.1);
  group.add(tailR);
  
  // Chrome window trim
  const trim = mesh(GEO.box(4.2, 0.02, 0.08), chrome);
  trim.position.set(0, 0.22, 1.1);
  group.add(trim);
  
  const wheels = [];
  const wheelPos = [[-1.7, -0.52, 1.2], [1.7, -0.52, 1.2], [-1.7, -0.52, -1.2], [1.7, -0.52, -1.2]];
  wheelPos.forEach(pos => { const w = buildWheel(true, 0xc6a84b); w.position.set(pos[0], pos[1], pos[2]); group.add(w); wheels.push(w); });
  
  return { group, wheels };
}

/* ─────────────────────────────────────────────────────────────
   ENVIRONMENT SETUP
───────────────────────────────────────────────────────────── */
function buildEnvironment(scene) {
  scene.background = new THREE.Color(0x0a0a1a);
  scene.fog = new THREE.FogExp2(0x0a0a1a, 0.0012);
  
  const ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);
  const ambientFill = new THREE.AmbientLight(0x88aaff, 0.5);
  scene.add(ambientFill);
  
  const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.2);
  keyLight.position.set(5, 7, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);
  
  const fillLight = new THREE.DirectionalLight(0xccddff, 1.0);
  fillLight.position.set(-3, 5, 4);
  scene.add(fillLight);
  
  const backLight = new THREE.PointLight(0xffaa77, 0.8);
  backLight.position.set(0, 3, -7);
  scene.add(backLight);
  
  const frontFill = new THREE.PointLight(0xffccaa, 0.6);
  frontFill.position.set(0, 1.5, 7);
  scene.add(frontFill);
  
  // Reflective floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 14),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.92, roughness: 0.08, emissive: 0x0a0a1a, emissiveIntensity: 0.05 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.68;
  floor.receiveShadow = true;
  scene.add(floor);
  
  const shadowCatcher = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 6),
    new THREE.ShadowMaterial({ opacity: 0.4, transparent: true })
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.66;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);
  
  return { animatables: [] };
}

/* ─────────────────────────────────────────────────────────────
   SHOWROOM SCENE COMPONENT
───────────────────────────────────────────────────────────── */
function ShowroomScene({ car }) {
  const mountRef = useRef(null);
  
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    
    const camera = new THREE.PerspectiveCamera(35, mount.clientWidth / mount.clientHeight, 0.1, 50);
    camera.position.set(5.5, 2.8, 8);
    camera.lookAt(0, 0.2, 0);
    
    let isDragging = false, prevMouse = { x: 0, y: 0 };
    let spherical = { theta: 0.4, phi: 1.15, radius: 8.2 };
    const target = new THREE.Vector3(0, 0.2, 0);
    let autoRotateSpeed = 0.0015;
    
    const updateCamera = () => {
      camera.position.set(
        target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
        target.y + spherical.radius * Math.cos(spherical.phi),
        target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
      );
      camera.lookAt(target);
    };
    
    const onPointerDown = (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
    const onPointerUp = () => { isDragging = false; };
    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = (e.clientX - prevMouse.x) * 0.007;
      const dy = (e.clientY - prevMouse.y) * 0.005;
      spherical.theta -= dx;
      spherical.phi = Math.max(0.35, Math.min(1.7, spherical.phi + dy));
      prevMouse = { x: e.clientX, y: e.clientY };
      updateCamera();
    };
    const onWheel = (e) => {
      spherical.radius = Math.max(5, Math.min(14, spherical.radius + e.deltaY * 0.008));
      e.preventDefault();
      updateCamera();
    };
    
    const el = renderer.domElement;
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('wheel', onWheel, { passive: false });
    
    const scene = new THREE.Scene();
    buildEnvironment(scene);
    
    let carData;
    switch (car.type) {
      case 'pickup_truck':
        carData = buildPickupTruck(car.bodyColor);
        break;
      case 'sedan':
        carData = buildSedan(car.bodyColor);
        break;
      case 'crossover_suv':
        carData = buildCrossoverSUV(car.bodyColor);
        break;
      case 'luxury_sedan':
        carData = buildLuxurySedan(car.bodyColor);
        break;
      case 'luxury_suv':
        carData = buildLuxurySUV(car.bodyColor);
        break;
      default:
        carData = buildSedan(car.bodyColor);
    }
    
    carData.group.castShadow = true;
    scene.add(carData.group);
    
    let raf, lastTime = 0, elapsed = 0;
    const animate = (now) => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += dt;
      
      if (!isDragging) spherical.theta += autoRotateSpeed;
      updateCamera();
      
      carData.group.position.y = Math.sin(elapsed * 1.0) * 0.004;
      carData.group.rotation.z = Math.sin(elapsed * 0.6) * 0.001;
      
      carData.wheels.forEach(wheel => { wheel.rotation.x += 0.018; });
      
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);
    
    const resizeObserver = new ResizeObserver(() => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      updateCamera();
    });
    resizeObserver.observe(mount);
    
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [car]);
  
  return <div ref={mountRef} style={{ position: "absolute", inset: 0, cursor: "grab" }} />;
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const SPEC_ICONS = ["⚡", "⏱", "🔄"];
const SPEC_LABELS = ["Engine", "Power", "Drive"];

export default function Cars() {
  const [activeCar, setActiveCar] = useState(CARS[0]);
  const [fade, setFade] = useState(true);
  const [mobileTab, setMobileTab] = useState("list");
  const [scanY, setScanY] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  
  useEffect(() => {
    let y = 0, raf;
    const tick = () => { y = (y + 0.06) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  
  const selectCar = useCallback((car) => {
    if (car.id === activeCar.id) return;
    setFade(false);
    setTimeout(() => {
      setActiveCar(car);
      setFade(true);
      if (window.innerWidth <= 900) setMobileTab("viewer");
    }, 280);
  }, [activeCar]);
  
  useEffect(() => {
    const onKey = (e) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const idx = CARS.findIndex(c => c.id === activeCar.id);
      let next;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = CARS[(idx + 1) % CARS.length];
      else next = CARS[(idx - 1 + CARS.length) % CARS.length];
      if (next) selectCar(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeCar, selectCar]);
  
  const accentHex = activeCar.accent;
  
  return (
    <section id="cars" style={{ background: "#000", position: "relative", overflow: "hidden", fontFamily: "'Inter', 'Overpass Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,600;14..32,700&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes marquee { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes spinCCW { from { transform:translate(-50%,-50%) rotate(0) } to { transform:translate(-50%,-50%) rotate(-360deg) } }
        @keyframes pulse { 0%,100% { opacity:0.08 } 50% { opacity:0.18 } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        
        .car-wrap { max-width:1400px; margin:0 auto; }
        
        .car-head { padding: clamp(60px,8vw,90px) 5% 0; position:relative; z-index:4; }
        .car-head-inner { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:20px; }
        .car-eyebrow { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
        .car-eyebrow-bar { width:28px; height:2px; border-radius:2px; }
        .car-eyebrow-txt { font-size:7px; font-weight:700; letter-spacing:0.5em; text-transform:uppercase; }
        .car-title { font-family:'Playfair Display',serif; font-size:clamp(32px,5vw,62px); color:#fff; letter-spacing:-0.02em; line-height:1.05; font-weight:400; }
        .car-title em { font-style:italic; color:rgba(255,255,255,0.2); }
        .car-count-block { text-align:right; }
        .car-count-num { font-family:'Playfair Display',serif; font-size:clamp(36px,5vw,64px); line-height:1; letter-spacing:-0.04em; font-weight:400; }
        .car-count-lbl { font-size:6px; font-weight:600; letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.25); margin-top:6px; }
        .car-rule { width:60px; height:1.5px; margin-top:20px; border-radius:2px; }
        
        .car-mob-toggle { display:none; padding:16px 5% 0; gap:2px; position:relative; z-index:4; }
        .car-mob-tab { flex:1; font-family:'Inter',monospace; font-size:7px; font-weight:600; letter-spacing:0.35em; text-transform:uppercase;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
          color:rgba(255,255,255,0.35); padding:12px; cursor:pointer; text-align:center; transition:all 0.25s; }
        .car-mob-tab.on { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.85); }
        @media(max-width:900px){ .car-mob-toggle { display:flex; } }
        
        .car-grid { padding:20px 5% 0; display:grid; grid-template-columns:380px 1fr; gap:0; position:relative; z-index:4; }
        @media(max-width:1100px){ .car-grid { grid-template-columns:320px 1fr; } }
        @media(max-width:900px) { .car-grid { grid-template-columns:1fr; padding:0; } }
        
        .car-list { border:1px solid rgba(255,255,255,0.06); overflow-y:auto; max-height:72vh;
          scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.12) transparent; position:relative; background:#000; }
        .car-list::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent, var(--accent,#4CAF50)55, transparent); z-index:5; pointer-events:none; }
        .car-list::-webkit-scrollbar { width:2px; }
        .car-list::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15); }
        @media(max-width:900px){ .car-list { max-height:none; border:none; border-top:1px solid rgba(255,255,255,0.05); overflow-y:visible; }
          .car-list.hidden { display:none; } }
        
        .car-row { padding:16px 20px; cursor:pointer; display:grid; grid-template-columns:28px 1fr auto;
          align-items:center; gap:12px; border-left:2px solid transparent;
          border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.2s, border-color 0.2s;
          position:relative; animation:fadeUp 0.4s ease both; background:#000; }
        .car-row:last-child { border-bottom:none; }
        .car-row:hover { background:rgba(255,255,255,0.02); border-left-color:rgba(255,255,255,0.12); }
        .car-row.sel { background:rgba(255,255,255,0.03); }
        .car-row-num { font-family:'Playfair Display',serif; font-size:12px; color:rgba(255,255,255,0.12); text-align:right; transition:color 0.2s; }
        .car-row:hover .car-row-num, .car-row.sel .car-row-num { color:rgba(255,255,255,0.35); }
        .car-row-brand { font-size:6px; font-weight:700; letter-spacing:0.45em; text-transform:uppercase; color:rgba(255,255,255,0.3); margin-bottom:3px; }
        .car-row-model { font-family:'Playfair Display',serif; font-size:clamp(15px,1.8vw,18px); color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .car-row-cat { font-size:6px; font-weight:600; letter-spacing:0.35em; text-transform:uppercase; color:rgba(255,255,255,0.15); margin-top:3px; }
        .car-row-tag { font-size:5px; font-weight:700; letter-spacing:0.25em; text-transform:uppercase; padding:3px 6px; border:1px solid; white-space:nowrap; border-radius:1px; }
        .car-row-arrow { font-size:14px; opacity:0; transition:opacity 0.2s, transform 0.2s; }
        .car-row:hover .car-row-arrow, .car-row.sel .car-row-arrow { opacity:0.7; transform:translateX(2px); }
        .car-active-bar { position:absolute; left:0; top:0; bottom:0; width:2px; transition:background 0.3s; }
        
        .car-viewer { border:1px solid rgba(255,255,255,0.06); border-left:none; display:flex; flex-direction:column; min-height:68vh; background:#000; }
        @media(max-width:900px){ .car-viewer { border:none; border-top:1px solid rgba(255,255,255,0.05); min-height:auto; }
          .car-viewer.hidden { display:none; } }
        
        .car-canvas { position:relative; flex:1; min-height:480px; overflow:hidden; background:#000; border-radius:4px; }
        @media(max-width:600px){ .car-canvas { min-height:60vw; } }
        
        .car-canvas-bg { position:absolute; inset:0; z-index:1; pointer-events:none; transition:background 0.7s ease; }
        .car-canvas-3d { position:absolute; inset:0; z-index:5; transition:opacity 0.3s ease; }
        .car-scan-beam { position:absolute; left:0; right:0; height:80px; background:linear-gradient(to bottom, transparent, var(--accent-beam), transparent); pointer-events:none; z-index:6; transition:top 0.05s linear; }
        .car-fade-b { position:absolute; bottom:0; left:0; right:0; height:70px; background:linear-gradient(transparent,#000); pointer-events:none; z-index:7; }
        .car-fade-l { position:absolute; top:0; left:0; bottom:0; width:50px; background:linear-gradient(90deg,#000,transparent); pointer-events:none; z-index:7; }
        @media(max-width:900px){ .car-fade-l { display:none; } }
        
        .car-corner { position:absolute; pointer-events:none; z-index:12; }
        .car-corner.tl { top:0; left:0; }
        .car-corner.br { bottom:0; right:0; transform:rotate(180deg); }
        .car-corner.tr { top:0; right:0; transform:rotate(90deg); }
        .car-corner.bl { bottom:0; left:0; transform:rotate(-90deg); }
        
        .car-hud-tl { position:absolute; top:12px; left:12px; z-index:20;
          display:flex; align-items:center; gap:8px; font-size:6px; letter-spacing:0.4em; text-transform:uppercase;
          background:rgba(0,0,0,0.7); backdrop-filter:blur(10px);
          border:1px solid rgba(255,255,255,0.06); padding:5px 10px; border-radius:2px; }
        .car-hud-dot { width:4px; height:4px; border-radius:50%; animation:pulse 2s ease-in-out infinite; }
        .car-hud-id { position:absolute; top:12px; right:12px; z-index:20;
          font-family:'Playfair Display',serif; font-size:26px; font-style:italic;
          color:rgba(255,255,255,0.04); pointer-events:none; letter-spacing:-0.03em; }
        .car-hud-drag { position:absolute; bottom:12px; left:12px; z-index:20;
          font-size:5.5px; letter-spacing:0.3em; text-transform:uppercase;
          background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);
          padding:4px 8px; border-radius:2px; color:rgba(255,255,255,0.3); pointer-events:none; }
        .car-hud-name { position:absolute; bottom:14px; right:14px; z-index:20; text-align:right; pointer-events:none; }
        .car-hud-brand { font-size:6px; letter-spacing:0.45em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-bottom:3px; }
        .car-hud-model { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(12px,1.5vw,17px); }
        
        .car-reticle { position:absolute; top:50%; left:50%; pointer-events:none; z-index:8;
          animation:spinCCW 30s linear infinite; opacity:0.05; }
        
        .car-detail { padding:20px 24px 24px; border-top:1px solid rgba(255,255,255,0.05); background:#000; position:relative; z-index:10; }
        .car-detail::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent, var(--accent,#4CAF50)60, transparent); }
        
        .car-d-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:12px; }
        .car-d-badges { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px; }
        .car-d-brand { font-size:6.5px; font-weight:700; letter-spacing:0.5em; text-transform:uppercase; }
        .car-d-cattag { font-size:5px; font-weight:600; letter-spacing:0.3em; text-transform:uppercase;
          padding:2px 7px; border:1px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.25); border-radius:1px; }
        .car-d-model { font-family:'Playfair Display',serif; font-size:clamp(18px,2.6vw,28px); color:#fff; font-weight:400; line-height:1.1; }
        .car-d-desc { font-size:6px; color:rgba(255,255,255,0.45); margin-top:6px; letter-spacing:0.15em; max-width:300px; line-height:1.4; }
        
        .car-d-cta { font-family:'Inter',monospace; font-size:7px; font-weight:700;
          letter-spacing:0.3em; text-transform:uppercase; color:#000;
          border:none; padding:10px 16px; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:8px; border-radius:2px;
          transition:all 0.25s; white-space:nowrap; }
        .car-d-cta:hover { filter:brightness(1.12); transform:translateY(-2px); }
        
        .car-specs { display:grid; grid-template-columns:repeat(3,1fr); border:1px solid rgba(255,255,255,0.07); margin:12px 0; }
        .car-spec { text-align:center; padding:10px 4px; border-right:1px solid rgba(255,255,255,0.06); transition:background 0.2s; }
        .car-spec:last-child { border-right:none; }
        .car-spec:hover { background:rgba(255,255,255,0.02); }
        .car-spec-icon { font-size:10px; margin-bottom:3px; opacity:0.6; }
        .car-spec-val { font-family:'Playfair Display',serif; font-size:clamp(12px,1.6vw,17px); }
        .car-spec-lbl { font-size:5px; font-weight:600; letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-top:3px; }
        
        .car-btns { display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }
        .car-btn-primary {
          font-family:'Inter',monospace; font-size:7.5px; font-weight:700;
          letter-spacing:0.3em; text-transform:uppercase; color:#000;
          border:none; padding:12px 20px; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:8px; border-radius:2px;
          transition:filter 0.25s, transform 0.25s;
        }
        .car-btn-primary:hover { filter:brightness(1.1); transform:translateY(-2px); }
        .car-btn-ghost {
          font-family:'Inter',monospace; font-size:7.5px; font-weight:600;
          letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.5);
          background:transparent; border:1px solid rgba(255,255,255,0.12);
          padding:12px 18px; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:8px; border-radius:2px;
          transition:all 0.25s;
        }
        .car-btn-ghost:hover { border-color:#25D366; color:#25D366; transform:translateY(-2px); }
        
        @media(max-width:900px){
          .car-head { padding:60px 5% 0; }
          .car-d-head { flex-direction:column; gap:12px; }
          .car-btns { flex-direction:column; }
          .car-btn-primary, .car-btn-ghost { width:100%; justify-content:center; padding:12px; }
        }
        @media(max-width:480px){
          .car-head-inner { flex-direction:column; gap:12px; }
          .car-count-block { text-align:left; }
        }
        
        .car-marquee-wrap { border-top:1px solid rgba(255,255,255,0.04); overflow:hidden; padding:12px 0; background:#000; margin-top:32px; }
        .car-marquee { display:flex; gap:40px; animation:marquee 30s linear infinite; width:max-content; }
        .car-marquee-item { font-size:6.5px; font-weight:600; letter-spacing:0.4em; text-transform:uppercase; white-space:nowrap; }
        
        .car-bottom-rule { height:1px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
        
        .car-wa-banner { background:linear-gradient(135deg, #1a1a2e, #0a0a1a); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin:20px 5% 0; padding:16px 24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .car-wa-banner-text { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .car-wa-icon { font-size:28px; }
        .car-wa-title { font-family:'Playfair Display',serif; font-size:clamp(14px,2vw,18px); font-weight:400; }
        .car-wa-sub { font-size:6.5px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-top:4px; }
        .car-wa-btn { background:#25D366; color:#000; border:none; padding:10px 20px; font-size:7px; font-weight:700; letter-spacing:0.35em; text-transform:uppercase; text-decoration:none; border-radius:2px; transition:transform 0.25s, filter 0.25s; display:inline-flex; align-items:center; gap:8px; }
        .car-wa-btn:hover { transform:translateY(-2px); filter:brightness(1.08); }
        @media(max-width:700px){ .car-wa-banner { flex-direction:column; text-align:center; } }
      `}</style>
      
      <div className="car-wrap car-head">
        <div className="car-head-inner">
          <div>
            <div className="car-eyebrow">
              <div className="car-eyebrow-bar" style={{ background: accentHex }} />
              <div className="car-eyebrow-txt" style={{ color: accentHex }}>Nigeria Used Cars · Premium Dealer</div>
            </div>
            <h2 className="car-title">Nigeria's Most Trusted<br /><em>Pre-Owned Vehicles.</em></h2>
          </div>
          <div className="car-count-block">
            <div className="car-count-num" style={{ color: accentHex }}>500+</div>
            <div className="car-count-lbl">Vehicles in Stock</div>
          </div>
        </div>
        <div className="car-rule" style={{ background: `linear-gradient(90deg, ${accentHex}, transparent)` }} />
      </div>
      
      <div className="car-wrap car-mob-toggle">
        <button className={`car-mob-tab${mobileTab === "list" ? " on" : ""}`}
          style={mobileTab === "list" ? { borderColor: `${accentHex}55`, color: accentHex } : {}}
          onClick={() => setMobileTab("list")}>Collection</button>
        <button className={`car-mob-tab${mobileTab === "viewer" ? " on" : ""}`}
          style={mobileTab === "viewer" ? { borderColor: `${accentHex}55`, color: accentHex } : {}}
          onClick={() => setMobileTab("viewer")}>3D Viewer</button>
      </div>
      
      <div className="car-wrap car-grid">
        
        <div className={`car-list${mobileTab === "viewer" ? " hidden" : ""}`}
          style={{ "--accent": accentHex }}>
          {CARS.map((car, i) => {
            const isSel = car.id === activeCar.id;
            const isHov = car.id === hoveredId;
            return (
              <div key={car.id}
                className={`car-row${isSel ? " sel" : ""}`}
                style={{
                  animationDelay: `${i * 0.05}s`,
                  borderLeftColor: isSel ? car.accent : (isHov ? "rgba(255,255,255,0.12)" : "transparent"),
                }}
                onClick={() => selectCar(car)}
                onMouseEnter={() => setHoveredId(car.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && selectCar(car)}>
                <div className="car-active-bar" style={{ background: isSel ? car.accent : "transparent" }} />
                <div className="car-row-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="car-row-info">
                  <div className="car-row-brand">{car.brand}</div>
                  <div className="car-row-model">{car.model}</div>
                  <div className="car-row-cat">{car.category}</div>
                </div>
                <div className="car-row-right">
                  {car.tag && <div className="car-row-tag" style={{ color: car.accent, borderColor: `${car.accent}44` }}>{car.tag}</div>}
                  <div className="car-row-arrow" style={{ color: car.accent }}>›</div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className={`car-viewer${mobileTab === "list" ? " hidden" : ""}`}>
          <div className="car-canvas">
            <div className="car-canvas-bg" style={{
              background: `radial-gradient(ellipse at 50% 60%, ${accentHex}20 0%, transparent 70%)`
            }} />
            
            <div className="car-scan-beam" style={{
              top: `${scanY}%`,
              "--accent-beam": `${accentHex}18`
            }} />
            
            {[["tl"], ["br"], ["tr"], ["bl"]].map(([pos]) => (
              <svg key={pos} className={`car-corner ${pos}`} width="44" height="44" viewBox="0 0 48 48" fill="none"
                style={{ opacity: 0.3, pointerEvents: "none" }}>
                <path d="M0 48L0 0L48 0" stroke={accentHex} strokeWidth="0.8" fill="none" />
                <circle cx="0" cy="0" r="2.5" fill={accentHex} opacity="0.7" />
              </svg>
            ))}
            
            <svg className="car-reticle" width="50" height="50" viewBox="0 0 70 70" fill="none">
              <circle cx="35" cy="35" r="30" stroke={accentHex} strokeWidth="0.6" strokeDasharray="3 5" />
              {[0, 90, 180, 270].map(a => (
                <line key={a}
                  x1="35" y1="3" x2="35" y2="10"
                  stroke={accentHex} strokeWidth="0.8"
                  transform={`rotate(${a} 35 35)`} />
              ))}
            </svg>
            
            <div className="car-canvas-3d" style={{ opacity: fade ? 1 : 0 }}>
              <ShowroomScene car={activeCar} />
            </div>
            
            <div className="car-fade-b" />
            <div className="car-fade-l" />
            
            <div className="car-hud-tl" style={{ color: accentHex, borderColor: `${accentHex}30` }}>
              <div className="car-hud-dot" style={{ background: accentHex }} />
              Interactive 3D · Drag to Rotate
            </div>
            <div className="car-hud-id">{String(activeCar.id).padStart(2, "0")}</div>
            <div className="car-hud-drag">↺ Drag · Scroll · ↑↓ Keys</div>
            <div className="car-hud-name">
              <div className="car-hud-brand">{activeCar.brand}</div>
              <div className="car-hud-model" style={{ color: `${accentHex}aa` }}>{activeCar.model}</div>
            </div>
          </div>
          
          <div className="car-detail" style={{
            "--accent": accentHex,
            opacity: fade ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}>
            <div className="car-d-head">
              <div>
                <div className="car-d-badges">
                  <span className="car-d-brand" style={{ color: accentHex }}>{activeCar.brand}</span>
                  <span className="car-d-cattag">{activeCar.category}</span>
                  {activeCar.tag && <span className="car-row-tag" style={{ color: accentHex, borderColor: `${accentHex}44`, fontSize: "4.5px" }}>{activeCar.tag}</span>}
                </div>
                <div className="car-d-model">{activeCar.model}</div>
                <div className="car-d-desc">{activeCar.description}</div>
              </div>
              <a href={WA_MSG(activeCar.brand, activeCar.model)} target="_blank" rel="noopener noreferrer"
                className="car-d-cta"
                style={{ background: accentHex, boxShadow: `0 4px 20px ${accentHex}33` }}>
                <span>💬</span> Get Price
              </a>
            </div>
            
            <div className="car-specs" style={{ borderColor: `${accentHex}22` }}>
              {activeCar.specs.map((s, i) => (
                <div key={i} className="car-spec">
                  <div className="car-spec-icon">{SPEC_ICONS[i]}</div>
                  <div className="car-spec-val" style={{ color: accentHex }}>{s}</div>
                  <div className="car-spec-lbl">{SPEC_LABELS[i]}</div>
                </div>
              ))}
            </div>
            
            <div className="car-btns">
              <a href={WA_MSG(activeCar.brand, activeCar.model)} target="_blank" rel="noopener noreferrer"
                className="car-btn-primary"
                style={{ background: `linear-gradient(135deg, ${accentHex} 0%, ${accentHex}cc 100%)` }}>
                <span>💬</span>
                Enquire on WhatsApp
              </a>
              <a href={WA_GENERAL} target="_blank" rel="noopener noreferrer"
                className="car-btn-ghost">
                <span>📞</span>
                View All Inventory
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action Banner - Other Vehicles Available */}
      <div className="car-wa-banner">
        <div className="car-wa-banner-text">
          <div className="car-wa-icon">🚗💬</div>
          <div>
            <div className="car-wa-title">Looking for a different vehicle?</div>
            <div className="car-wa-sub">We have 500+ cars in stock — tell us what you need</div>
          </div>
        </div>
        <a href={WA_GENERAL} target="_blank" rel="noopener noreferrer" className="car-wa-btn">
          <span>📱</span> Chat on WhatsApp
        </a>
      </div>
      
      <div className="car-marquee-wrap">
        <div className="car-marquee">
          {[...Array(3)].flatMap((_, idx) =>
            ["🇳🇬 Hilux | #1 Pickup", "🇳🇬 Corolla | Best-Selling Sedan", "🇳🇬 CR-V | Family SUV", 
             "🇳🇬 C300 | Executive Luxury", "🇳🇬 RX 350 | Premium Choice", "📍 Nationwide Delivery",
             "✅ Quality Guaranteed", "💰 Best Prices in Nigeria"].map((item, i) => (
              <span key={`${item}-${idx}-${i}`} className="car-marquee-item" style={{ color: `${accentHex}66` }}>
                {item} &nbsp;·
              </span>
            ))
          )}
        </div>
      </div>
      <div className="car-bottom-rule" />
    </section>
  );
}