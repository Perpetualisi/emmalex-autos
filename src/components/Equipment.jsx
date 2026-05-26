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

// Enhanced Equipment Data with premium colors
const EQUIPMENT = [
  { 
    id: 1, 
    brand: "Caterpillar", 
    model: "CAT 336", 
    category: "Excavators", 
    tag: "HIGH DEMAND", 
    specs: ["336 HP", "72,600 lbs", "4.5 yd³"], 
    bodyColor: 0xffaa22, 
    accent: "#FFAA22", 
    type: "excavator", 
    description: "The most popular excavator in Nigeria - powerful, reliable, and fuel-efficient for all construction needs.",
    sceneBg: 0x1a1a2a
  },
  { 
    id: 2, 
    brand: "Caterpillar", 
    model: "980M", 
    category: "Loaders", 
    tag: "PRODUCTIVE", 
    specs: ["393 HP", "65,000 lbs", "5.5 yd³"], 
    bodyColor: 0xffaa22, 
    accent: "#FFAA22", 
    type: "wheel_loader", 
    description: "High-performance wheel loader with exceptional fuel efficiency and massive bucket capacity.",
    sceneBg: 0x1a2a1a
  },
  { 
    id: 3, 
    brand: "Liebherr", 
    model: "LTM 1050-3.1", 
    category: "Cranes", 
    tag: "HEAVY LIFT", 
    specs: ["50 ton", "200 ft reach", "100% duty"], 
    bodyColor: 0xcc3333, 
    accent: "#CC3333", 
    type: "mobile_crane", 
    description: "Mobile crane with 50-ton capacity - perfect for high-rise construction and heavy lifting projects.",
    sceneBg: 0x2a1a1a
  },
  { 
    id: 4, 
    brand: "Caterpillar", 
    model: "775G", 
    category: "Dump Trucks", 
    tag: "OFF-ROAD", 
    specs: ["690 HP", "70 ton", "24.5 yd³"], 
    bodyColor: 0xffaa22, 
    accent: "#FFAA22", 
    type: "dump_truck", 
    description: "Off-road dump truck built for Nigerian terrain - unmatched durability and hauling capacity.",
    sceneBg: 0x1a1a2a
  },
  { 
    id: 5, 
    brand: "Caterpillar", 
    model: "XQP300", 
    category: "Generators", 
    tag: "INDUSTRIAL", 
    specs: ["300 kVA", "415V", "50/60 Hz"], 
    bodyColor: 0xffaa22, 
    accent: "#FFAA22", 
    type: "generator", 
    description: "Industrial-grade generator delivering reliable power for construction sites and industrial facilities.",
    sceneBg: 0x2a2a1a
  },
];

/* ─────────────────────────────────────────────────────────────
   ENHANCED MATERIALS
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
  equipmentPaint: (color, metalness = 0.88, roughness = 0.25) => new THREE.MeshStandardMaterial({
    color: color, metalness: metalness, roughness: roughness, flatShading: false
  }),
  metallicPaint: (color) => new THREE.MeshStandardMaterial({
    color: color, metalness: 0.95, roughness: 0.12, emissive: color, emissiveIntensity: 0.03
  }),
  mattePaint: (color) => new THREE.MeshStandardMaterial({
    color: color, metalness: 0.3, roughness: 0.7,
  }),
  glass: () => new THREE.MeshPhysicalMaterial({
    color: 0x88aacc, metalness: 0.85, roughness: 0.12, transparent: true, opacity: 0.65, ior: 1.52,
  }),
  chrome: () => new THREE.MeshStandardMaterial({
    color: 0xc0d0e0, metalness: 0.98, roughness: 0.05, emissive: 0x224466, emissiveIntensity: 0.06,
  }),
  rubber: () => new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.03 }),
  darkRubber: () => new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85, metalness: 0.02 }),
  light: (color, intensity = 0.8) => new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: intensity }),
  shadow: () => new THREE.ShadowMaterial({ opacity: 0.4, transparent: true, color: 0x000000, blur: 1.2 }),
  glow: (color, intensity = 1.2) => new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: intensity }),
};

function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function buildPremiumWheel(isHeavy = true) {
  const group = new THREE.Group();
  const tire = mesh(GEO.cyl(0.48, 0.48, 0.38, 36), MAT.rubber());
  tire.rotation.x = Math.PI / 2;
  group.add(tire);
  
  const rim = mesh(GEO.cyl(0.34, 0.34, 0.42, 32), MAT.chrome());
  rim.rotation.x = Math.PI / 2;
  group.add(rim);
  
  const spokeCount = isHeavy ? 10 : 8;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const spoke = mesh(GEO.box(0.045, 0.48, 0.045), MAT.metallicPaint(0xdddddd));
    spoke.position.set(Math.sin(angle) * 0.24, 0, Math.cos(angle) * 0.24);
    group.add(spoke);
  }
  
  const centerCap = mesh(GEO.cyl(0.12, 0.12, 0.12, 24), MAT.metallicPaint(0xffaa22));
  centerCap.rotation.x = Math.PI / 2;
  group.add(centerCap);
  
  return group;
}

/* ============================================================
   ENHANCED 3D MODELS WITH PREMIUM DETAILS
============================================================ */

// EXCAVATOR - Enhanced with more details
function buildExcavator(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.metallicPaint(bodyColor);
  const dark = MAT.mattePaint(0x2a2a2a);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  const rubber = MAT.darkRubber();
  
  // Main body
  const body = mesh(GEO.box(1.9, 1.15, 1.95), paint);
  body.position.set(0, 0.15, 0);
  group.add(body);
  
  // Cabin with glass
  const cabin = mesh(GEO.box(1.15, 1.05, 1.25), glass);
  cabin.position.set(0.68, 0.65, 0);
  group.add(cabin);
  
  // Cabin roof
  const roof = mesh(GEO.box(1.2, 0.1, 1.3), paint);
  roof.position.set(0.68, 1.1, 0);
  group.add(roof);
  
  // Roof guard bars
  const roofGuard = mesh(GEO.box(1.25, 0.05, 1.35), chrome);
  roofGuard.position.set(0.68, 1.18, 0);
  group.add(roofGuard);
  
  // Exhaust stack
  const exhaust = mesh(GEO.cyl(0.09, 0.1, 0.65, 16), chrome);
  exhaust.position.set(-0.48, 0.95, 0.7);
  group.add(exhaust);
  
  // Counterweight with textured look
  const counterweight = mesh(GEO.box(0.95, 0.85, 0.95), dark);
  counterweight.position.set(-1.1, 0.25, 0);
  group.add(counterweight);
  
  // Track frame
  const trackFrame = mesh(GEO.box(2.3, 0.28, 2.5), dark);
  trackFrame.position.set(0, -0.55, 0);
  group.add(trackFrame);
  
  // Track treads
  for (let i = -1.0; i <= 1.0; i += 0.65) {
    const trackL = mesh(GEO.box(0.2, 0.14, 0.4), rubber);
    trackL.position.set(-1.2, -0.7, i);
    group.add(trackL);
    const trackR = mesh(GEO.box(0.2, 0.14, 0.4), rubber);
    trackR.position.set(1.2, -0.7, i);
    group.add(trackR);
  }
  
  // Boom base
  const boomBase = mesh(GEO.box(0.4, 0.4, 0.65), paint);
  boomBase.position.set(1.3, 0.48, 0);
  group.add(boomBase);
  
  // Main boom
  const boomArm = mesh(GEO.box(1.95, 0.32, 0.45), paint);
  boomArm.position.set(2.55, 0.7, 0);
  boomArm.rotation.z = -0.35;
  group.add(boomArm);
  
  // Arm (stick)
  const stick = mesh(GEO.box(1.65, 0.28, 0.4), paint);
  stick.position.set(3.75, 0.38, 0);
  stick.rotation.z = 0.52;
  group.add(stick);
  
  // Bucket
  const bucket = mesh(GEO.box(0.75, 0.65, 1.2), dark);
  bucket.position.set(4.6, 0.18, 0);
  bucket.rotation.z = 0.28;
  group.add(bucket);
  
  // Bucket teeth
  const teeth = mesh(GEO.box(0.12, 0.09, 1.15), chrome);
  teeth.position.set(4.98, 0.1, 0);
  group.add(teeth);
  
  // Hydraulic cylinders
  const cylinder1 = mesh(GEO.cyl(0.09, 0.09, 1.35, 16), chrome);
  cylinder1.position.set(2.15, 0.98, 0.28);
  cylinder1.rotation.z = -0.42;
  group.add(cylinder1);
  
  const cylinder2 = mesh(GEO.cyl(0.07, 0.07, 1.1, 16), chrome);
  cylinder2.position.set(3.45, 0.85, 0.28);
  cylinder2.rotation.z = 0.65;
  group.add(cylinder2);
  
  // Headlights
  const headlight = mesh(GEO.sphere(0.09, 16), MAT.light(0xffaa66, 0.6));
  headlight.position.set(1.65, 0.38, 1.1);
  group.add(headlight);
  
  // Warning light on top
  const warningLight = mesh(GEO.sphere(0.08, 12), MAT.glow(0xff3300, 0.8));
  warningLight.position.set(0.68, 1.22, 1.0);
  group.add(warningLight);
  
  // Wheels/tracks
  const wheels = [];
  const wheelPos = [[-0.85, -0.7, 1.15], [0.85, -0.7, 1.15], [-0.85, -0.7, -1.15], [0.85, -0.7, -1.15], [0, -0.7, 1.35], [0, -0.7, -1.35]];
  wheelPos.forEach(pos => {
    const wheel = buildPremiumWheel(true);
    wheel.position.set(pos[0], pos[1], pos[2]);
    wheel.scale.set(0.7, 0.7, 0.7);
    group.add(wheel);
    wheels.push(wheel);
  });
  
  return { group, wheels };
}

// WHEEL LOADER - Enhanced
function buildWheelLoader(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.metallicPaint(bodyColor);
  const dark = MAT.mattePaint(0x2a2a2a);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  const rubber = MAT.darkRubber();
  
  // Main chassis
  const chassis = mesh(GEO.box(2.1, 0.95, 1.9), paint);
  chassis.position.set(0, 0.2, 0);
  group.add(chassis);
  
  // Cabin with safety frame
  const cabin = mesh(GEO.box(1.05, 0.95, 1.15), glass);
  cabin.position.set(0.6, 0.75, 0);
  group.add(cabin);
  
  // ROPS (Roll Over Protection Structure)
  const rops = mesh(GEO.box(1.15, 0.08, 1.25), chrome);
  rops.position.set(0.6, 1.25, 0);
  group.add(rops);
  
  // Counterweight
  const counterweight = mesh(GEO.box(0.75, 0.75, 0.85), dark);
  counterweight.position.set(-1.2, 0.28, 0);
  group.add(counterweight);
  
  // Lift arms
  const armL = mesh(GEO.box(1.75, 0.22, 0.28), paint);
  armL.position.set(0.85, 0.72, 0.95);
  armL.rotation.z = -0.28;
  group.add(armL);
  
  const armR = mesh(GEO.box(1.75, 0.22, 0.28), paint);
  armR.position.set(0.85, 0.72, -0.95);
  armR.rotation.z = -0.28;
  group.add(armR);
  
  // Cross bar
  const crossBar = mesh(GEO.box(1.4, 0.12, 0.12), paint);
  crossBar.position.set(1.55, 1.05, 0);
  group.add(crossBar);
  
  // Bucket
  const bucket = mesh(GEO.box(1.75, 0.6, 1.55), dark);
  bucket.position.set(2.35, 0.28, 0);
  group.add(bucket);
  
  // Cutting edge
  const cuttingEdge = mesh(GEO.box(0.09, 0.09, 1.62), chrome);
  cuttingEdge.position.set(2.85, 0.18, 0);
  group.add(cuttingEdge);
  
  // Bucket teeth
  for (let i = -0.7; i <= 0.7; i += 0.35) {
    const tooth = mesh(GEO.cone(0.05, 0.12, 6), chrome);
    tooth.position.set(2.9, 0.12, i);
    group.add(tooth);
  }
  
  // Hydraulic cylinders for bucket
  const hydL = mesh(GEO.cyl(0.07, 0.07, 1.15, 14), chrome);
  hydL.position.set(1.65, 0.98, 0.52);
  hydL.rotation.z = -0.35;
  group.add(hydL);
  
  const hydR = mesh(GEO.cyl(0.07, 0.07, 1.15, 14), chrome);
  hydR.position.set(1.65, 0.98, -0.52);
  hydR.rotation.z = -0.35;
  group.add(hydR);
  
  // Exhaust
  const exhaust = mesh(GEO.cyl(0.08, 0.09, 0.58, 12), chrome);
  exhaust.position.set(-0.85, 0.82, 1.05);
  group.add(exhaust);
  
  // Headlights
  const headlightL = mesh(GEO.sphere(0.07, 12), MAT.light(0xffcc88, 0.5));
  headlightL.position.set(2.05, 0.52, 1.02);
  group.add(headlightL);
  
  // Wheels
  const wheels = [];
  const wheelPos = [[-1.15, -0.58, 1.08], [0.45, -0.58, 1.08], [-1.15, -0.58, -1.08], [0.45, -0.58, -1.08]];
  wheelPos.forEach(pos => {
    const wheel = buildPremiumWheel(false);
    wheel.position.set(pos[0], pos[1], pos[2]);
    group.add(wheel);
    wheels.push(wheel);
  });
  
  return { group, wheels };
}

// MOBILE CRANE - Enhanced with boom sections and outriggers
function buildMobileCrane(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.metallicPaint(bodyColor);
  const dark = MAT.mattePaint(0x2a2a2a);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  
  // Main chassis
  const chassis = mesh(GEO.box(2.6, 0.5, 2.3), paint);
  chassis.position.set(0, -0.18, 0);
  group.add(chassis);
  
  // Operator cab
  const cab = mesh(GEO.box(0.95, 0.85, 1.45), glass);
  cab.position.set(0.95, 0.28, 0);
  group.add(cab);
  
  // Cab roof
  const cabRoof = mesh(GEO.box(1.0, 0.08, 1.5), paint);
  cabRoof.position.set(0.95, 0.72, 0);
  group.add(cabRoof);
  
  // Superstructure (rotating part)
  const superstructure = mesh(GEO.box(1.7, 0.75, 2.1), paint);
  superstructure.position.set(-0.7, 0.18, 0);
  group.add(superstructure);
  
  // Main boom sections (telescopic)
  const boom1 = mesh(GEO.box(1.8, 0.32, 0.6), paint);
  boom1.position.set(-1.95, 0.72, 0);
  boom1.rotation.x = 0.22;
  group.add(boom1);
  
  const boom2 = mesh(GEO.box(1.5, 0.28, 0.55), paint);
  boom2.position.set(-2.95, 0.88, 0);
  boom2.rotation.x = 0.18;
  group.add(boom2);
  
  const boom3 = mesh(GEO.box(1.2, 0.24, 0.5), paint);
  boom3.position.set(-3.85, 1.02, 0);
  boom3.rotation.x = 0.14;
  group.add(boom3);
  
  const boom4 = mesh(GEO.box(0.9, 0.2, 0.45), paint);
  boom4.position.set(-4.65, 1.14, 0);
  boom4.rotation.x = 0.1;
  group.add(boom4);
  
  // Hook and cable
  const cable = mesh(GEO.cyl(0.04, 0.04, 0.7, 8), chrome);
  cable.position.set(-5.1, 0.85, 0);
  group.add(cable);
  
  const hook = mesh(GEO.torus(0.09, 0.035, 14, 28), chrome);
  hook.position.set(-5.1, 0.5, 0);
  hook.rotation.x = Math.PI / 2;
  group.add(hook);
  
  // Counterweight
  const counterweight = mesh(GEO.box(1.2, 0.55, 1.9), dark);
  counterweight.position.set(0.25, -0.05, 0);
  group.add(counterweight);
  
  // Outriggers
  const outPos = [[-1.4, -0.52, 1.4], [1.2, -0.52, 1.4], [-1.4, -0.52, -1.4], [1.2, -0.52, -1.4]];
  outPos.forEach(pos => {
    const outrigger = mesh(GEO.box(0.25, 0.1, 0.5), chrome);
    outrigger.position.set(pos[0], pos[1], pos[2]);
    group.add(outrigger);
    
    const pad = mesh(GEO.box(0.35, 0.05, 0.65), MAT.mattePaint(0x444444));
    pad.position.set(pos[0], pos[1] - 0.08, pos[2]);
    group.add(pad);
  });
  
  // Warning lights
  const warningLight = mesh(GEO.sphere(0.08, 12), MAT.glow(0xff6600, 0.7));
  warningLight.position.set(-0.7, 0.85, 1.2);
  group.add(warningLight);
  
  // Wheels
  const wheels = [];
  const wheelPos = [[-1.4, -0.58, 1.0], [-0.3, -0.58, 1.0], [0.8, -0.58, 1.0], [-1.4, -0.58, -1.0], [-0.3, -0.58, -1.0], [0.8, -0.58, -1.0]];
  wheelPos.forEach(pos => {
    const wheel = buildPremiumWheel(false);
    wheel.position.set(pos[0], pos[1], pos[2]);
    wheel.scale.set(0.65, 0.65, 0.65);
    group.add(wheel);
    wheels.push(wheel);
  });
  
  return { group, wheels };
}

// DUMP TRUCK - Enhanced with detailed body
function buildDumpTruck(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.metallicPaint(bodyColor);
  const dark = MAT.mattePaint(0x2a2a2a);
  const chrome = MAT.chrome();
  const glass = MAT.glass();
  
  // Chassis
  const chassis = mesh(GEO.box(3.4, 0.55, 2.4), paint);
  chassis.position.set(0, -0.12, 0);
  group.add(chassis);
  
  // Operator cab
  const cab = mesh(GEO.box(1.15, 0.9, 1.6), glass);
  cab.position.set(1.2, 0.35, 0);
  group.add(cab);
  
  // Cab roof
  const cabRoof = mesh(GEO.box(1.2, 0.08, 1.65), paint);
  cabRoof.position.set(1.2, 0.82, 0);
  group.add(cabRoof);
  
  // Roll cage
  const rollCage = mesh(GEO.box(1.25, 0.06, 1.7), chrome);
  rollCage.position.set(1.2, 0.92, 0);
  group.add(rollCage);
  
  // Dump body
  const dumpBody = mesh(GEO.box(2.55, 0.95, 2.35), paint);
  dumpBody.position.set(-0.85, 0.42, 0);
  dumpBody.rotation.x = 0.12;
  group.add(dumpBody);
  
  // Dump body reinforcement ribs
  for (let i = -1.0; i <= 1.0; i += 0.5) {
    const rib = mesh(GEO.box(0.06, 0.04, 2.3), chrome);
    rib.position.set(-0.85 + i, 0.95, 0);
    group.add(rib);
  }
  
  // Hydraulic lift cylinder
  const liftCyl = mesh(GEO.cyl(0.09, 0.09, 0.85, 14), chrome);
  liftCyl.position.set(-0.25, -0.02, 0.9);
  liftCyl.rotation.z = 0.35;
  group.add(liftCyl);
  
  const liftCylR = mesh(GEO.cyl(0.09, 0.09, 0.85, 14), chrome);
  liftCylR.position.set(-0.25, -0.02, -0.9);
  liftCylR.rotation.z = 0.35;
  group.add(liftCylR);
  
  // Exhaust stack
  const exhaust = mesh(GEO.cyl(0.09, 0.1, 0.75, 14), chrome);
  exhaust.position.set(1.55, 0.68, 1.15);
  group.add(exhaust);
  
  // Air cleaner
  const airCleaner = mesh(GEO.cyl(0.12, 0.12, 0.4, 16), chrome);
  airCleaner.position.set(1.65, 0.52, -1.1);
  group.add(airCleaner);
  
  // Headlights
  const headlight = mesh(GEO.sphere(0.08, 14), MAT.light(0xffcc66, 0.55));
  headlight.position.set(2.05, 0.35, 1.3);
  group.add(headlight);
  
  // Taillights
  const tailL = mesh(GEO.sphere(0.07, 12), MAT.light(0xff3300, 0.45));
  tailL.position.set(-1.85, 0.35, 1.25);
  group.add(tailL);
  
  // Wheels
  const wheels = [];
  const wheelPos = [[-1.4, -0.58, 1.15], [0.25, -0.58, 1.15], [1.5, -0.58, 1.3], [-1.4, -0.58, -1.15], [0.25, -0.58, -1.15], [1.5, -0.58, -1.3]];
  wheelPos.forEach(pos => {
    const wheel = buildPremiumWheel(true);
    wheel.position.set(pos[0], pos[1], pos[2]);
    wheel.scale.set(0.8, 0.8, 0.8);
    group.add(wheel);
    wheels.push(wheel);
  });
  
  return { group, wheels };
}

// GENERATOR - Enhanced with industrial details
function buildGenerator(bodyColor) {
  const group = new THREE.Group();
  const paint = MAT.metallicPaint(bodyColor);
  const dark = MAT.mattePaint(0x2a2a2a);
  const chrome = MAT.chrome();
  
  // Main enclosure
  const enclosure = mesh(GEO.box(2.1, 1.2, 1.05), paint);
  enclosure.position.set(0, 0.05, 0);
  group.add(enclosure);
  
  // Cooling vents
  for (let i = -0.8; i <= 0.8; i += 0.4) {
    const vent = mesh(GEO.box(0.08, 0.5, 0.03), dark);
    vent.position.set(i, 0.3, 0.54);
    group.add(vent);
  }
  
  // Control panel
  const controlPanel = mesh(GEO.box(0.55, 0.45, 0.09), dark);
  controlPanel.position.set(-0.95, 0.4, 0.54);
  group.add(controlPanel);
  
  // Gauges on panel
  const gauge = mesh(GEO.sphere(0.05, 10), MAT.light(0x44aaff, 0.3));
  gauge.position.set(-0.95, 0.45, 0.58);
  group.add(gauge);
  
  // Exhaust pipe
  const exhaust = mesh(GEO.cyl(0.07, 0.07, 0.55, 12), chrome);
  exhaust.position.set(0.85, 0.85, 0.5);
  group.add(exhaust);
  
  // Exhaust muffler
  const muffler = mesh(GEO.cyl(0.12, 0.12, 0.25, 14), chrome);
  muffler.position.set(0.85, 1.05, 0.5);
  group.add(muffler);
  
  // Fuel tank
  const fuelTank = mesh(GEO.box(0.85, 0.55, 0.55), dark);
  fuelTank.position.set(0.75, 0.15, -0.6);
  group.add(fuelTank);
  
  // Radiator grille
  const radiator = mesh(GEO.box(0.65, 0.5, 0.08), dark);
  radiator.position.set(1.1, 0.3, 0);
  group.add(radiator);
  
  // Lifting eyes
  const eyePos = [[-0.85, 0.75, 0.5], [0.85, 0.75, 0.5], [-0.85, 0.75, -0.5], [0.85, 0.75, -0.5]];
  eyePos.forEach(pos => {
    const eye = mesh(GEO.torus(0.08, 0.045, 10, 20), chrome);
    eye.position.set(pos[0], pos[1], pos[2]);
    group.add(eye);
  });
  
  // Warning decals (small colored squares)
  const decal = mesh(GEO.box(0.08, 0.08, 0.02), MAT.light(0xff6600, 0.4));
  decal.position.set(0.5, 0.95, 0.54);
  group.add(decal);
  
  // Base frame
  const baseFrame = mesh(GEO.box(2.3, 0.08, 1.2), dark);
  baseFrame.position.set(0, -0.2, 0);
  group.add(baseFrame);
  
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
   ENHANCED ENVIRONMENT WITH PREMIUM LIGHTING
───────────────────────────────────────────────────────────── */
function buildEnvironment(scene, bgColor) {
  scene.background = new THREE.Color(bgColor);
  scene.fog = new THREE.FogExp2(bgColor, 0.002);
  
  // Ambient light
  const ambient = new THREE.AmbientLight(0x404060, 0.65);
  scene.add(ambient);
  
  // Key light (main directional)
  const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.2);
  keyLight.position.set(5, 8, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 25;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -10;
  scene.add(keyLight);
  
  // Fill light
  const fillLight = new THREE.PointLight(0x88aaff, 1.0);
  fillLight.position.set(-3, 4, 5);
  scene.add(fillLight);
  
  // Rim light for edge definition
  const rimLight = new THREE.PointLight(0xffaa77, 1.2);
  rimLight.position.set(0, 3, -7);
  scene.add(rimLight);
  
  // Warm fill from below
  const bounceLight = new THREE.PointLight(0xcc8844, 0.6);
  bounceLight.position.set(0, -1, 0);
  scene.add(bounceLight);
  
  // Accent light on equipment
  const accentLight = new THREE.PointLight(0xffaa44, 0.9);
  accentLight.position.set(2, 2, 3);
  scene.add(accentLight);
  
  // Premium reflective ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 16),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.92, roughness: 0.08, emissive: 0x0a0a1a, emissiveIntensity: 0.06 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.72;
  ground.receiveShadow = true;
  scene.add(ground);
  
  // Reflective grid helper
  const gridHelper = new THREE.GridHelper(20, 24, 0x88aaff, 0x335588);
  gridHelper.position.y = -0.7;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.15;
  scene.add(gridHelper);
  
  // Shadow catcher
  const shadowCatcher = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 7),
    new THREE.ShadowMaterial({ opacity: 0.45, transparent: true, color: 0x000000, blur: 1.8 })
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.7;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);
  
  // Ambient particles (dust motes)
  const particleCount = 400;
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesPositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlesPositions[i*3] = (Math.random() - 0.5) * 22;
    particlesPositions[i*3+1] = Math.random() * 6;
    particlesPositions[i*3+2] = (Math.random() - 0.5) * 18;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
  const particlesMaterial = new THREE.PointsMaterial({ color: 0x88aacc, size: 0.018, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
  const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);
  
  return { particleSystem, accentLight, rimLight, bounceLight };
}

/* ─────────────────────────────────────────────────────────────
   ENHANCED 3D SCENE COMPONENT
───────────────────────────────────────────────────────────── */
function EquipmentScene({ equipment }) {
  const mountRef = useRef(null);
  
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    
    const camera = new THREE.PerspectiveCamera(34, mount.clientWidth / mount.clientHeight, 0.1, 50);
    camera.position.set(6.2, 3.5, 8.5);
    camera.lookAt(0, 0.3, 0);
    
    let isDragging = false, prevMouse = { x: 0, y: 0 };
    let spherical = { theta: 0.45, phi: 1.15, radius: 8.8 };
    const target = new THREE.Vector3(0, 0.3, 0);
    let autoRotateSpeed = 0.001;
    let time = 0;
    
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
      const dx = (e.clientX - prevMouse.x) * 0.006;
      const dy = (e.clientY - prevMouse.y) * 0.004;
      spherical.theta -= dx;
      spherical.phi = Math.max(0.4, Math.min(1.65, spherical.phi + dy));
      prevMouse = { x: e.clientX, y: e.clientY };
      updateCamera();
    };
    const onWheel = (e) => {
      spherical.radius = Math.max(5.8, Math.min(13.5, spherical.radius + e.deltaY * 0.008));
      updateCamera();
      e.preventDefault();
    };
    
    const el = renderer.domElement;
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('wheel', onWheel, { passive: false });
    
    const scene = new THREE.Scene();
    const env = buildEnvironment(scene, equipment.sceneBg || 0x0a0e1a);
    
    const equipmentData = buildEquipment(equipment.type, equipment.bodyColor);
    equipmentData.group.castShadow = true;
    scene.add(equipmentData.group);
    
    let raf, lastTime = 0;
    const animate = (now) => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;
      time += dt;
      
      if (!isDragging) {
        spherical.theta += autoRotateSpeed;
        updateCamera();
      }
      
      // Subtle floating animation
      equipmentData.group.position.y = Math.sin(time * 0.9) * 0.004;
      equipmentData.group.rotation.z = Math.sin(time * 0.5) * 0.001;
      
      // Wheel rotation
      if (equipmentData.wheels) {
        equipmentData.wheels.forEach(wheel => {
          wheel.rotation.x += 0.014;
        });
      }
      
      // Animate particles
      if (env.particleSystem) {
        env.particleSystem.rotation.y = time * 0.008;
        env.particleSystem.rotation.x = Math.sin(time * 0.04) * 0.03;
      }
      
      // Pulse accent lights
      if (env.accentLight) env.accentLight.intensity = 0.85 + Math.sin(time * 1.8) * 0.2;
      if (env.rimLight) env.rimLight.intensity = 1.1 + Math.cos(time * 1.2) * 0.25;
      
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
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  const filtered = useMemo(
    () => activeCat === "All" ? EQUIPMENT : EQUIPMENT.filter(e => e.category === activeCat),
    [activeCat]
  );
  
  useEffect(() => {
    let y = 0, raf;
    const tick = () => { y = (y + 0.045) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
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
    <section id="equipment" style={{ background: "#000", position: "relative", overflow: "hidden", fontFamily: "'Overpass Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Overpass+Mono:wght@300;400;600&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes marquee { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes spinCCW { from { transform:translate(-50%,-50%) rotate(0) } to { transform:translate(-50%,-50%) rotate(-360deg) } }
        @keyframes pulse { 0%,100% { opacity:0.08 } 50% { opacity:0.16 } }
        
        /* Header Section */
        .eq-wrap { max-width:1400px; margin:0 auto; }
        .eq-head { padding: clamp(60px, 10vw, 100px) 5% 0; position:relative; z-index:4; }
        .eq-head-inner { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:20px; }
        .eq-eyebrow { display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
        .eq-eyebrow-bar { width:24px; height:2px; border-radius:2px; }
        .eq-eyebrow-txt { font-size:clamp(6px, 2.5vw, 8px); font-weight:700; letter-spacing:0.55em; text-transform:uppercase; }
        .eq-title { font-family:'Playfair Display',serif; font-size:clamp(28px, 5vw, 54px); color:#fff; letter-spacing:-0.02em; line-height:1.05; font-weight:400; }
        .eq-title em { font-style:italic; color:rgba(255,255,255,0.25); }
        .eq-count-block { text-align:right; }
        .eq-count-num { font-family:'Playfair Display',serif; font-size:clamp(36px, 6vw, 68px); line-height:1; letter-spacing:-0.04em; font-weight:400; }
        .eq-count-lbl { font-size:clamp(6px, 2.5vw, 7px); font-weight:600; letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-top:5px; }
        .eq-rule { width:56px; height:1.5px; margin-top:20px; border-radius:2px; }
        
        /* Category Filters */
        .eq-cats { padding:28px 5% 0; display:flex; flex-wrap:wrap; gap:8px; align-items:center; position:relative; z-index:4; }
        .eq-cat { font-family:'Overpass Mono',monospace; font-size:clamp(6px, 2.5vw, 7.5px); font-weight:600; letter-spacing:0.35em; text-transform:uppercase;
          background:transparent; border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.3);
          padding:8px 14px; cursor:pointer; transition:all 0.25s; white-space:nowrap; border-radius:2px; }
        .eq-cat:hover { border-color:rgba(255,255,255,0.25); color:rgba(255,255,255,0.7); }
        .eq-cat.on { color:#000; }
        .eq-cats-count { margin-left:auto; font-size:clamp(6px, 2.5vw, 7px); letter-spacing:0.3em; color:rgba(255,255,255,0.15); }
        
        /* Mobile Toggle */
        .eq-mob-toggle { display:none; padding:18px 5% 0; gap:2px; position:relative; z-index:4; }
        .eq-mob-tab { flex:1; font-family:'Overpass Mono',monospace; font-size:clamp(7px, 3vw, 7.5px); font-weight:600; letter-spacing:0.35em; text-transform:uppercase;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
          color:rgba(255,255,255,0.3); padding:12px; cursor:pointer; text-align:center; transition:all 0.25s; }
        .eq-mob-tab.on { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.85); }
        @media(max-width:900px){ .eq-mob-toggle { display:flex; } }
        
        /* Main Grid */
        .eq-grid { padding:24px 5% 0; display:grid; grid-template-columns:380px 1fr; gap:0; position:relative; z-index:4; }
        @media(max-width:1100px){ .eq-grid { grid-template-columns:340px 1fr; } }
        @media(max-width:900px) { .eq-grid { grid-template-columns:1fr; padding:0; } }
        
        /* Equipment List */
        .eq-list { border:1px solid rgba(255,255,255,0.05); overflow-y:auto; max-height:75vh;
          scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.12) transparent; position:relative; background:#000; }
        .eq-list::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent, var(--accent,#FFAA22)55, transparent); z-index:5; pointer-events:none; }
        .eq-list::-webkit-scrollbar { width:2px; }
        .eq-list::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15); }
        @media(max-width:900px){ .eq-list { max-height:none; border:none; border-top:1px solid rgba(255,255,255,0.05); overflow-y:visible; }
          .eq-list.hidden { display:none; } }
        
        .eq-row { padding:14px 18px; cursor:pointer; display:grid; grid-template-columns:28px 1fr auto;
          align-items:center; gap:12px; border-left:2px solid transparent;
          border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.2s, border-color 0.2s;
          position:relative; animation:fadeUp 0.45s ease both; background:#000; }
        .eq-row:last-child { border-bottom:none; }
        .eq-row:hover { background:rgba(255,255,255,0.02); border-left-color:rgba(255,255,255,0.12); }
        .eq-row.sel { background:rgba(255,255,255,0.03); }
        .eq-row-num { font-family:'Playfair Display',serif; font-size:11px; color:rgba(255,255,255,0.12); text-align:right; transition:color 0.2s; }
        .eq-row:hover .eq-row-num, .eq-row.sel .eq-row-num { color:rgba(255,255,255,0.35); }
        .eq-row-brand { font-size:clamp(5.5px, 2vw, 6.5px); font-weight:700; letter-spacing:0.45em; text-transform:uppercase; color:rgba(255,255,255,0.3); margin-bottom:2px; }
        .eq-row-model { font-family:'Playfair Display',serif; font-size:clamp(14px, 1.8vw, 17px); color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .eq-row-cat { font-size:clamp(5px, 2vw, 6px); font-weight:600; letter-spacing:0.35em; text-transform:uppercase; color:rgba(255,255,255,0.15); margin-top:2px; }
        .eq-row-right { display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
        .eq-row-tag { font-size:clamp(4.5px, 1.8vw, 5px); font-weight:700; letter-spacing:0.25em; text-transform:uppercase; padding:3px 7px; border:1px solid; white-space:nowrap; border-radius:1px; }
        .eq-row-arrow { font-size:13px; opacity:0; transition:opacity 0.2s, transform 0.2s; }
        .eq-row:hover .eq-row-arrow, .eq-row.sel .eq-row-arrow { opacity:0.6; transform:translateX(2px); }
        
        /* 3D Viewer */
        .eq-viewer { border:1px solid rgba(255,255,255,0.05); border-left:none; display:flex; flex-direction:column; min-height:70vh; background:#000; }
        @media(max-width:900px){ .eq-viewer { border:none; border-top:1px solid rgba(255,255,255,0.05); min-height:auto; }
          .eq-viewer.hidden { display:none; } }
        
        .eq-canvas { position:relative; flex:1; min-height:500px; overflow:hidden; border-radius:4px; }
        @media(max-width:600px){ .eq-canvas { min-height:350px; } }
        
        .eq-canvas-bg { position:absolute; inset:0; z-index:1; pointer-events:none; transition:background 0.7s ease; }
        .eq-canvas-3d { position:absolute; inset:0; z-index:5; transition:opacity 0.3s ease; }
        .eq-scan-beam { position:absolute; left:0; right:0; height:80px; background:linear-gradient(to bottom, transparent, var(--accent-beam), transparent); pointer-events:none; z-index:6; transition:top 0.05s linear; }
        .eq-crosshair { position:absolute; inset:0; pointer-events:none; z-index:4; }
        .eq-crosshair::before, .eq-crosshair::after { content:''; position:absolute; background:rgba(255,255,255,0.015); }
        .eq-crosshair::before { left:50%; top:0; width:1px; height:100%; }
        .eq-crosshair::after  { top:50%; left:0; width:100%; height:1px; }
        .eq-fade-b { position:absolute; bottom:0; left:0; right:0; height:80px; background:linear-gradient(transparent,#000); pointer-events:none; z-index:7; }
        .eq-fade-l { position:absolute; top:0; left:0; bottom:0; width:50px; background:linear-gradient(90deg,#000,transparent); pointer-events:none; z-index:7; }
        @media(max-width:900px){ .eq-fade-l { display:none; } }
        
        /* Corner Decorations */
        .eq-corner { position:absolute; pointer-events:none; z-index:12; }
        .eq-corner.tl { top:0; left:0; }
        .eq-corner.br { bottom:0; right:0; transform:rotate(180deg); }
        .eq-corner.tr { top:0; right:0; transform:rotate(90deg); }
        .eq-corner.bl { bottom:0; left:0; transform:rotate(-90deg); }
        
        /* HUD Elements */
        .eq-hud-tl { position:absolute; top:14px; left:14px; z-index:20;
          display:flex; align-items:center; gap:8px; font-size:clamp(5px, 2vw, 6px); letter-spacing:0.4em; text-transform:uppercase;
          background:rgba(0,0,0,0.75); backdrop-filter:blur(10px);
          border:1px solid rgba(255,255,255,0.06); padding:5px 12px; border-radius:2px; }
        .eq-hud-dot { width:4px; height:4px; border-radius:50%; animation:pulse 2s ease-in-out infinite; }
        .eq-hud-id { position:absolute; top:14px; right:14px; z-index:20;
          font-family:'Playfair Display',serif; font-size:clamp(24px, 4vw, 32px); font-style:italic;
          color:rgba(255,255,255,0.04); pointer-events:none; letter-spacing:-0.03em; }
        .eq-hud-drag { position:absolute; bottom:16px; left:16px; z-index:20;
          font-size:clamp(5px, 2vw, 6px); letter-spacing:0.3em; text-transform:uppercase;
          background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);
          padding:5px 10px; border-radius:2px; color:rgba(255,255,255,0.3); pointer-events:none; }
        .eq-hud-name { position:absolute; bottom:18px; right:18px; z-index:20; text-align:right; pointer-events:none; }
        .eq-hud-name-brand { font-size:clamp(6px, 2.5vw, 7px); letter-spacing:0.45em; text-transform:uppercase; color:rgba(255,255,255,0.18); margin-bottom:3px; }
        .eq-hud-name-model { font-family:'Playfair Display',serif; font-style:italic; font-size:clamp(12px, 2vw, 18px); }
        
        .eq-reticle { position:absolute; top:50%; left:50%; pointer-events:none; z-index:8;
          animation:spinCCW 28s linear infinite; opacity:0.05; width:min(60px, 12vw); height:min(60px, 12vw); }
        
        /* Detail Panel */
        .eq-detail { padding:20px 24px 24px; border-top:1px solid rgba(255,255,255,0.05); background:#000; position:relative; z-index:10; }
        .eq-detail::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg, transparent, var(--accent,#FFAA22)60, transparent); }
        
        .eq-d-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:14px; }
        .eq-d-badges { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px; }
        .eq-d-brand { font-size:clamp(6px, 2.5vw, 7px); font-weight:700; letter-spacing:0.5em; text-transform:uppercase; }
        .eq-d-cattag { font-size:clamp(5px, 2vw, 5.5px); font-weight:600; letter-spacing:0.3em; text-transform:uppercase;
          padding:2px 8px; border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.22); border-radius:1px; }
        .eq-d-model { font-family:'Playfair Display',serif; font-size:clamp(18px, 3vw, 32px); color:#fff; font-weight:400; line-height:1.1; }
        .eq-d-desc { font-size:clamp(6px, 2.5vw, 6.5px); color:rgba(255,255,255,0.45); margin-top:6px; letter-spacing:0.12em; max-width:320px; line-height:1.5; }
        
        .eq-d-cta { font-family:'Overpass Mono',monospace; font-size:clamp(6.5px, 2.5vw, 7.5px); font-weight:700;
          letter-spacing:0.3em; text-transform:uppercase; color:#000;
          border:none; padding:10px 18px; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:8px; border-radius:2px;
          transition:all 0.25s; white-space:nowrap; }
        .eq-d-cta:hover { filter:brightness(1.12); transform:translateY(-2px); }
        
        /* Specs Grid */
        .eq-specs { display:grid; grid-template-columns:repeat(3,1fr); border:1px solid rgba(255,255,255,0.06); margin:14px 0; }
        .eq-spec { text-align:center; padding:12px 6px; border-right:1px solid rgba(255,255,255,0.05); transition:background 0.2s; }
        .eq-spec:last-child { border-right:none; }
        .eq-spec:hover { background:rgba(255,255,255,0.02); }
        .eq-spec-icon { font-size:clamp(10px, 3vw, 12px); margin-bottom:4px; opacity:0.6; }
        .eq-spec-val { font-family:'Playfair Display',serif; font-size:clamp(12px, 2vw, 18px); }
        .eq-spec-lbl { font-size:clamp(5px, 2vw, 5.5px); font-weight:600; letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-top:4px; }
        
        /* Buttons */
        .eq-btns { display:flex; gap:10px; flex-wrap:wrap; margin-top:16px; }
        .eq-btn-primary {
          font-family:'Overpass Mono',monospace; font-size:clamp(7px, 2.5vw, 8px); font-weight:700;
          letter-spacing:0.3em; text-transform:uppercase; color:#000;
          border:none; padding:12px 20px; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:9px; border-radius:2px;
          transition:all 0.25s;
        }
        .eq-btn-primary:hover { filter:brightness(1.1); transform:translateY(-2px); }
        .eq-btn-ghost {
          font-family:'Overpass Mono',monospace; font-size:clamp(7px, 2.5vw, 8px); font-weight:600;
          letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.45);
          background:transparent; border:1px solid rgba(255,255,255,0.1);
          padding:12px 18px; cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:9px; border-radius:2px;
          transition:all 0.25s;
        }
        .eq-btn-ghost:hover { border-color:#25D366; color:#25D366; transform:translateY(-2px); }
        
        @media(max-width:900px){
          .eq-head { padding:60px 5% 0; }
          .eq-d-head { flex-direction:column; gap:12px; }
          .eq-btns { flex-direction:column; }
          .eq-btn-primary, .eq-btn-ghost { width:100%; justify-content:center; padding:14px; }
        }
        @media(max-width:480px){
          .eq-head-inner { flex-direction:column; gap:12px; }
          .eq-count-block { text-align:left; }
        }
        
        /* Marquee */
        .eq-marquee-wrap { border-top:1px solid rgba(255,255,255,0.04); overflow:hidden; padding:12px 0; background:#000; margin-top:36px; }
        .eq-marquee { display:flex; gap:50px; animation:marquee 32s linear infinite; width:max-content; }
        .eq-marquee-item { font-size:clamp(6px, 2.5vw, 7px); font-weight:600; letter-spacing:0.4em; text-transform:uppercase; white-space:nowrap; }
        
        .eq-bottom-rule { height:1px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
        
        /* WhatsApp Banner */
        .eq-wa-banner { background:linear-gradient(135deg, #1a1a2e, #0a0a1a); border:1px solid rgba(198,168,75,0.2); border-radius:8px; margin:20px 5% 0; padding:18px 24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .eq-wa-banner-text { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .eq-wa-icon { font-size:clamp(24px, 6vw, 28px); }
        .eq-wa-title { font-family:'Playfair Display',serif; font-size:clamp(13px, 2.5vw, 18px); font-weight:400; }
        .eq-wa-sub { font-size:clamp(5.5px, 2vw, 6.5px); letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-top:4px; }
        .eq-wa-btn { background:#25D366; color:#000; border:none; padding:10px 22px; font-size:clamp(7px, 2.5vw, 8px); font-weight:700; letter-spacing:0.3em; text-transform:uppercase; text-decoration:none; border-radius:4px; display:inline-flex; align-items:center; gap:10px; transition:all 0.3s; }
        .eq-wa-btn:hover { transform:translateY(-2px); filter:brightness(1.08); }
        @media(max-width:700px){ .eq-wa-banner { flex-direction:column; text-align:center; } }
      `}</style>
      
      {/* Header */}
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
      
      {/* Category Filters */}
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
      
      {/* Mobile Toggle */}
      <div className="eq-wrap eq-mob-toggle">
        <button className={`eq-mob-tab${mobileTab === "list" ? " on" : ""}`}
          style={mobileTab === "list" ? { borderColor: `${accentHex}55`, color: accentHex } : {}}
          onClick={() => setMobileTab("list")}>Inventory</button>
        <button className={`eq-mob-tab${mobileTab === "viewer" ? " on" : ""}`}
          style={mobileTab === "viewer" ? { borderColor: `${accentHex}55`, color: accentHex } : {}}
          onClick={() => setMobileTab("viewer")}>3D Viewer</button>
      </div>
      
      {/* Main Grid */}
      <div className="eq-wrap eq-grid">
        
        {/* Equipment List */}
        <div className={`eq-list${mobileTab === "viewer" ? " hidden" : ""}`}
          style={{ "--accent": accentHex }}>
          {filtered.map((eq, i) => {
            const isSel = eq.id === activeEq.id;
            const isHov = eq.id === hoveredId;
            return (
              <div key={eq.id}
                className={`eq-row${isSel ? " sel" : ""}`}
                style={{
                  animationDelay: `${i * 0.05}s`,
                  borderLeftColor: isSel ? eq.accent : (isHov ? "rgba(255,255,255,0.12)" : "transparent"),
                }}
                onClick={() => selectEquipment(eq)}
                onMouseEnter={() => setHoveredId(eq.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && selectEquipment(eq)}>
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
        
        {/* 3D Viewer */}
        <div className={`eq-viewer${mobileTab === "list" ? " hidden" : ""}`}>
          <div className="eq-canvas">
            <div className="eq-canvas-bg" style={{
              background: `radial-gradient(ellipse at 50% 55%, ${accentHex}25 0%, ${activeEq.sceneBg ? `#${activeEq.sceneBg.toString(16)}` : "#0a0e1a"} 80%, #000 100%)`
            }} />
            
            <div className="eq-scan-beam" style={{
              top: `${scanY}%`,
              "--accent-beam": `${accentHex}18`
            }} />
            
            <div className="eq-crosshair" />
            
            {/* Corner Decorations */}
            {[["tl"], ["br"], ["tr"], ["bl"]].map(([pos]) => (
              <svg key={pos} className={`eq-corner ${pos}`} width="48" height="48" viewBox="0 0 48 48" fill="none"
                style={{ opacity: 0.35, pointerEvents: "none" }}>
                <path d="M0 48L0 0L48 0" stroke={accentHex} strokeWidth="0.9" fill="none" />
                <circle cx="0" cy="0" r="3" fill={accentHex} opacity="0.8" />
              </svg>
            ))}
            
            {/* Reticle */}
            <svg className="eq-reticle" width="56" height="56" viewBox="0 0 70 70" fill="none">
              <circle cx="35" cy="35" r="32" stroke={accentHex} strokeWidth="0.7" strokeDasharray="3 5" />
              {[0, 90, 180, 270].map(a => (
                <line key={a}
                  x1="35" y1="2" x2="35" y2="11"
                  stroke={accentHex} strokeWidth="1"
                  transform={`rotate(${a} 35 35)`} />
              ))}
            </svg>
            
            {/* 3D Canvas */}
            <div className="eq-canvas-3d" style={{ opacity: fade ? 1 : 0 }}>
              <EquipmentScene equipment={activeEq} />
            </div>
            
            <div className="eq-fade-b" />
            <div className="eq-fade-l" />
            
            {/* HUD */}
            <div className="eq-hud-tl" style={{ color: accentHex, borderColor: `${accentHex}30` }}>
              <div className="eq-hud-dot" style={{ background: accentHex }} />
              Live 3D · Drag to Rotate
            </div>
            <div className="eq-hud-id">{String(activeEq.id).padStart(2, "0")}</div>
            <div className="eq-hud-drag">⤡ Drag · Scroll · ↑↓ Keys</div>
            <div className="eq-hud-name">
              <div className="eq-hud-name-brand">{activeEq.brand}</div>
              <div className="eq-hud-name-model" style={{ color: `${accentHex}aa` }}>{activeEq.model}</div>
            </div>
          </div>
          
          {/* Detail Panel */}
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
                style={{ background: accentHex, boxShadow: `0 4px 18px ${accentHex}44` }}>
                <span>💬</span> Get Quote
              </a>
            </div>
            
            {/* Specs */}
            <div className="eq-specs" style={{ borderColor: `${accentHex}22` }}>
              {activeEq.specs.map((s, i) => (
                <div key={i} className="eq-spec">
                  <div className="eq-spec-icon">{SPEC_ICONS[i]}</div>
                  <div className="eq-spec-val" style={{ color: accentHex }}>{s}</div>
                  <div className="eq-spec-lbl">{SPEC_LABELS[i]}</div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="eq-btns">
              <a href={WA_MSG(activeEq.brand, activeEq.model)} target="_blank" rel="noopener noreferrer"
                className="eq-btn-primary"
                style={{ background: `linear-gradient(135deg, ${accentHex} 0%, ${accentHex}dd 100%)` }}>
                <span>💬</span>
                Enquire on WhatsApp
              </a>
              <a href={WA_LEASE(activeEq.brand, activeEq.model)} target="_blank" rel="noopener noreferrer"
                className="eq-btn-ghost">
                <span>🏗️</span>
                Schedule Site Visit
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* WhatsApp Banner */}
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
      
      {/* Marquee */}
      <div className="eq-marquee-wrap">
        <div className="eq-marquee">
          {[...Array(2)].flatMap((_, idx) =>
            ["🏗️ CAT 336 | Available Now", "🏗️ CAT 980M | High Demand", "🏗️ Liebherr Crane | Heavy Lift", 
             "🏗️ CAT 775G | Off-Road", "🏗️ CAT XQP300 | Industrial Power", "📍 Nationwide Delivery",
             "✅ Quality Guaranteed", "💰 Competitive Leasing Rates"].map((item, i) => (
              <span key={`${item}-${idx}-${i}`} className="eq-marquee-item" style={{ color: `${accentHex}77` }}>
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