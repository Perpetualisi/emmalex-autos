import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const WA = "https://wa.me/2347034627308";
const WA_MSG = (brand, model) =>
  `${WA}?text=${encodeURIComponent(`Hello Emmalex Equipment! I'm interested in leasing the ${brand} ${model}. Please send me more details.`)}`;
const WA_LEASE = (brand, model) =>
  `${WA}?text=${encodeURIComponent(`Hello Emmalex Equipment! I'd like to book a site visit and leasing consultation for the ${brand} ${model}.`)}`;
const WA_OTHER = `${WA}?text=${encodeURIComponent(`Hello Emmalex Equipment! I'm interested in your other heavy equipment. Please share your complete inventory and pricing.`)}`;

const CATEGORIES = ["All", "Excavators", "Loaders", "Cranes", "Dump Trucks", "Generators"];

// 5 Most Popular Equipment Models
const EQUIPMENT = [
  { 
    id: 1, 
    brand: "Caterpillar", 
    model: "CAT 336", 
    category: "Excavators", 
    tag: "HIGH DEMAND", 
    specs: ["336 HP", "72,600 lbs", "4.5 yd³"], 
    bodyColor: 0xe8b820, 
    accent: "#E8B820", 
    type: "excavator", 
    description: "The most popular excavator in Nigeria - powerful, reliable, and fuel-efficient for all construction needs."
  },
  { 
    id: 2, 
    brand: "Caterpillar", 
    model: "980M", 
    category: "Loaders", 
    tag: "PRODUCTIVE", 
    specs: ["393 HP", "65,000 lbs", "5.5 yd³"], 
    bodyColor: 0xe8b820, 
    accent: "#E8B820", 
    type: "wheel_loader", 
    description: "High-performance wheel loader with exceptional fuel efficiency and massive bucket capacity."
  },
  { 
    id: 3, 
    brand: "Liebherr", 
    model: "LTM 1050-3.1", 
    category: "Cranes", 
    tag: "HEAVY LIFT", 
    specs: ["50 ton", "200 ft reach", "100% duty"], 
    bodyColor: 0x1a472a, 
    accent: "#2D6A4F", 
    type: "mobile_crane", 
    description: "Mobile crane with 50-ton capacity - perfect for high-rise construction and heavy lifting projects."
  },
  { 
    id: 4, 
    brand: "Caterpillar", 
    model: "775G", 
    category: "Dump Trucks", 
    tag: "OFF-ROAD", 
    specs: ["690 HP", "70 ton", "24.5 yd³"], 
    bodyColor: 0xe8b820, 
    accent: "#E8B820", 
    type: "dump_truck", 
    description: "Off-road dump truck built for Nigerian terrain - unmatched durability and hauling capacity."
  },
  { 
    id: 5, 
    brand: "Caterpillar", 
    model: "XQP300", 
    category: "Generators", 
    tag: "INDUSTRIAL", 
    specs: ["300 kVA", "415V", "50/60 Hz"], 
    bodyColor: 0xe8b820, 
    accent: "#E8B820", 
    type: "generator", 
    description: "Industrial-grade generator delivering reliable power for construction sites and industrial facilities."
  },
];

/* ─────────────────────────────────────────────────────────────
   3D MODEL BUILDER FUNCTIONS
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
  equipmentPaint: (color, metalness = 0.85, roughness = 0.35) => new THREE.MeshStandardMaterial({
    color: color, metalness: metalness, roughness: roughness, flatShading: false
  }),
  mattePaint: (color) => new THREE.MeshStandardMaterial({
    color: color, metalness: 0.4, roughness: 0.65,
  }),
  glass: () => new THREE.MeshPhysicalMaterial({
    color: 0x88aacc, metalness: 0.8, roughness: 0.15, transparent: true, opacity: 0.55, ior: 1.52,
  }),
  chrome: () => new THREE.MeshStandardMaterial({
    color: 0xc0d0e0, metalness: 0.95, roughness: 0.08, emissive: 0x224466, emissiveIntensity: 0.08,
  }),
  rubber: () => new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.85, metalness: 0.05 }),
  light: (color, intensity = 0.7) => new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: intensity }),
  shadow: () => new THREE.ShadowMaterial({ opacity: 0.35, transparent: true, color: 0x000000 }),
};

function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function buildHeavyWheel() {
  const group = new THREE.Group();
  const tire = mesh(GEO.cyl(0.45, 0.45, 0.35, 32), MAT.rubber());
  tire.rotation.x = Math.PI / 2;
  group.add(tire);
  const rim = mesh(GEO.cyl(0.32, 0.32, 0.38, 24), MAT.chrome());
  rim.rotation.x = Math.PI / 2;
  group.add(rim);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const spoke = mesh(GEO.box(0.06, 0.42, 0.06), MAT.chrome());
    spoke.position.set(Math.sin(angle) * 0.22, 0, Math.cos(angle) * 0.22);
    group.add(spoke);
  }
  return group;
}

// EXCAVATOR
function buildExcavator(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.equipmentPaint(bodyColor, 0.82, 0.38);
  const dark = MAT.mattePaint(0x2a2a2a);
  const chrome = MAT.chrome();
  const glass = MAT.glass();

  const body = mesh(GEO.box(1.8, 1.1, 1.9), paint);
  body.position.set(0, 0.15, 0);
  group.add(body);
  
  const cabin = mesh(GEO.box(1.1, 1.0, 1.2), glass);
  cabin.position.set(0.65, 0.6, 0);
  group.add(cabin);
  
  const roof = mesh(GEO.box(1.15, 0.08, 1.25), paint);
  roof.position.set(0.65, 1.05, 0);
  group.add(roof);
  
  const exhaust = mesh(GEO.cyl(0.08, 0.09, 0.55, 12), chrome);
  exhaust.position.set(-0.45, 0.85, 0.65);
  group.add(exhaust);
  
  const counterweight = mesh(GEO.box(0.9, 0.8, 0.9), dark);
  counterweight.position.set(-1.05, 0.25, 0);
  group.add(counterweight);
  
  const trackFrame = mesh(GEO.box(2.2, 0.25, 2.4), dark);
  trackFrame.position.set(0, -0.55, 0);
  group.add(trackFrame);
  
  for (let i = -0.9; i <= 0.9; i += 0.6) {
    const trackL = mesh(GEO.box(0.18, 0.12, 0.35), MAT.rubber());
    trackL.position.set(-1.15, -0.68, i);
    group.add(trackL);
    const trackR = mesh(GEO.box(0.18, 0.12, 0.35), MAT.rubber());
    trackR.position.set(1.15, -0.68, i);
    group.add(trackR);
  }
  
  const boomBase = mesh(GEO.box(0.35, 0.35, 0.6), paint);
  boomBase.position.set(1.25, 0.45, 0);
  group.add(boomBase);
  const boomArm = mesh(GEO.box(1.8, 0.28, 0.4), paint);
  boomArm.position.set(2.45, 0.65, 0);
  boomArm.rotation.z = -0.35;
  group.add(boomArm);
  const stick = mesh(GEO.box(1.5, 0.25, 0.35), paint);
  stick.position.set(3.6, 0.35, 0);
  stick.rotation.z = 0.5;
  group.add(stick);
  
  const bucket = mesh(GEO.box(0.7, 0.6, 1.1), dark);
  bucket.position.set(4.4, 0.15, 0);
  bucket.rotation.z = 0.25;
  group.add(bucket);
  const teeth = mesh(GEO.box(0.1, 0.08, 1.05), chrome);
  teeth.position.set(4.75, 0.08, 0);
  group.add(teeth);
  
  const cylinder = mesh(GEO.cyl(0.08, 0.08, 1.2, 12), chrome);
  cylinder.position.set(2.1, 0.92, 0.25);
  cylinder.rotation.z = -0.4;
  group.add(cylinder);
  
  const light = mesh(GEO.sphere(0.08, 16, 16), MAT.light(0xffaa66, 0.5));
  light.position.set(1.55, 0.35, 1.05);
  group.add(light);
  
  const wheelPos = [[-0.8, -0.68, 1.1], [0.8, -0.68, 1.1], [-0.8, -0.68, -1.1], [0.8, -0.68, -1.1], [0, -0.68, 1.3], [0, -0.68, -1.3]];
  const wheels = [];
  wheelPos.forEach(pos => {
    const wheel = buildHeavyWheel();
    wheel.position.set(pos[0], pos[1], pos[2]);
    wheel.scale.set(0.7, 0.7, 0.7);
    group.add(wheel);
    wheels.push(wheel);
  });
  
  return { group, wheels };
}

// WHEEL LOADER
function buildWheelLoader(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.equipmentPaint(bodyColor, 0.8, 0.4);
  const dark = MAT.mattePaint(0x2a2a2a);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  
  const body = mesh(GEO.box(2.0, 0.9, 1.8), paint);
  body.position.set(0, 0.2, 0);
  group.add(body);
  
  const cabin = mesh(GEO.box(1.0, 0.9, 1.1), glass);
  cabin.position.set(0.55, 0.7, 0);
  group.add(cabin);
  
  const counterweight = mesh(GEO.box(0.7, 0.7, 0.8), dark);
  counterweight.position.set(-1.15, 0.25, 0);
  group.add(counterweight);
  
  const armL = mesh(GEO.box(1.6, 0.2, 0.25), paint);
  armL.position.set(0.8, 0.65, 0.9);
  armL.rotation.z = -0.25;
  group.add(armL);
  const armR = mesh(GEO.box(1.6, 0.2, 0.25), paint);
  armR.position.set(0.8, 0.65, -0.9);
  armR.rotation.z = -0.25;
  group.add(armR);
  
  const bucket = mesh(GEO.box(1.6, 0.55, 1.45), dark);
  bucket.position.set(2.2, 0.25, 0);
  group.add(bucket);
  const cuttingEdge = mesh(GEO.box(0.08, 0.08, 1.5), chrome);
  cuttingEdge.position.set(2.65, 0.15, 0);
  group.add(cuttingEdge);
  
  const wheels = [];
  const wheelPos = [[-1.1, -0.55, 1.0], [0.4, -0.55, 1.0], [-1.1, -0.55, -1.0], [0.4, -0.55, -1.0]];
  wheelPos.forEach(pos => {
    const wheel = buildHeavyWheel();
    wheel.position.set(pos[0], pos[1], pos[2]);
    group.add(wheel);
    wheels.push(wheel);
  });
  
  return { group, wheels };
}

// MOBILE CRANE
function buildMobileCrane(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.equipmentPaint(bodyColor, 0.78, 0.42);
  const dark = MAT.mattePaint(0x2a2a2a);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  
  const chassis = mesh(GEO.box(2.5, 0.45, 2.2), paint);
  chassis.position.set(0, -0.2, 0);
  group.add(chassis);
  
  const cab = mesh(GEO.box(0.9, 0.8, 1.4), glass);
  cab.position.set(0.85, 0.25, 0);
  group.add(cab);
  
  const superstructure = mesh(GEO.box(1.6, 0.7, 2.0), paint);
  superstructure.position.set(-0.65, 0.15, 0);
  group.add(superstructure);
  
  const boomBase = mesh(GEO.box(1.5, 0.28, 0.55), paint);
  boomBase.position.set(-1.8, 0.65, 0);
  boomBase.rotation.x = 0.25;
  group.add(boomBase);
  const boomMid = mesh(GEO.box(1.2, 0.22, 0.48), paint);
  boomMid.position.set(-2.7, 0.8, 0);
  boomMid.rotation.x = 0.2;
  group.add(boomMid);
  const boomTop = mesh(GEO.box(0.9, 0.18, 0.42), paint);
  boomTop.position.set(-3.5, 0.92, 0);
  boomTop.rotation.x = 0.15;
  group.add(boomTop);
  
  const cable = mesh(GEO.cyl(0.04, 0.04, 0.6, 6), chrome);
  cable.position.set(-3.9, 0.65, 0);
  group.add(cable);
  const hook = mesh(GEO.torus(0.08, 0.03, 12, 24), chrome);
  hook.position.set(-3.9, 0.35, 0);
  hook.rotation.x = Math.PI / 2;
  group.add(hook);
  
  const outPos = [[-1.2, -0.48, 1.3], [1.0, -0.48, 1.3], [-1.2, -0.48, -1.3], [1.0, -0.48, -1.3]];
  outPos.forEach(pos => {
    const outrigger = mesh(GEO.box(0.2, 0.08, 0.4), chrome);
    outrigger.position.set(pos[0], pos[1], pos[2]);
    group.add(outrigger);
  });
  
  const wheels = [];
  const wheelPos = [[-1.3, -0.55, 0.9], [-0.2, -0.55, 0.9], [0.8, -0.55, 0.9], [-1.3, -0.55, -0.9], [-0.2, -0.55, -0.9], [0.8, -0.55, -0.9]];
  wheelPos.forEach(pos => {
    const wheel = buildHeavyWheel();
    wheel.position.set(pos[0], pos[1], pos[2]);
    wheel.scale.set(0.65, 0.65, 0.65);
    group.add(wheel);
    wheels.push(wheel);
  });
  
  return { group, wheels };
}

// DUMP TRUCK
function buildDumpTruck(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.equipmentPaint(bodyColor, 0.75, 0.45);
  const dark = MAT.mattePaint(0x3a3a3a);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  
  const chassis = mesh(GEO.box(3.2, 0.5, 2.3), paint);
  chassis.position.set(0, -0.15, 0);
  group.add(chassis);
  
  const cab = mesh(GEO.box(1.1, 0.85, 1.5), glass);
  cab.position.set(1.1, 0.3, 0);
  group.add(cab);
  
  const dumpBody = mesh(GEO.box(2.4, 0.85, 2.2), paint);
  dumpBody.position.set(-0.8, 0.35, 0);
  dumpBody.rotation.x = 0.1;
  group.add(dumpBody);
  
  const lift = mesh(GEO.cyl(0.08, 0.08, 0.7, 10), chrome);
  lift.position.set(-0.2, -0.05, 0.8);
  lift.rotation.z = 0.3;
  group.add(lift);
  
  const exhaust = mesh(GEO.cyl(0.08, 0.09, 0.65, 10), chrome);
  exhaust.position.set(1.45, 0.6, 1.1);
  group.add(exhaust);
  
  const wheels = [];
  const wheelPos = [[-1.3, -0.55, 1.05], [0.2, -0.55, 1.05], [-1.3, -0.55, -1.05], [0.2, -0.55, -1.05], [1.4, -0.55, 1.2], [1.4, -0.55, -1.2]];
  wheelPos.forEach(pos => {
    const wheel = buildHeavyWheel();
    wheel.position.set(pos[0], pos[1], pos[2]);
    group.add(wheel);
    wheels.push(wheel);
  });
  
  return { group, wheels };
}

// GENERATOR
function buildGenerator(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.equipmentPaint(bodyColor, 0.65, 0.55);
  const dark = MAT.mattePaint(0x2a2a2a);
  const chrome = MAT.chrome();
  
  const enclosure = mesh(GEO.box(2.0, 1.1, 1.0), paint);
  enclosure.position.set(0, 0, 0);
  group.add(enclosure);
  
  const controlPanel = mesh(GEO.box(0.5, 0.4, 0.08), dark);
  controlPanel.position.set(-0.9, 0.35, 0.51);
  group.add(controlPanel);
  
  const exhaustPipe = mesh(GEO.cyl(0.06, 0.06, 0.45, 8), chrome);
  exhaustPipe.position.set(0.8, 0.7, 0.45);
  group.add(exhaustPipe);
  
  const fuelTank = mesh(GEO.box(0.8, 0.5, 0.5), dark);
  fuelTank.position.set(0.7, 0.1, -0.55);
  group.add(fuelTank);
  
  const radiator = mesh(GEO.box(0.6, 0.45, 0.08), dark);
  radiator.position.set(1.05, 0.25, 0);
  group.add(radiator);
  
  const eyePos = [[-0.8, 0.65, 0.45], [0.8, 0.65, 0.45], [-0.8, 0.65, -0.45], [0.8, 0.65, -0.45]];
  eyePos.forEach(pos => {
    const eye = mesh(GEO.torus(0.07, 0.04, 8, 16), chrome);
    eye.position.set(pos[0], pos[1], pos[2]);
    group.add(eye);
  });
  
  return { group, wheels: [] };
}

function buildEquipment(type, bodyColor) {
  if (type === "excavator") return buildExcavator(bodyColor);
  if (type === "wheel_loader") return buildWheelLoader(bodyColor);
  if (type === "mobile_crane") return buildMobileCrane(bodyColor);
  if (type === "dump_truck") return buildDumpTruck(bodyColor);
  if (type === "generator") return buildGenerator(bodyColor);
  return buildExcavator(bodyColor);
}

/* ─────────────────────────────────────────────────────────────
   ENVIRONMENT SETUP
───────────────────────────────────────────────────────────── */
function buildEnvironment(scene) {
  scene.background = new THREE.Color(0x0a0e1a);
  scene.fog = new THREE.FogExp2(0x0a0e1a, 0.0018);
  
  const ambient = new THREE.AmbientLight(0x33334e, 0.7);
  scene.add(ambient);
  
  const keyLight = new THREE.DirectionalLight(0xfff0e0, 1.6);
  keyLight.position.set(4, 7, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.camera.left = -8;
  keyLight.shadow.camera.right = 8;
  keyLight.shadow.camera.top = 8;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);
  
  const fillLight = new THREE.PointLight(0x88aaff, 0.9);
  fillLight.position.set(-2, 3, 4);
  scene.add(fillLight);
  
  const backRim = new THREE.PointLight(0xffaa66, 0.8);
  backRim.position.set(0, 2, -6);
  scene.add(backRim);
  
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 14),
    new THREE.MeshStandardMaterial({ color: 0x1a1e2e, metalness: 0.7, roughness: 0.45, emissive: 0x0a0e1a, emissiveIntensity: 0.08 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.68;
  ground.receiveShadow = true;
  scene.add(ground);
  
  const grid = new THREE.GridHelper(18, 20, 0x4466aa, 0x224466);
  grid.position.y = -0.67;
  grid.material.transparent = true;
  grid.material.opacity = 0.2;
  scene.add(grid);
  
  const shadowCatcher = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 6),
    new THREE.ShadowMaterial({ opacity: 0.4, transparent: true, color: 0x000000, blur: 1.5 })
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.66;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);
}

/* ─────────────────────────────────────────────────────────────
   3D SCENE COMPONENT
───────────────────────────────────────────────────────────── */
function EquipmentScene({ equipment }) {
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
    renderer.toneMappingExposure = 2.4;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    
    const camera = new THREE.PerspectiveCamera(32, mount.clientWidth / mount.clientHeight, 0.1, 45);
    camera.position.set(5.5, 3.2, 7.8);
    camera.lookAt(0, 0.2, 0);
    
    let isDragging = false, prevMouse = { x: 0, y: 0 };
    let spherical = { theta: 0.5, phi: 1.2, radius: 8.5 };
    const target = new THREE.Vector3(0, 0.2, 0);
    let autoRotateSpeed = 0.0012;
    
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
      spherical.phi = Math.max(0.4, Math.min(1.7, spherical.phi + dy));
      prevMouse = { x: e.clientX, y: e.clientY };
      updateCamera();
    };
    const onWheel = (e) => {
      spherical.radius = Math.max(5.5, Math.min(13, spherical.radius + e.deltaY * 0.01));
      updateCamera();
      e.preventDefault();
    };
    
    const el = renderer.domElement;
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('wheel', onWheel, { passive: false });
    
    const scene = new THREE.Scene();
    buildEnvironment(scene);
    
    const equipmentData = buildEquipment(equipment.type, equipment.bodyColor);
    equipmentData.group.castShadow = true;
    scene.add(equipmentData.group);
    
    const particleCount = 300;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlesPositions[i*3] = (Math.random() - 0.5) * 20;
      particlesPositions[i*3+1] = Math.random() * 5;
      particlesPositions[i*3+2] = (Math.random() - 0.5) * 18;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0x88aacc, size: 0.025, transparent: true, opacity: 0.2 });
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
    
    let raf, lastTime = 0, elapsed = 0;
    const animate = (now) => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += dt;
      
      if (!isDragging) {
        spherical.theta += autoRotateSpeed;
        updateCamera();
      }
      
      equipmentData.group.position.y = Math.sin(elapsed * 1.0) * 0.005;
      if (equipmentData.wheels) {
        equipmentData.wheels.forEach(wheel => {
          wheel.rotation.x += 0.018;
        });
      }
      
      particleSystem.rotation.y = elapsed * 0.015;
      
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);
    
    const resizeObserver = new ResizeObserver(() => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
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
  }, [equipment]);
  
  return <div ref={mountRef} style={{ position: "absolute", inset: 0, cursor: "grab" }} />;
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const SPEC_ICONS = ["⚙️", "📦", "🔄"];
const SPEC_LABELS = ["Engine Power", "Operating Weight", "Capacity"];

export default function Equipment() {
  const [activeCat, setActiveCat] = useState("All");
  const [activeEq, setActiveEq] = useState(EQUIPMENT[0]);
  const [fade, setFade] = useState(true);
  const [mobileTab, setMobileTab] = useState("list");
  const [scanY, setScanY] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  
  const filtered = useMemo(
    () => activeCat === "All" ? EQUIPMENT : EQUIPMENT.filter(e => e.category === activeCat),
    [activeCat]
  );
  
  useEffect(() => {
    let y = 0, raf;
    const tick = () => { y = (y + 0.04) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  
  const selectEquipment = useCallback((eq) => {
    if (eq.id === activeEq.id) return;
    setFade(false);
    setTimeout(() => {
      setActiveEq(eq);
      setFade(true);
      if (window.innerWidth <= 900) setMobileTab("viewer");
    }, 280);
  }, [activeEq]);
  
  useEffect(() => {
    const onKey = (e) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const idx = filtered.findIndex(e => e.id === activeEq.id);
      let next;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = filtered[(idx + 1) % filtered.length];
      else next = filtered[(idx - 1 + filtered.length) % filtered.length];
      if (next) selectEquipment(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeEq, filtered, selectEquipment]);
  
  const accentHex = activeEq.accent;
  
  return (
    <section id="equipment" style={{ background: "#000", position: "relative", overflow: "hidden", fontFamily: "'Overpass Mono',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Overpass+Mono:wght@300;400;600&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes marquee { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes spinCCW { from { transform:translate(-50%,-50%) rotate(0) } to { transform:translate(-50%,-50%) rotate(-360deg) } }
        @keyframes pulse { 0%,100% { opacity:0.06 } 50% { opacity:0.13 } }
        
        .eq-wrap { max-width:1400px; margin:0 auto; }
        
        .eq-head { padding: clamp(70px,10vw,110px) 5% 0; position:relative; z-index:4; }
        .eq-head-inner { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:20px; }
        .eq-eyebrow { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
        .eq-eyebrow-bar { width:22px; height:2px; border-radius:2px; }
        .eq-eyebrow-txt { font-size:8px; font-weight:700; letter-spacing:0.6em; text-transform:uppercase; }
        .eq-title { font-family:'Playfair Display',serif; font-size:clamp(28px,4vw,54px); color:#fff; letter-spacing:-0.02em; line-height:1.05; font-weight:400; }
        .eq-title em { font-style:italic; color:rgba(255,255,255,0.25); }
        .eq-count-block { text-align:right; }
        .eq-count-num { font-family:'Playfair Display',serif; font-size:clamp(40px,6vw,72px); line-height:1; letter-spacing:-0.04em; font-weight:400; }
        .eq-count-lbl { font-size:7px; font-weight:600; letter-spacing:0.45em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-top:5px; }
        .eq-rule { width:56px; height:1.5px; margin-top:22px; border-radius:2px; }
        
        .eq-cats { padding:28px 5% 0; display:flex; flex-wrap:wrap; gap:7px; align-items:center; position:relative; z-index:4; }
        .eq-cat { font-family:'Overpass Mono',monospace; font-size:7.5px; font-weight:600; letter-spacing:0.4em; text-transform:uppercase;
          background:transparent; border:1px solid rgba(255,255,255,0.07); color:rgba(255,255,255,0.28);
          padding:9px 15px; cursor:pointer; transition:all 0.25s; white-space:nowrap; border-radius:2px; }
        .eq-cat:hover { border-color:rgba(255,255,255,0.2); color:rgba(255,255,255,0.65); }
        .eq-cat.on { color:#000; }
        .eq-cats-count { margin-left:auto; font-size:7px; letter-spacing:0.35em; color:rgba(255,255,255,0.18); }
        
        .eq-mob-toggle { display:none; padding:18px 5% 0; gap:2px; position:relative; z-index:4; }
        .eq-mob-tab { flex:1; font-family:'Overpass Mono',monospace; font-size:7.5px; font-weight:600; letter-spacing:0.4em; text-transform:uppercase;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
          color:rgba(255,255,255,0.3); padding:13px; cursor:pointer; text-align:center; transition:all 0.25s; }
        .eq-mob-tab.on { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.85); }
        @media(max-width:900px){ .eq-mob-toggle { display:flex; } }
        
        .eq-grid { padding:24px 5% 0; display:grid; grid-template-columns:400px 1fr; gap:0; position:relative; z-index:4; }
        @media(max-width:1100px){ .eq-grid { grid-template-columns:340px 1fr; } }
        @media(max-width:900px) { .eq-grid { grid-template-columns:1fr; padding:0; } }
        
        .eq-list { border:1px solid rgba(255,255,255,0.06); overflow-y:auto; max-height:78vh;
          scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.12) transparent; position:relative; }
        .eq-list::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent, var(--accent,#E8B820)55, transparent); z-index:5; pointer-events:none; }
        .eq-list::-webkit-scrollbar { width:2px; }
        .eq-list::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15); }
        @media(max-width:900px){ .eq-list { max-height:none; border:none; border-top:1px solid rgba(255,255,255,0.05); overflow-y:visible; }
          .eq-list.hidden { display:none; } }
        
        .eq-row { padding:14px 18px; cursor:pointer; display:grid; grid-template-columns:26px 1fr auto;
          align-items:center; gap:13px; border-left:2px solid transparent;
          border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.2s, border-color 0.2s;
          position:relative; animation:fadeUp 0.45s ease both; background:#000; }
        .eq-row:last-child { border-bottom:none; }
        .eq-row::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg, var(--ra)0a, transparent 60%); opacity:0; transition:opacity 0.25s; pointer-events:none; }
        .eq-row:hover::after, .eq-row.sel::after { opacity:1; }
        .eq-row:hover { background:rgba(255,255,255,0.02); border-left-color:rgba(255,255,255,0.15); }
        .eq-row.sel { background:rgba(255,255,255,0.03); }
        .eq-row-num { font-family:'Playfair Display',serif; font-size:11px; color:rgba(255,255,255,0.1); text-align:right; transition:color 0.2s; }
        .eq-row:hover .eq-row-num, .eq-row.sel .eq-row-num { color:rgba(255,255,255,0.3); }
        .eq-row-info { min-width:0; }
        .eq-row-brand { font-size:6.5px; font-weight:700; letter-spacing:0.5em; text-transform:uppercase; color:rgba(255,255,255,0.25); margin-bottom:2px; }
        .eq-row-model { font-family:'Playfair Display',serif; font-size:clamp(14px,1.6vw,17px); color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2; }
        .eq-row-cat { font-size:6px; font-weight:600; letter-spacing:0.38em; text-transform:uppercase; color:rgba(255,255,255,0.14); margin-top:2px; }
        .eq-row-right { display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
        .eq-row-tag { font-size:5px; font-weight:700; letter-spacing:0.3em; text-transform:uppercase; padding:3px 7px; border:1px solid; white-space:nowrap; border-radius:1px; }
        .eq-row-arrow { font-size:13px; opacity:0; transition:opacity 0.2s, transform 0.2s; }
        .eq-row:hover .eq-row-arrow, .eq-row.sel .eq-row-arrow { opacity:0.6; transform:translateX(2px); }
        
        .eq-viewer { border:1px solid rgba(255,255,255,0.06); border-left:none; display:flex; flex-direction:column; min-height:70vh; }
        @media(max-width:900px){ .eq-viewer { border:none; border-top:1px solid rgba(255,255,255,0.05); min-height:auto; }
          .eq-viewer.hidden { display:none; } }
        
        .eq-canvas { position:relative; flex:1; min-height:500px; overflow:hidden; background:#000; border-radius:4px; }
        @media(max-width:600px){ .eq-canvas { min-height:64vw; } }
        
        .eq-canvas-bg { position:absolute; inset:0; z-index:1; pointer-events:none; transition:background 0.7s ease; }
        .eq-canvas-3d { position:absolute; inset:0; z-index:5; transition:opacity 0.3s ease; }
        .eq-scan-beam { position:absolute; left:0; right:0; height:90px; background:linear-gradient(to bottom, transparent, var(--accent-beam), transparent); pointer-events:none; z-index:6; transition:top 0.05s linear; }
        .eq-crosshair { position:absolute; inset:0; pointer-events:none; z-index:4; }
        .eq-crosshair::before, .eq-crosshair::after { content:''; position:absolute; background:rgba(255,255,255,0.016); }
        .eq-crosshair::before { left:50%; top:0; width:1px; height:100%; }
        .eq-crosshair::after  { top:50%; left:0; width:100%; height:1px; }
        .eq-fade-b { position:absolute; bottom:0; left:0; right:0; height:90px; background:linear-gradient(transparent,#000); pointer-events:none; z-index:7; }
        .eq-fade-l { position:absolute; top:0; left:0; bottom:0; width:55px; background:linear-gradient(90deg,#000,transparent); pointer-events:none; z-index:7; }
        @media(max-width:900px){ .eq-fade-l { display:none; } }
        
        .eq-corner { position:absolute; pointer-events:none; z-index:12; }
        .eq-corner.tl { top:0; left:0; }
        .eq-corner.br { bottom:0; right:0; transform:rotate(180deg); }
        .eq-corner.tr { top:0; right:0; transform:rotate(90deg); }
        .eq-corner.bl { bottom:0; left:0; transform:rotate(-90deg); }
        
        .eq-hud-tl { position:absolute; top:14px; left:14px; z-index:20;
          display:flex; align-items:center; gap:7px; font-size:6px; letter-spacing:0.45em; text-transform:uppercase;
          background:rgba(0,0,0,0.75); backdrop-filter:blur(10px);
          border:1px solid rgba(255,255,255,0.06); padding:5px 11px; border-radius:2px; }
        .eq-hud-dot { width:4px; height:4px; border-radius:50%; animation:pulse 2s ease-in-out infinite; }
        .eq-hud-id { position:absolute; top:14px; right:14px; z-index:20;
          font-family:'Playfair Display',serif; font-size:30px; font-style:italic;
          color:rgba(255,255,255,0.04); pointer-events:none; letter-spacing:-0.03em; }
        .eq-hud-drag { position:absolute; bottom:16px; left:16px; z-index:20;
          font-size:6px; letter-spacing:0.35em; text-transform:uppercase;
          background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);
          padding:5px 10px; border-radius:2px; color:rgba(255,255,255,0.3); pointer-events:none; }
        .eq-hud-name { position:absolute; bottom:18px; right:18px; z-index:20; text-align:right; pointer-events:none; }
        .eq-hud-name-brand { font-size:7px; letter-spacing:0.5em; text-transform:uppercase; color:rgba(255,255,255,0.18); margin-bottom:3px; }
        .eq-hud-name-model { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(13px,1.6vw,18px); }
        
        .eq-reticle { position:absolute; top:50%; left:50%; pointer-events:none; z-index:8;
          animation:spinCCW 28s linear infinite; opacity:0.06; }
        
        .eq-detail { padding:22px 24px 26px; border-top:1px solid rgba(255,255,255,0.05); background:#000; position:relative; z-index:10; }
        .eq-detail::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent, var(--accent,#E8B820)60, transparent); }
        
        .eq-d-head { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:14px; }
        .eq-d-badges { display:flex; align-items:center; gap:7px; flex-wrap:wrap; margin-bottom:7px; }
        .eq-d-brand { font-size:7px; font-weight:700; letter-spacing:0.55em; text-transform:uppercase; }
        .eq-d-cattag { font-size:5.5px; font-weight:600; letter-spacing:0.35em; text-transform:uppercase;
          padding:2.5px 8px; border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.22); border-radius:1px; }
        .eq-d-model { font-family:'Playfair Display',serif; font-size:clamp(20px,2.8vw,32px); color:#fff; font-weight:400; line-height:1.1; }
        .eq-d-desc { font-size:6.5px; color:rgba(255,255,255,0.45); margin-top:6px; letter-spacing:0.15em; max-width:300px; line-height:1.4; }
        
        .eq-d-cta { font-family:'Overpass Mono',monospace; font-size:7.5px; font-weight:700;
          letter-spacing:0.35em; text-transform:uppercase; color:#000;
          border:none; padding:11px 18px; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:7px; border-radius:2px;
          transition:filter 0.25s, transform 0.25s, box-shadow 0.25s; white-space:nowrap; }
        .eq-d-cta:hover { filter:brightness(1.15); transform:translateY(-2px); }
        
        .eq-specs { display:grid; grid-template-columns:repeat(3,1fr); border:1px solid rgba(255,255,255,0.07); margin:12px 0; }
        .eq-spec { text-align:center; padding:13px 6px; border-right:1px solid rgba(255,255,255,0.06); transition:background 0.2s; }
        .eq-spec:last-child { border-right:none; }
        .eq-spec:hover { background:rgba(255,255,255,0.02); }
        .eq-spec-icon { font-size:11px; margin-bottom:4px; opacity:0.6; }
        .eq-spec-val { font-family:'Playfair Display',serif; font-size:clamp(13px,1.8vw,19px); }
        .eq-spec-lbl { font-size:5.5px; font-weight:600; letter-spacing:0.45em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-top:4px; }
        
        .eq-btns { display:flex; gap:10px; flex-wrap:wrap; margin-top:16px; }
        .eq-btn-primary {
          font-family:'Overpass Mono',monospace; font-size:8px; font-weight:700;
          letter-spacing:0.35em; text-transform:uppercase; color:#000;
          border:none; padding:14px 22px; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:9px; border-radius:2px;
          transition:filter 0.3s, transform 0.25s, box-shadow 0.3s;
        }
        .eq-btn-primary:hover { filter:brightness(1.12); transform:translateY(-2px); }
        .eq-btn-ghost {
          font-family:'Overpass Mono',monospace; font-size:8px; font-weight:600;
          letter-spacing:0.35em; text-transform:uppercase; color:rgba(255,255,255,0.4);
          background:transparent; border:1px solid rgba(255,255,255,0.1);
          padding:14px 20px; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:9px; border-radius:2px;
          transition:all 0.25s;
        }
        .eq-btn-ghost:hover { border-color:#25D366; color:#25D366; transform:translateY(-2px); }
        
        @media(max-width:900px){
          .eq-head { padding:72px 5% 0; }
          .eq-d-head { flex-direction:column; gap:12px; }
          .eq-btns { flex-direction:column; }
          .eq-btn-primary, .eq-btn-ghost { width:100%; justify-content:center; padding:15px; }
        }
        @media(max-width:480px){
          .eq-head-inner { flex-direction:column; gap:12px; }
          .eq-count-block { text-align:left; }
        }
        
        .eq-marquee-wrap { border-top:1px solid rgba(255,255,255,0.04); overflow:hidden; padding:13px 0; background:#000; margin-top:36px; }
        .eq-marquee { display:flex; gap:50px; animation:marquee 32s linear infinite; width:max-content; }
        .eq-marquee-item { font-size:7px; font-weight:600; letter-spacing:0.45em; text-transform:uppercase; white-space:nowrap; }
        
        .eq-bottom-rule { height:1px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); }
        
        .eq-wa-banner { background:linear-gradient(135deg, #1a1a2e, #0a0a1a); border:1px solid rgba(198,168,75,0.2); border-radius:8px; margin:20px 5% 0; padding:18px 24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .eq-wa-banner-text { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .eq-wa-icon { font-size:28px; }
        .eq-wa-title { font-family:'Playfair Display',serif; font-size:clamp(14px,2vw,18px); font-weight:400; }
        .eq-wa-sub { font-size:6.5px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-top:4px; }
        .eq-wa-btn { background:#25D366; color:#000; border:none; padding:12px 24px; font-size:8px; font-weight:700; letter-spacing:0.35em; text-transform:uppercase; text-decoration:none; border-radius:4px; display:inline-flex; align-items:center; gap:10px; transition:all 0.3s ease; }
        .eq-wa-btn:hover { transform:translateY(-2px); filter:brightness(1.08); }
        @media(max-width:700px){ .eq-wa-banner { flex-direction:column; text-align:center; } }
      `}</style>
      
      <div className="eq-wrap eq-head">
        <div className="eq-head-inner">
          <div>
            <div className="eq-eyebrow">
              <div className="eq-eyebrow-bar" style={{ background: accentHex }} />
              <div className="eq-eyebrow-txt" style={{ color: accentHex }}>Emmalex Equipment · Heavy Machinery</div>
            </div>
            <h2 className="eq-title">Heavy Machinery<br /><em>For Nigerian Projects.</em></h2>
          </div>
          <div className="eq-count-block">
            <div className="eq-count-num" style={{ color: accentHex }}>100+</div>
            <div className="eq-count-lbl">Units Available</div>
          </div>
        </div>
        <div className="eq-rule" style={{ background: `linear-gradient(90deg, ${accentHex}, transparent)` }} />
      </div>
      
      <div className="eq-wrap eq-cats" style={{ "--accent": accentHex }}>
        {CATEGORIES.map(cat => (
          <button key={cat}
            className={`eq-cat${activeCat === cat ? " on" : ""}`}
            style={activeCat === cat ? { background: accentHex, borderColor: accentHex } : {}}
            onClick={() => setActiveCat(cat)}>
            {cat}
          </button>
        ))}
        <div className="eq-cats-count">{filtered.length} unit{filtered.length !== 1 ? "s" : ""}</div>
      </div>
      
      <div className="eq-wrap eq-mob-toggle">
        <button className={`eq-mob-tab${mobileTab === "list" ? " on" : ""}`}
          style={mobileTab === "list" ? { borderColor: `${accentHex}55`, color: accentHex } : {}}
          onClick={() => setMobileTab("list")}>Inventory</button>
        <button className={`eq-mob-tab${mobileTab === "viewer" ? " on" : ""}`}
          style={mobileTab === "viewer" ? { borderColor: `${accentHex}55`, color: accentHex } : {}}
          onClick={() => setMobileTab("viewer")}>3D Viewer</button>
      </div>
      
      <div className="eq-wrap eq-grid">
        
        <div className={`eq-list${mobileTab === "viewer" ? " hidden" : ""}`}
          style={{ "--accent": accentHex }}>
          {filtered.map((eq, i) => {
            const isSel = eq.id === activeEq.id;
            const isHov = eq.id === hoveredId;
            return (
              <div key={eq.id}
                className={`eq-row${isSel ? " sel" : ""}`}
                style={{
                  "--ra": eq.accent,
                  animationDelay: `${i * 0.05}s`,
                  borderLeftColor: isSel ? eq.accent : (isHov ? "rgba(255,255,255,0.15)" : "transparent"),
                }}
                onClick={() => selectEquipment(eq)}
                onMouseEnter={() => setHoveredId(eq.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && selectEquipment(eq)}
                aria-selected={isSel}>
                <div className="eq-row-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="eq-row-info">
                  <div className="eq-row-brand">{eq.brand}</div>
                  <div className="eq-row-model">{eq.model}</div>
                  <div className="eq-row-cat">{eq.category}</div>
                </div>
                <div className="eq-row-right">
                  {eq.tag && <div className="eq-row-tag" style={{ color: eq.accent, borderColor: `${eq.accent}44` }}>{eq.tag}</div>}
                  <div className="eq-row-arrow" style={{ color: eq.accent }}>›</div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className={`eq-viewer${mobileTab === "list" ? " hidden" : ""}`}>
          <div className="eq-canvas">
            <div className="eq-canvas-bg" style={{
              background: `radial-gradient(ellipse at 50% 60%, ${accentHex}20 0%, transparent 70%)`
            }} />
            
            <div className="eq-scan-beam" style={{
              top: `${scanY}%`,
              "--accent-beam": `${accentHex}18`
            }} />
            
            <div className="eq-crosshair" />
            
            {[["tl"], ["br"], ["tr"], ["bl"]].map(([pos]) => (
              <svg key={pos} className={`eq-corner ${pos}`} width="48" height="48" viewBox="0 0 48 48" fill="none"
                style={{ opacity: 0.35, pointerEvents: "none" }}>
                <path d="M0 48L0 0L48 0" stroke={accentHex} strokeWidth="0.9" fill="none" />
                <circle cx="0" cy="0" r="3" fill={accentHex} opacity="0.8" />
              </svg>
            ))}
            
            <svg className="eq-reticle" width="56" height="56" viewBox="0 0 70 70" fill="none">
              <circle cx="35" cy="35" r="32" stroke={accentHex} strokeWidth="0.7" strokeDasharray="3 5" />
              {[0, 90, 180, 270].map(a => (
                <line key={a}
                  x1="35" y1="2" x2="35" y2="11"
                  stroke={accentHex} strokeWidth="1"
                  transform={`rotate(${a} 35 35)`} />
              ))}
            </svg>
            
            <div className="eq-canvas-3d" style={{ opacity: fade ? 1 : 0 }}>
              <EquipmentScene equipment={activeEq} />
            </div>
            
            <div className="eq-fade-b" />
            <div className="eq-fade-l" />
            
            <div className="eq-hud-tl" style={{ color: accentHex, borderColor: `${accentHex}30` }}>
              <div className="eq-hud-dot" style={{ background: accentHex }} />
              Live 3D · Drag to Rotate
            </div>
            <div className="eq-hud-id">{String(activeEq.id).padStart(2, "0")}</div>
            <div className="eq-hud-drag">⤡ Drag · Scroll to Zoom · ↑↓ Keys</div>
            <div className="eq-hud-name">
              <div className="eq-hud-name-brand">{activeEq.brand}</div>
              <div className="eq-hud-name-model" style={{ color: `${accentHex}99` }}>{activeEq.model}</div>
            </div>
          </div>
          
          <div className="eq-detail" style={{
            "--accent": accentHex,
            opacity: fade ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}>
            <div className="eq-d-head">
              <div>
                <div className="eq-d-badges">
                  <span className="eq-d-brand" style={{ color: accentHex }}>{activeEq.brand}</span>
                  <span className="eq-d-cattag">{activeEq.category}</span>
                  {activeEq.tag && <span className="eq-row-tag" style={{ color: accentHex, borderColor: `${accentHex}44`, fontSize: "5px" }}>{activeEq.tag}</span>}
                </div>
                <div className="eq-d-model">{activeEq.model}</div>
                <div className="eq-d-desc">{activeEq.description}</div>
              </div>
              <a href={WA_MSG(activeEq.brand, activeEq.model)} target="_blank" rel="noopener noreferrer"
                className="eq-d-cta"
                style={{ background: accentHex, boxShadow: `0 6px 24px ${accentHex}33` }}>
                <span style={{ fontSize: 12 }}>💬</span> Get Quote
              </a>
            </div>
            
            <div className="eq-specs" style={{ borderColor: `${accentHex}22` }}>
              {activeEq.specs.map((s, i) => (
                <div key={i} className="eq-spec">
                  <div className="eq-spec-icon">{SPEC_ICONS[i]}</div>
                  <div className="eq-spec-val" style={{ color: accentHex }}>{s}</div>
                  <div className="eq-spec-lbl">{SPEC_LABELS[i]}</div>
                </div>
              ))}
            </div>
            
            <div className="eq-btns">
              <a href={WA_MSG(activeEq.brand, activeEq.model)} target="_blank" rel="noopener noreferrer"
                className="eq-btn-primary"
                style={{ background: `linear-gradient(135deg, ${accentHex} 0%, ${accentHex}cc 100%)`, boxShadow: `0 8px 28px ${accentHex}2a` }}>
                <span style={{ fontSize: 14 }}>💬</span>
                Enquire on WhatsApp
              </a>
              <a href={WA_LEASE(activeEq.brand, activeEq.model)} target="_blank" rel="noopener noreferrer"
                className="eq-btn-ghost">
                <span style={{ fontSize: 14 }}>🏗️</span>
                Schedule Site Visit
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action Banner */}
      <div className="eq-wa-banner">
        <div className="eq-wa-banner-text">
          <div className="eq-wa-icon">🏗️💬</div>
          <div>
            <div className="eq-wa-title">Looking for other equipment?</div>
            <div className="eq-wa-sub">We have 100+ units of heavy machinery in stock — excavators, loaders, cranes, and more</div>
          </div>
        </div>
        <a href={WA_OTHER} target="_blank" rel="noopener noreferrer" className="eq-wa-btn">
          <span>📱</span> Chat on WhatsApp
        </a>
      </div>
      
      <div className="eq-marquee-wrap">
        <div className="eq-marquee">
          {[...Array(2)].flatMap((_, idx) =>
            ["🏗️ CAT 336 | Available Now", "🏗️ CAT 980M | High Demand", "🏗️ Liebherr Crane | Heavy Lift", 
             "🏗️ CAT 775G | Off-Road", "🏗️ CAT XQP300 | Industrial Power", "📍 Nationwide Delivery",
             "✅ Quality Guaranteed", "💰 Competitive Leasing Rates"].map((item, i) => (
              <span key={`${item}-${idx}-${i}`} className="eq-marquee-item" style={{ color: `${accentHex}66` }}>
                {item} &nbsp;·
              </span>
            ))
          )}
        </div>
      </div>
      <div className="eq-bottom-rule" />
    </section>
  );
}