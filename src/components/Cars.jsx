import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   WHATSAPP CONSTANTS
───────────────────────────────────────────────────────────── */
const WA_NUMBER = "2347034627308";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;
const WA_NEGOTIATE = (brand, model) =>
  `${WA_BASE}?text=${encodeURIComponent(
    `Hello Nigeria Used Cars! I'd like to negotiate on the ${brand} ${model}. Please send me your best offer.`
  )}`;
const WA_GENERAL = `${WA_BASE}?text=${encodeURIComponent(
  `Hello Nigeria Used Cars! I'm interested in your vehicle collection. Please send me more information about available cars.`
)}`;
const WA_CAR_LISTING = (id) => {
  const msg = `Hello Nigeria Used Cars! I'm interested in Car #${id}. Please send me more details and the price.`;
  return `${WA_BASE}?text=${encodeURIComponent(msg)}`;
};

/* ─────────────────────────────────────────────────────────────
   3D SHOWROOM DATA — LIGHTENED SCENES
───────────────────────────────────────────────────────────── */
const CARS = [
  {
    id: 1, brand: "Toyota", model: "Hilux", category: "Pickup", tag: "BESTSELLER",
    specs: ["2.8L Turbo", "204 HP", "4WD"], bodyColor: 0x2d5a1b, rimColor: 0xd4c17a, accent: "#5cb85c",
    type: "pickup_truck",
    description: "Nigeria's #1 choice for business and family — rugged, reliable, unstoppable.",
    sceneConfig: {
      sky: [0x0d200d, 0x1f4a1a], floor: 0x0f1e0c, fog: 0x0d1a0b,
      keyColor: 0xeeffd8, keyIntensity: 5.2, fillColor: 0xaae077, fillIntensity: 2.0,
      rimColor: 0x55cc22, rimIntensity: 2.2,
      envLights: [[0xbbff77, 4.0, -4, 1, 5], [0x66cc33, 2.0, 4, 2, -5], [0xffffff, 1.5, 0, 8, 0]],
      groundColor: 0x1e3a14, groundEmissive: 0x0f2008, groundMetal: 0.98, groundRough: 0.06,
      ambientColor: 0x8fd68f, ambientIntensity: 1.4,
    },
  },
  {
    id: 2, brand: "Toyota", model: "Corolla", category: "Sedan", tag: "BEST VALUE",
    specs: ["1.8L", "140 HP", "FWD"], bodyColor: 0x1a3a7a, rimColor: 0xb8c0cc, accent: "#4a90d9",
    type: "sedan",
    description: "Best-selling sedan in Nigeria — fuel efficient, affordable, trusted nationwide.",
    sceneConfig: {
      sky: [0x090920, 0x141845], floor: 0x0c1030, fog: 0x070a20,
      keyColor: 0xdde8ff, keyIntensity: 5.5, fillColor: 0x8899dd, fillIntensity: 2.2,
      rimColor: 0x3355cc, rimIntensity: 2.5,
      envLights: [[0x7799ff, 3.5, -4, 1.5, 4], [0x4455cc, 1.8, 5, 1, -3], [0xffffff, 1.8, 0, 9, 0]],
      groundColor: 0x111a38, groundEmissive: 0x080e20, groundMetal: 0.98, groundRough: 0.04,
      ambientColor: 0x6677cc, ambientIntensity: 1.5,
    },
  },
  {
    id: 3, brand: "Honda", model: "CR-V", category: "SUV", tag: "FAMILY CHOICE",
    specs: ["1.5L Turbo", "190 HP", "AWD"], bodyColor: 0x0d4a6e, rimColor: 0xc8d4d8, accent: "#2196a8",
    type: "crossover_suv",
    description: "Premium crossover comfort with legendary Honda reliability.",
    sceneConfig: {
      sky: [0x0a1e2e, 0x112e48], floor: 0x0c1e30, fog: 0x081624,
      keyColor: 0xbbedff, keyIntensity: 5.5, fillColor: 0x66bbdd, fillIntensity: 2.2,
      rimColor: 0x1188bb, rimIntensity: 2.4,
      envLights: [[0x55ccee, 3.5, -4, 1.5, 4], [0x2299bb, 1.8, 5, 1, -3], [0xffffff, 1.6, 0, 8, 0]],
      groundColor: 0x0e2030, groundEmissive: 0x070f1c, groundMetal: 0.98, groundRough: 0.05,
      ambientColor: 0x55aacc, ambientIntensity: 1.4,
    },
  },
  {
    id: 4, brand: "Mercedes-Benz", model: "C300", category: "Luxury", tag: "ENTRY LUXURY",
    specs: ["2.0L Turbo", "255 HP", "RWD"], bodyColor: 0xb8922a, rimColor: 0xffe080, accent: "#d4a017",
    type: "luxury_sedan",
    description: "German engineering meets Nigerian style — the executive choice.",
    sceneConfig: {
      sky: [0x200f00, 0x3c2200], floor: 0x1e1500, fog: 0x1a1000,
      keyColor: 0xfff0cc, keyIntensity: 5.8, fillColor: 0xddaa44, fillIntensity: 2.4,
      rimColor: 0xcc7700, rimIntensity: 2.8,
      envLights: [[0xffdd66, 4.5, -4, 2, 4], [0xcc9933, 2.0, 5, 1, -3], [0xffffff, 1.8, 0, 9, 0]],
      groundColor: 0x241800, groundEmissive: 0x120c00, groundMetal: 0.99, groundRough: 0.03,
      ambientColor: 0xbb8833, ambientIntensity: 1.6,
    },
  },
  {
    id: 5, brand: "Lexus", model: "RX 350", category: "Luxury SUV", tag: "PREMIUM CHOICE",
    specs: ["3.5L V6", "295 HP", "AWD"], bodyColor: 0x7a0010, rimColor: 0xffd060, accent: "#c8393e",
    type: "luxury_suv",
    description: "Ultimate luxury SUV — comfort, power, prestige for Nigerian roads.",
    sceneConfig: {
      sky: [0x1a0008, 0x2e0015], floor: 0x1a000a, fog: 0x160008,
      keyColor: 0xffcccc, keyIntensity: 5.5, fillColor: 0xcc5555, fillIntensity: 2.2,
      rimColor: 0xaa1111, rimIntensity: 2.6,
      envLights: [[0xff6666, 3.8, -4, 1.5, 4], [0xcc3333, 1.8, 5, 1, -3], [0xffffff, 1.8, 0, 9, 0]],
      groundColor: 0x200a0a, groundEmissive: 0x100404, groundMetal: 0.98, groundRough: 0.04,
      ambientColor: 0xaa4444, ambientIntensity: 1.4,
    },
  },
];

/* ─────────────────────────────────────────────────────────────
   PHOTO LISTINGS
───────────────────────────────────────────────────────────── */
const PHOTO_SLOT_LABELS = ["Front", "Rear", "Side", "Interior", "Engine"];

const LISTINGS = [
  { id: "1", carName: "Toyota Hilux", desc: "Tokunbo · Excellent condition · Low mileage", photos: 5 },
  { id: "2", carName: "Toyota Corolla", desc: "Tokunbo · Full option · Lagos cleared", photos: 5 },
  { id: "3", carName: "Honda CR-V", desc: "Nigerian used · Good condition · Negotiable", photos: 5 },
  { id: "4", carName: "Mercedes-Benz C300", desc: "Tokunbo · Clean interior · Accident free", photos: 5 },
  { id: "5", carName: "Lexus RX 350", desc: "Tokunbo · Premium · Just cleared", photos: 5 },
];

/* ─────────────────────────────────────────────────────────────
   THREE.JS HELPERS
───────────────────────────────────────────────────────────── */
const box  = (w, h, d) => new THREE.BoxGeometry(w, h, d, 2, 2, 2);
const cyl  = (r1, r2, h, s = 32) => new THREE.CylinderGeometry(r1, r2, h, s);
const sph  = (r, w = 32, h = 32) => new THREE.SphereGeometry(r, w, h);
const tor  = (r, t, rs = 32, ts = 80) => new THREE.TorusGeometry(r, t, rs, ts);

const pearlPaint = (c) => new THREE.MeshPhysicalMaterial({
  color: c, metalness: 0.85, roughness: 0.12, clearcoat: 1.0,
  clearcoatRoughness: 0.04, reflectivity: 1.0,
  sheen: 0.25, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xffffff),
  iridescence: 0.35, iridescenceIOR: 1.55,
  iridescenceThicknessRange: [100, 500],
});
const glassM  = () => new THREE.MeshPhysicalMaterial({ color: 0x99bbdd, metalness: 0.0, roughness: 0.04, transmission: 0.88, transparent: true, opacity: 0.45, ior: 1.52, thickness: 0.025, attenuationColor: new THREE.Color(0x88aacc), attenuationDistance: 0.4 });
const chromeM = () => new THREE.MeshStandardMaterial({ color: 0xe8f0ff, metalness: 1.0, roughness: 0.015 });
const goldM   = () => new THREE.MeshStandardMaterial({ color: 0xffe080, metalness: 1.0, roughness: 0.03 });
const rubberM = () => new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.85, metalness: 0.0 });
const plasticM= () => new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.65, metalness: 0.08 });
const carbonM = () => new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.22, metalness: 0.88 });
const emissiveM=(c, i = 1.0) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.1 });

function mk(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true; m.receiveShadow = true; return m;
}

/* ─────────────────────────────────────────────────────────────
   WHEEL
───────────────────────────────────────────────────────────── */
function buildWheel(isGold = false, spokeCount = 6, size = 1) {
  const g = new THREE.Group();
  const R = 0.38 * size, TH = 0.12 * size;
  const tyre = mk(tor(R, TH, 36, 80), rubberM()); tyre.rotation.x = Math.PI / 2; g.add(tyre);
  const rimBase = mk(cyl(R - 0.005, R - 0.005, TH * 1.6, 48), isGold ? goldM() : chromeM()); rimBase.rotation.x = Math.PI / 2; g.add(rimBase);
  const spokeMat = isGold ? goldM() : chromeM();
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const spoke = mk(new THREE.BoxGeometry(0.038 * size, 0.44 * size, 0.042 * size), spokeMat);
    spoke.position.set(Math.sin(angle) * 0.15 * size, 0, Math.cos(angle) * 0.15 * size);
    g.add(spoke);
  }
  const hub = mk(cyl(0.1 * size, 0.1 * size, TH * 1.8, 24), isGold ? goldM() : chromeM()); hub.rotation.x = Math.PI / 2; g.add(hub);
  const lip = mk(tor(R - TH * 0.2, 0.015 * size, 20, 60), plasticM()); lip.rotation.x = Math.PI / 2; g.add(lip);
  const disc = mk(cyl(0.26 * size, 0.26 * size, 0.02 * size, 32), carbonM()); disc.rotation.x = Math.PI / 2; g.add(disc);
  // Brake caliper — glowing for premium look
  const caliper = mk(new THREE.BoxGeometry(0.09 * size, 0.12 * size, 0.14 * size),
    new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 0.5, roughness: 0.5, metalness: 0.6 }));
  caliper.position.set(0.22 * size, -0.02 * size, 0); g.add(caliper);
  return g;
}

/* ─────────────────────────────────────────────────────────────
   EXHAUST PARTICLE SYSTEM
───────────────────────────────────────────────────────────── */
function buildExhaustParticles(count = 80) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const life = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i*3] = 0; pos[i*3+1] = 0; pos[i*3+2] = 0;
    sizes[i] = Math.random() * 0.06 + 0.02;
    life[i] = Math.random();
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  const mat = new THREE.PointsMaterial({
    color: 0xaaaaaa, size: 0.06, transparent: true, opacity: 0.18,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.life = life;
  pts.userData.count = count;
  return pts;
}

function tickExhaust(pts, dt, origin) {
  const pos = pts.geometry.attributes.position.array;
  const life = pts.userData.life;
  const count = pts.userData.count;
  for (let i = 0; i < count; i++) {
    life[i] += dt * 0.9;
    if (life[i] > 1) {
      life[i] = 0;
      pos[i*3]   = origin.x + (Math.random() - 0.5) * 0.06;
      pos[i*3+1] = origin.y + (Math.random() - 0.5) * 0.04;
      pos[i*3+2] = origin.z;
    }
    pos[i*3]   += (Math.random() - 0.5) * 0.003;
    pos[i*3+1] += 0.006 * dt * 60;
    pos[i*3+2] += 0.012 * dt * 60;
  }
  pts.geometry.attributes.position.needsUpdate = true;
  pts.material.opacity = 0.14 + Math.sin(Date.now() * 0.003) * 0.04;
}

/* ─────────────────────────────────────────────────────────────
   CAR BUILDERS
───────────────────────────────────────────────────────────── */
function buildHilux(bodyColor) {
  const grp = new THREE.Group();
  const paint = pearlPaint(bodyColor);
  const ch = chromeM(), gl = glassM(), pl = plasticM();
  const sill = mk(box(5.1, 0.38, 2.28), paint); sill.position.y = -0.46; grp.add(sill);
  const bedFloor = mk(box(2.4, 0.08, 2.1), carbonM()); bedFloor.position.set(1.2, -0.22, 0); grp.add(bedFloor);
  const bedWallL = mk(box(2.4, 0.38, 0.08), paint); bedWallL.position.set(1.2, -0.08, 1.1); grp.add(bedWallL);
  const bedWallR = mk(box(2.4, 0.38, 0.08), paint); bedWallR.position.set(1.2, -0.08, -1.1); grp.add(bedWallR);
  const bedWallEnd = mk(box(0.08, 0.38, 2.28), paint); bedWallEnd.position.set(2.46, -0.08, 0); grp.add(bedWallEnd);
  const tailgate = mk(box(0.08, 0.36, 2.1), paint); tailgate.position.set(2.56, -0.09, 0); grp.add(tailgate);
  const cab = mk(box(2.6, 0.85, 2.24), paint); cab.position.set(-1.35, 0.12, 0); grp.add(cab);
  const cabRoof = mk(box(2.45, 0.1, 2.2), paint); cabRoof.position.set(-1.35, 0.57, 0); grp.add(cabRoof);
  [-1.0, -1.6].forEach((x) => { [1.05, -1.05].forEach((z) => { const p = mk(box(0.06, 0.55, 0.07), paint); p.position.set(x, 0.36, z); grp.add(p); }); });
  const ws = mk(box(0.06, 0.52, 2.0), gl); ws.position.set(-0.98, 0.42, 0); grp.add(ws);
  const rw = mk(box(0.06, 0.38, 1.9), gl); rw.position.set(-1.82, 0.38, 0); grp.add(rw);
  [[0.08, 0.32, 0.54, -1.48, 0.34, 1.16], [0.08, 0.32, 0.54, -1.48, 0.34, -1.16]].forEach(([w, h, d, x, y, z]) => { const sw = mk(box(w, h, d), gl); sw.position.set(x, y, z); grp.add(sw); });
  const bumper = mk(box(0.14, 0.28, 2.18), ch); bumper.position.set(-2.62, -0.2, 0); grp.add(bumper);
  const bullH = mk(box(0.1, 0.44, 2.25), ch); bullH.position.set(-2.72, -0.02, 0); grp.add(bullH);
  const bullV = mk(box(0.1, 0.44, 0.1), ch); bullV.position.set(-2.65, -0.02, 1.12); grp.add(bullV);
  const bullV2 = bullV.clone(); bullV2.position.set(-2.65, -0.02, -1.12); grp.add(bullV2);
  for (let y = -0.12; y <= 0.12; y += 0.06) { const slat = mk(box(0.06, 0.02, 1.78), ch); slat.position.set(-2.62, y, 0); grp.add(slat); }
  const badge = mk(box(0.06, 0.06, 0.9), goldM()); badge.position.set(-2.62, 0.06, 0); grp.add(badge);
  [1.0, -1.0].forEach(side => {
    const hl = mk(box(0.08, 0.18, 0.38), emissiveM(0xfff5e0, 1.1)); hl.position.set(-2.64, -0.1, side * 1.0); grp.add(hl);
    const drl = mk(box(0.05, 0.04, 0.28), emissiveM(0xddeeff, 1.0)); drl.position.set(-2.62, 0.08, side * 1.0); grp.add(drl);
    const fog = mk(box(0.06, 0.06, 0.12), emissiveM(0xffee88, 0.8)); fog.position.set(-2.64, -0.3, side * 1.14); grp.add(fog);
  });
  [1.12, -1.12].forEach(side => {
    const tl = mk(box(0.07, 0.22, 0.1), emissiveM(0xff2200, 1.0)); tl.position.set(2.56, -0.1, side); grp.add(tl);
    const rl = mk(box(0.05, 0.06, 0.06), emissiveM(0xff4444, 0.7)); rl.position.set(2.57, 0.08, side); grp.add(rl);
  });
  const roofBar = mk(box(1.4, 0.06, 0.06), emissiveM(0xffee88, 1.2)); roofBar.position.set(-1.25, 0.65, 0); grp.add(roofBar);
  for (let x = -1.5; x <= -0.8; x += 0.18) { const rLight = mk(box(0.07, 0.05, 0.07), emissiveM(0xffee88, 1.4)); rLight.position.set(x, 0.64, 1.12); grp.add(rLight); }
  [1.16, -1.16].forEach(side => { const rb2 = mk(box(4.0, 0.04, 0.18), ch); rb2.position.set(-0.5, -0.45, side); grp.add(rb2); });
  [[-1.9, 1.22], [1.85, 1.22], [-1.9, -1.22], [1.85, -1.22]].forEach(([x, z]) => { const ff = mk(box(0.62, 0.1, 0.22), pl); ff.position.set(x, -0.28, z); grp.add(ff); });
  const hitch = mk(box(0.1, 0.08, 0.08), ch); hitch.position.set(2.66, -0.58, 0); grp.add(hitch);
  // exhaust
  const exhaust1 = buildExhaustParticles(); exhaust1.position.set(2.58, -0.5, 0.36); grp.add(exhaust1);
  const exhaust2 = buildExhaustParticles(); exhaust2.position.set(2.58, -0.5, -0.36); grp.add(exhaust2);
  const wheels = [];
  [[-1.88, -0.58, 1.22], [1.88, -0.58, 1.22], [-1.88, -0.58, -1.22], [1.88, -0.58, -1.22]].forEach(([x, y, z]) => { const w = buildWheel(false, 8, 1.08); w.position.set(x, y, z); grp.add(w); wheels.push(w); });
  return { group: grp, wheels, exhausts: [exhaust1, exhaust2] };
}

function buildCorolla(bodyColor) {
  const grp = new THREE.Group();
  const paint = pearlPaint(bodyColor);
  const ch = chromeM(), gl = glassM();
  const bodyMain = mk(box(4.4, 0.44, 1.84), paint); bodyMain.position.y = -0.44; grp.add(bodyMain);
  const shL = mk(box(4.2, 0.12, 0.14), paint); shL.position.set(0, -0.22, 1.0); grp.add(shL);
  const shR = shL.clone(); shR.position.set(0, -0.22, -1.0); grp.add(shR);
  const cabin = mk(box(3.0, 0.72, 1.76), paint); cabin.position.set(-0.2, 0.12, 0); grp.add(cabin);
  const roof = mk(box(2.6, 0.08, 1.62), paint); roof.position.set(-0.28, 0.5, 0); grp.add(roof);
  const wsFront = mk(box(0.07, 0.44, 1.66), gl); wsFront.position.set(0.6, 0.38, 0); grp.add(wsFront);
  const wsRear = mk(box(0.07, 0.38, 1.58), gl); wsRear.position.set(-0.98, 0.35, 0); grp.add(wsRear);
  [1.0, -1.0].forEach(side => {
    const sw = mk(box(0.07, 0.26, 0.56), gl); sw.position.set(-0.15, 0.44, side); grp.add(sw);
    const sw2 = mk(box(0.07, 0.22, 0.44), gl); sw2.position.set(-0.68, 0.42, side); grp.add(sw2);
  });
  const sr = mk(box(1.2, 0.03, 0.88), gl); sr.position.set(-0.22, 0.55, 0); grp.add(sr);
  const fb = mk(box(0.12, 0.28, 1.74), ch); fb.position.set(2.26, -0.22, 0); grp.add(fb);
  const frontLip = mk(box(0.06, 0.04, 1.68), ch); frontLip.position.set(2.3, -0.44, 0); grp.add(frontLip);
  const grille = mk(box(0.08, 0.22, 1.34), ch); grille.position.set(2.22, -0.16, 0); grp.add(grille);
  const bar = mk(box(0.05, 0.04, 1.42), ch); bar.position.set(2.2, -0.06, 0); grp.add(bar);
  const badge2 = mk(sph(0.05), goldM()); badge2.position.set(2.24, 0.04, 0); grp.add(badge2);
  [0.94, -0.94].forEach(side => {
    const hl = mk(box(0.08, 0.14, 0.36), emissiveM(0xfff0d0, 1.0)); hl.position.set(2.2, -0.14, side); grp.add(hl);
    const drl = mk(box(0.05, 0.04, 0.26), emissiveM(0xccddff, 1.1)); drl.position.set(2.18, 0.0, side); grp.add(drl);
    const fog = mk(box(0.06, 0.06, 0.1), emissiveM(0xffdd88, 0.7)); fog.position.set(2.22, -0.28, side * 1.04); grp.add(fog);
  });
  [0.99, -0.99].forEach(side => {
    const tl = mk(box(0.08, 0.18, 0.14), emissiveM(0xff2200, 1.0)); tl.position.set(-2.26, -0.14, side); grp.add(tl);
    const tls = mk(box(0.07, 0.04, 0.68), emissiveM(0xff3300, 0.7)); tls.position.set(-2.24, 0.0, side * 0.7); grp.add(tls);
  });
  const rb = mk(box(0.1, 0.24, 1.74), ch); rb.position.set(-2.28, -0.24, 0); grp.add(rb);
  const trunk = mk(box(0.07, 0.12, 1.64), paint); trunk.position.set(-2.3, 0.12, 0); grp.add(trunk);
  const spoiler = mk(box(1.0, 0.05, 0.1), ch); spoiler.position.set(-2.18, 0.22, 0); grp.add(spoiler);
  [1.0, -1.0].forEach(side => { const strip = mk(box(3.8, 0.018, 0.05), ch); strip.position.set(-0.1, -0.2, side); grp.add(strip); });
  const exh1 = buildExhaustParticles(); exh1.position.set(-2.3, -0.48, 0.34); grp.add(exh1);
  const exh2 = buildExhaustParticles(); exh2.position.set(-2.3, -0.48, -0.34); grp.add(exh2);
  [0.36, -0.36].forEach(x => { const ex = mk(cyl(0.05, 0.06, 0.16, 16), ch); ex.rotation.x = Math.PI / 2; ex.position.set(-2.28, -0.48, x); grp.add(ex); });
  const wheels = [];
  [[-1.55, -0.58, 1.04], [1.55, -0.58, 1.04], [-1.55, -0.58, -1.04], [1.55, -0.58, -1.04]].forEach(([x, y, z]) => { const w = buildWheel(false, 10, 0.96); w.position.set(x, y, z); grp.add(w); wheels.push(w); });
  return { group: grp, wheels, exhausts: [exh1, exh2] };
}

function buildCRV(bodyColor) {
  const grp = new THREE.Group();
  const paint = pearlPaint(bodyColor);
  const ch = chromeM(), gl = glassM();
  const body = mk(box(4.6, 0.55, 2.02), paint); body.position.y = -0.38; grp.add(body);
  const cabin = mk(box(3.5, 0.88, 1.92), paint); cabin.position.set(-0.05, 0.18, 0); grp.add(cabin);
  const roof = mk(box(3.4, 0.09, 1.88), paint); roof.position.set(-0.1, 0.65, 0); grp.add(roof);
  const pano = mk(box(2.4, 0.04, 1.5), gl); pano.position.set(-0.15, 0.72, 0); grp.add(pano);
  const ws = mk(box(0.07, 0.48, 1.84), gl); ws.position.set(0.82, 0.44, 0); grp.add(ws);
  const rg = mk(box(0.07, 0.44, 1.76), gl); rg.position.set(-1.12, 0.42, 0); grp.add(rg);
  [1.04, -1.04].forEach(side => {
    const sw = mk(box(0.07, 0.3, 0.52), gl); sw.position.set(-0.04, 0.48, side); grp.add(sw);
    const sw2 = mk(box(0.07, 0.28, 0.44), gl); sw2.position.set(-0.6, 0.46, side); grp.add(sw2);
  });
  const grille2 = mk(box(0.12, 0.46, 1.72), ch); grille2.position.set(2.38, -0.08, 0); grp.add(grille2);
  for (let y = -0.2; y <= 0.2; y += 0.1) { const gRow = mk(box(0.06, 0.02, 1.6), ch); gRow.position.set(2.38, y, 0); grp.add(gRow); }
  const hbadge = mk(box(0.05, 0.1, 0.3), ch); hbadge.position.set(2.4, 0.08, 0); grp.add(hbadge);
  [1.0, -1.0].forEach(side => {
    const hl = mk(box(0.09, 0.16, 0.38), emissiveM(0xffeedd, 1.0)); hl.position.set(2.34, -0.06, side); grp.add(hl);
    const drl = mk(box(0.06, 0.05, 0.3), emissiveM(0xccddff, 1.05)); drl.position.set(2.32, 0.1, side); grp.add(drl);
    const vdrl = mk(box(0.05, 0.12, 0.05), emissiveM(0xccddff, 0.8)); vdrl.position.set(2.3, 0.02, side * 1.12); grp.add(vdrl);
  });
  [1.08, -1.08].forEach(side => {
    const tl = mk(box(0.09, 0.22, 0.14), emissiveM(0xff2200, 1.0)); tl.position.set(-2.38, -0.04, side); grp.add(tl);
    const tld = mk(box(0.07, 0.05, 0.68), emissiveM(0xff3300, 0.65)); tld.position.set(-2.36, 0.1, side * 0.7); grp.add(tld);
  });
  [1.02, -1.02].forEach(side => {
    const rl = mk(box(3.2, 0.04, 0.06), ch); rl.position.set(-0.15, 0.76, side); grp.add(rl);
    [-1.2, 0.5].forEach(x => { const rf = mk(box(0.1, 0.1, 0.08), ch); rf.position.set(x, 0.74, side); grp.add(rf); });
  });
  [1.1, -1.1].forEach(side => { const rb = mk(box(3.8, 0.04, 0.16), ch); rb.position.set(-0.15, -0.42, side); grp.add(rb); });
  const exhCRV = buildExhaustParticles(); exhCRV.position.set(-2.4, -0.45, 0.3); grp.add(exhCRV);
  const wheels = [];
  [[-1.66, -0.54, 1.14], [1.66, -0.54, 1.14], [-1.66, -0.54, -1.14], [1.66, -0.54, -1.14]].forEach(([x, y, z]) => { const w = buildWheel(false, 10, 1.02); w.position.set(x, y, z); grp.add(w); wheels.push(w); });
  return { group: grp, wheels, exhausts: [exhCRV] };
}

function buildMercedes(bodyColor) {
  const grp = new THREE.Group();
  const paint = pearlPaint(bodyColor);
  const ch = chromeM(), gld = goldM(), gl = glassM();
  const body = mk(box(4.65, 0.44, 1.9), paint); body.position.y = -0.44; grp.add(body);
  const cabin = mk(box(3.1, 0.7, 1.78), paint); cabin.position.set(-0.22, 0.13, 0); grp.add(cabin);
  const roof = mk(box(2.8, 0.09, 1.7), paint); roof.position.set(-0.3, 0.49, 0); grp.add(roof);
  const wsFront = mk(box(0.06, 0.42, 1.7), gl); wsFront.position.set(0.62, 0.36, 0); grp.add(wsFront);
  const wsRear = mk(box(0.06, 0.36, 1.62), gl); wsRear.position.set(-1.02, 0.33, 0); grp.add(wsRear);
  [1.0, -1.0].forEach(side => {
    const sw = mk(box(0.06, 0.24, 0.54), gl); sw.position.set(-0.18, 0.4, side); grp.add(sw);
    const sw2 = mk(box(0.06, 0.2, 0.42), gl); sw2.position.set(-0.72, 0.38, side); grp.add(sw2);
  });
  const pano = mk(box(1.8, 0.03, 1.08), gl); pano.position.set(-0.32, 0.55, 0); grp.add(pano);
  const grilleFrame = mk(box(0.12, 0.5, 1.8), gld); grilleFrame.position.set(2.42, 0.0, 0); grp.add(grilleFrame);
  for (let z = -0.85; z <= 0.85; z += 0.12) { const slat = mk(box(0.04, 0.38, 0.04), ch); slat.position.set(2.4, 0.0, z); grp.add(slat); }
  const star = mk(sph(0.055, 24, 24), gld); star.position.set(2.48, 0.08, 0); grp.add(star);
  const starRing = mk(tor(0.07, 0.01, 16, 48), ch); starRing.position.set(2.48, 0.08, 0); grp.add(starRing);
  [1.04, -1.04].forEach(side => {
    const hl = mk(box(0.09, 0.14, 0.4), emissiveM(0xfff8ee, 1.2)); hl.position.set(2.38, -0.06, side); grp.add(hl);
    const drl = mk(box(0.05, 0.04, 0.32), emissiveM(0x99ccff, 1.1)); drl.position.set(2.36, 0.08, side); grp.add(drl);
  });
  [1.06, -1.06].forEach(side => { const tl = mk(box(0.08, 0.18, 0.15), emissiveM(0xff2200, 1.0)); tl.position.set(-2.38, -0.04, side); grp.add(tl); });
  const tBar = mk(box(0.03, 0.04, 1.44), emissiveM(0xff2200, 0.7)); tBar.position.set(-2.37, 0.04, 0); grp.add(tBar);
  [1.07, -1.07].forEach(side => { const sk = mk(box(4.1, 0.04, 0.08), gld); sk.position.set(0.1, -0.44, side); grp.add(sk); });
  [1.05, -1.05].forEach(side => { const wt = mk(box(3.2, 0.014, 0.05), ch); wt.position.set(-0.38, 0.26, side); grp.add(wt); });
  const diff = mk(box(0.06, 0.12, 1.4), carbonM()); diff.position.set(-2.38, -0.5, 0); grp.add(diff);
  // quad exhausts — M look
  [[0.66], [-0.66], [0.44], [-0.44]].forEach(([z]) => {
    const ex = mk(cyl(0.045, 0.055, 0.18, 16), Math.abs(z) > 0.5 ? gld : ch);
    ex.rotation.x = Math.PI / 2; ex.position.set(-2.32, -0.5, z); grp.add(ex);
  });
  const exhM1 = buildExhaustParticles(); exhM1.position.set(-2.4, -0.5, 0.55); grp.add(exhM1);
  const exhM2 = buildExhaustParticles(); exhM2.position.set(-2.4, -0.5, -0.55); grp.add(exhM2);
  const wheels = [];
  [[-1.64, -0.58, 1.1], [1.64, -0.58, 1.1], [-1.64, -0.58, -1.1], [1.64, -0.58, -1.1]].forEach(([x, y, z]) => { const w = buildWheel(true, 10, 1.0); w.position.set(x, y, z); grp.add(w); wheels.push(w); });
  return { group: grp, wheels, exhausts: [exhM1, exhM2] };
}

function buildLexusRX(bodyColor) {
  const grp = new THREE.Group();
  const paint = pearlPaint(bodyColor);
  const ch = chromeM(), gld = goldM(), gl = glassM();
  const body = mk(box(4.85, 0.58, 2.18), paint); body.position.y = -0.34; grp.add(body);
  const cabin = mk(box(3.9, 0.92, 2.08), paint); cabin.position.set(0.0, 0.2, 0); grp.add(cabin);
  const roof = mk(box(3.8, 0.1, 2.04), paint); roof.position.set(0.0, 0.68, 0); grp.add(roof);
  const pano = mk(box(3.0, 0.04, 1.62), gl); pano.position.set(-0.1, 0.76, 0); grp.add(pano);
  const wsFront = mk(box(0.07, 0.52, 2.0), gl); wsFront.position.set(0.92, 0.44, 0); grp.add(wsFront);
  const wsRear = mk(box(0.07, 0.48, 1.92), gl); wsRear.position.set(-1.2, 0.42, 0); grp.add(wsRear);
  [1.12, -1.12].forEach(side => {
    const sw = mk(box(0.07, 0.34, 0.56), gl); sw.position.set(-0.05, 0.5, side); grp.add(sw);
    const sw2 = mk(box(0.07, 0.3, 0.48), gl); sw2.position.set(-0.64, 0.48, side); grp.add(sw2);
  });
  const grilleTop = mk(box(0.14, 0.38, 1.74), gld); grilleTop.position.set(2.52, 0.04, 0); grp.add(grilleTop);
  const grilleLow = mk(box(0.13, 0.32, 1.66), gld); grilleLow.position.set(2.51, -0.26, 0); grp.add(grilleLow);
  for (let z = -0.75; z <= 0.75; z += 0.12) { for (let y = -0.22; y <= 0.22; y += 0.1) { const d = mk(sph(0.022, 8, 8), gld); d.position.set(2.5, y, z); grp.add(d); } }
  const emb = mk(box(0.05, 0.08, 0.28), ch); emb.position.set(2.58, 0.08, 0); grp.add(emb);
  [1.04, -1.04].forEach(side => {
    const hl = mk(box(0.1, 0.18, 0.42), emissiveM(0xfff5e0, 1.2)); hl.position.set(2.48, -0.04, side); grp.add(hl);
    const drl1 = mk(box(0.06, 0.05, 0.32), emissiveM(0x99ccff, 1.0)); drl1.position.set(2.46, 0.12, side); grp.add(drl1);
    const drl2 = mk(box(0.05, 0.14, 0.05), emissiveM(0x99ccff, 0.85)); drl2.position.set(2.44, 0.04, side * 1.16); grp.add(drl2);
    const fog = mk(box(0.08, 0.08, 0.14), emissiveM(0xffcc88, 0.8)); fog.position.set(2.46, -0.32, side * 1.14); grp.add(fog);
  });
  [1.18, -1.18].forEach(side => {
    const tl = mk(box(0.1, 0.26, 0.18), emissiveM(0xff2200, 1.0)); tl.position.set(-2.48, 0.04, side); grp.add(tl);
    const tls = mk(box(0.08, 0.05, 0.8), emissiveM(0xff3300, 0.65)); tls.position.set(-2.46, 0.14, side * 0.7); grp.add(tls);
  });
  const sp = mk(box(1.8, 0.06, 0.2), paint); sp.position.set(-2.3, 0.82, 0); grp.add(sp);
  [1.14, -1.14].forEach(side => { const rt = mk(box(3.7, 0.04, 0.07), ch); rt.position.set(0.0, 0.78, side); grp.add(rt); });
  [1.16, -1.16].forEach(side => {
    const vent = mk(box(0.06, 0.1, 0.08), gld); vent.position.set(0.9, -0.24, side); grp.add(vent);
    const rb2 = mk(box(3.8, 0.04, 0.16), ch); rb2.position.set(-0.1, -0.4, side); grp.add(rb2);
  });
  const exhL = buildExhaustParticles(); exhL.position.set(-2.5, -0.5, 0.44); grp.add(exhL);
  const exhR = buildExhaustParticles(); exhR.position.set(-2.5, -0.5, -0.44); grp.add(exhR);
  const wheels = [];
  [[-1.8, -0.55, 1.28], [1.8, -0.55, 1.28], [-1.8, -0.55, -1.28], [1.8, -0.55, -1.28]].forEach(([x, y, z]) => { const w = buildWheel(true, 10, 1.06); w.position.set(x, y, z); grp.add(w); wheels.push(w); });
  return { group: grp, wheels, exhausts: [exhL, exhR] };
}

/* ─────────────────────────────────────────────────────────────
   SCENE BUILDER — LIGHTER, MORE VIBRANT
───────────────────────────────────────────────────────────── */
function buildScene(scene, cfg) {
  scene.background = new THREE.Color(cfg.sky[1]);
  scene.fog = new THREE.FogExp2(cfg.fog, 0.018);

  // Much higher ambient — lightened scenes
  const amb = new THREE.AmbientLight(cfg.ambientColor || 0x888888, cfg.ambientIntensity || 1.8);
  scene.add(amb);

  // Key — brighter, whiter
  const key = new THREE.DirectionalLight(cfg.keyColor, cfg.keyIntensity || 5.5);
  key.position.set(6, 12, 8); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -8; key.shadow.camera.right = 8;
  key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  key.shadow.camera.near = 1; key.shadow.camera.far = 28;
  key.shadow.bias = -0.0004; key.shadow.radius = 4;
  scene.add(key);

  // Fill — significantly brighter
  const fill = new THREE.DirectionalLight(cfg.fillColor, cfg.fillIntensity || 2.4);
  fill.position.set(-6, 8, 6); scene.add(fill);

  // Rim
  const rim = new THREE.DirectionalLight(cfg.rimColor, cfg.rimIntensity || 2.6);
  rim.position.set(0, 3, -9); scene.add(rim);

  // Top bounce — makes everything feel lighter/studio
  const top = new THREE.DirectionalLight(0xffffff, 1.2);
  top.position.set(0, 14, 0); scene.add(top);

  // Under-car ambient bounce
  const bounce = new THREE.PointLight(cfg.fillColor, 1.0, 6);
  bounce.position.set(0, -0.5, 0); scene.add(bounce);

  cfg.envLights.forEach(([color, intensity, x, y, z]) => {
    const pl = new THREE.PointLight(color, intensity, 20);
    pl.position.set(x, y, z); scene.add(pl);
  });

  // Ground — high metalness mirror-like floor with emissive glow
  const groundMat = new THREE.MeshStandardMaterial({
    color: cfg.groundColor, metalness: cfg.groundMetal ?? 0.98,
    roughness: cfg.groundRough ?? 0.04,
    emissive: cfg.groundEmissive, emissiveIntensity: 0.8,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(32, 28), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.72;
  ground.receiveShadow = true; scene.add(ground);

  // Shadow catcher
  const shadowCatcher = new THREE.Mesh(
    new THREE.CircleGeometry(5.5, 64),
    new THREE.ShadowMaterial({ opacity: 0.45, transparent: true })
  );
  shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = -0.7;
  shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);

  // Glow ring under car
  const ringGeo = new THREE.RingGeometry(2.6, 3.0, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: cfg.keyColor, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2; ring.position.y = -0.71; scene.add(ring);

  // Particles — lighter, more visible
  const pCnt = 900;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCnt * 3);
  const pSizes = new Float32Array(pCnt);
  for (let i = 0; i < pCnt; i++) {
    pPos[i*3]   = (Math.random()-0.5)*24; 
    pPos[i*3+1] = Math.random()*8 - 0.5;
    pPos[i*3+2] = (Math.random()-0.5)*18 - 3;
    pSizes[i] = Math.random()*0.018 + 0.006;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("size", new THREE.BufferAttribute(pSizes, 1));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: cfg.keyColor, size: 0.014, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(particles);

  // Grid
  const gridHelper = new THREE.GridHelper(22, 44, cfg.groundEmissive, cfg.groundEmissive);
  gridHelper.material.opacity = 0.09; gridHelper.material.transparent = true;
  gridHelper.position.y = -0.695; scene.add(gridHelper);

  return { particles, key, fill, rim, bounce, ring };
}

/* ─────────────────────────────────────────────────────────────
   3D SCENE COMPONENT
───────────────────────────────────────────────────────────── */
function ShowroomScene({ car }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const W = mount.clientWidth, H = mount.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55; // slightly less exposure to keep lightened scenes from blowing
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const env = buildScene(scene, car.sceneConfig);

    let carData;
    switch (car.type) {
      case "pickup_truck":  carData = buildHilux(car.bodyColor); break;
      case "sedan":         carData = buildCorolla(car.bodyColor); break;
      case "crossover_suv": carData = buildCRV(car.bodyColor); break;
      case "luxury_sedan":  carData = buildMercedes(car.bodyColor); break;
      case "luxury_suv":    carData = buildLexusRX(car.bodyColor); break;
      default:              carData = buildCorolla(car.bodyColor);
    }
    carData.group.castShadow = true; scene.add(carData.group);

    const camera = new THREE.PerspectiveCamera(28, W / H, 0.1, 60);
    let spherical = { theta: 0.4, phi: 1.22, r: 9.0 };
    const target = new THREE.Vector3(0, 0.14, 0);
    const updateCam = () => {
      camera.position.set(
        target.x + spherical.r * Math.sin(spherical.phi) * Math.sin(spherical.theta),
        target.y + spherical.r * Math.cos(spherical.phi),
        target.z + spherical.r * Math.sin(spherical.phi) * Math.cos(spherical.theta)
      );
      camera.lookAt(target);
    };
    updateCam();

    let isDrag = false, prevX = 0, prevY = 0, time = 0;
    const el = renderer.domElement;
    const onPD = (e) => { isDrag = true; prevX = e.clientX ?? e.touches?.[0]?.clientX ?? 0; prevY = e.clientY ?? e.touches?.[0]?.clientY ?? 0; };
    const onPU = () => { isDrag = false; };
    const onPM = (e) => {
      if (!isDrag) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX ?? prevX;
      const cy = e.clientY ?? e.touches?.[0]?.clientY ?? prevY;
      spherical.theta -= (cx - prevX) * 0.007;
      spherical.phi = Math.max(0.5, Math.min(1.55, spherical.phi + (cy - prevY) * 0.004));
      prevX = cx; prevY = cy; updateCam();
    };
    const onW = (e) => { spherical.r = Math.max(5.5, Math.min(16, spherical.r + e.deltaY * 0.006)); e.preventDefault(); updateCam(); };

    el.addEventListener("pointerdown", onPD); el.addEventListener("pointerup", onPU); el.addEventListener("pointermove", onPM);
    el.addEventListener("touchstart", onPD, { passive: true }); el.addEventListener("touchend", onPU); el.addEventListener("touchmove", onPM, { passive: true });
    el.addEventListener("wheel", onW, { passive: false });

    let raf, last = 0;
    const animate = (now) => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.033, (now - last) / 1000); last = now; time += dt;
      if (!isDrag) spherical.theta += 0.0014;
      updateCam();
      carData.group.position.y = Math.sin(time * 0.7) * 0.007;
      carData.wheels.forEach(w => { w.rotation.x += 0.02; });

      // tick exhaust
      if (carData.exhausts) {
        const origin = new THREE.Vector3(0, 0, 0);
        carData.exhausts.forEach(ex => tickExhaust(ex, dt, origin));
      }

      if (env.particles) { env.particles.rotation.y = time * 0.009; env.particles.position.y = Math.sin(time * 0.1) * 0.05; }
      if (env.key)    env.key.intensity = (car.sceneConfig.keyIntensity || 5.5) * (0.94 + Math.sin(time * 0.7) * 0.06);
      if (env.rim)    env.rim.intensity = (car.sceneConfig.rimIntensity || 2.6) * (0.9 + Math.cos(time * 1.1) * 0.1);
      if (env.bounce) env.bounce.intensity = 0.8 + Math.sin(time * 1.4) * 0.2;
      if (env.ring)   env.ring.material.opacity = 0.06 + Math.sin(time * 1.0) * 0.025;

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    const ro = new ResizeObserver(() => {
      const nW = mount.clientWidth, nH = mount.clientHeight;
      renderer.setSize(nW, nH); camera.aspect = nW / nH; camera.updateProjectionMatrix(); updateCam();
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      ["pointerdown","pointerup","pointermove","touchstart","touchend","touchmove"].forEach(ev => {
        const fn = ev.includes("down")||ev.includes("start")?onPD:ev.includes("up")||ev.includes("end")?onPU:onPM;
        el.removeEventListener(ev, fn);
      });
      el.removeEventListener("wheel", onW); renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [car]);

  return <div ref={mountRef} style={{ position:"absolute", inset:0, cursor:"grab", touchAction:"none" }} />;
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED STAT COUNTER
───────────────────────────────────────────────────────────── */
function StatCounter({ value, suffix = "", duration = 900 }) {
  const [display, setDisplay] = useState("0");
  const rafRef = useRef(null);
  useEffect(() => {
    const num = parseFloat(value);
    if (isNaN(num)) { setDisplay(value); return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur = num * ease;
      setDisplay(Number.isInteger(num) ? Math.round(cur).toString() : cur.toFixed(1));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  return <>{display}{suffix}</>;
}

/* ─────────────────────────────────────────────────────────────
   PHOTO LISTING CARD
───────────────────────────────────────────────────────────── */
function CarListingCard({ listing, index }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [loaded, setLoaded] = useState({});
  const [errors, setErrors] = useState({});
  const [lightbox, setLightbox] = useState(false);
  const [imageSources, setImageSources] = useState({});

  const photoCount = listing.photos || 5;

  const getImageSrc = async (carId, photoNum) => {
    const basePath = `/cars/car${carId}/${photoNum}`;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(`${basePath}.jpg`);
      img.onerror = () => {
        const img2 = new Image();
        img2.onload = () => resolve(`${basePath}.jpeg`);
        img2.onerror = () => resolve(null);
        img2.src = `${basePath}.jpeg`;
      };
      img.src = `${basePath}.jpg`;
    });
  };

  useEffect(() => {
    const load = async () => {
      const sources = {};
      for (let i = 1; i <= photoCount; i++) {
        const src = await getImageSrc(listing.id, i);
        if (src) sources[i] = src;
      }
      setImageSources(sources);
    };
    load();
  }, [listing.id, photoCount]);

  const photos = Array.from({ length: photoCount }, (_, i) => ({
    src: imageSources[i + 1] || null,
    label: PHOTO_SLOT_LABELS[i] || `Photo ${i + 1}`,
  }));

  const prev = () => setActivePhoto(p => (p - 1 + photoCount) % photoCount);
  const next = () => setActivePhoto(p => (p + 1) % photoCount);

  useEffect(() => {
    if (!lightbox) return;
    const fn = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lightbox]);

  const hasImage = !errors[activePhoto] && photos[activePhoto]?.src;
  const activeSrc = photos[activePhoto]?.src;

  if (photos.every(p => !p.src)) return null;

  return (
    <>
      <article className="cl-card" style={{ animationDelay: `${index * 0.07}s` }}>
        <div className="cl-main-box" onClick={() => hasImage && setLightbox(true)}>
          {hasImage ? (
            <>
              <img
                key={activeSrc}
                src={activeSrc}
                alt={`${listing.carName} — ${photos[activePhoto]?.label}`}
                className={`cl-main-img${loaded[activePhoto] ? " loaded" : ""}`}
                onLoad={() => setLoaded(p => ({ ...p, [activePhoto]: true }))}
                onError={() => setErrors(p => ({ ...p, [activePhoto]: true }))}
              />
              <div className="cl-expand-hint">⤢ Tap to expand</div>
            </>
          ) : (
            <div className="cl-no-photo"><span>📷</span><span>Photo coming soon</span></div>
          )}
          {photoCount > 1 && (
            <>
              <button className="cl-arrow cl-arrow-l" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
              <button className="cl-arrow cl-arrow-r" onClick={e => { e.stopPropagation(); next(); }}>›</button>
            </>
          )}
          <div className="cl-count">{activePhoto + 1} / {photoCount}</div>
          {/* Progress bar */}
          <div className="cl-progress">
            {photos.map((_, i) => (
              <div key={i} className={`cl-progress-seg${i === activePhoto ? " active" : ""}`} onClick={e => { e.stopPropagation(); setActivePhoto(i); }} />
            ))}
          </div>
        </div>

        {photos.some(p => p.src) && (
          <div className="cl-thumbs">
            {photos.map((p, i) => (
              <button key={i} className={`cl-thumb${i === activePhoto ? " active" : ""}`} onClick={() => setActivePhoto(i)} title={p.label}>
                {p.src ? (
                  <img src={p.src} alt={p.label} onError={() => setErrors(prev => ({ ...prev, [i]: true }))} />
                ) : (
                  <span className="cl-thumb-err">?</span>
                )}
                <span className="cl-thumb-lbl">{p.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="cl-body">
          <div className="cl-meta">
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <span className="cl-num">Car #{listing.id}</span>
              {listing.carName && <span className="cl-car-name">{listing.carName}</span>}
            </div>
            <p className="cl-desc">{listing.desc}</p>
          </div>
          <a href={WA_CAR_LISTING(listing.id)} target="_blank" rel="noopener noreferrer" className="cl-wa-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Ask About This Car
          </a>
        </div>
      </article>

      {lightbox && (
        <div className="cl-lightbox" onClick={() => setLightbox(false)}>
          <div className="cl-lb-inner" onClick={e => e.stopPropagation()}>
            <div className="cl-lb-bar">
              <span className="cl-lb-title">Car #{listing.id} — {photos[activePhoto]?.label}</span>
              <div style={{ display:"flex", gap:"8px" }}>
                {photoCount > 1 && <><button className="cl-lb-nav" onClick={prev}>‹</button><button className="cl-lb-nav" onClick={next}>›</button></>}
                <button className="cl-lb-close" onClick={() => setLightbox(false)}>✕</button>
              </div>
            </div>
            <img src={activeSrc} alt={photos[activePhoto]?.label} className="cl-lb-img" />
            <div className="cl-lb-dots">
              {photos.map((_, i) => <span key={i} className={`cl-lb-dot${i === activePhoto ? " active" : ""}`} onClick={() => setActivePhoto(i)} />)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const SPEC_ICONS   = ["⚡", "🏎", "🔄"];
const SPEC_LABELS_3D = ["Engine", "Power", "Drive"];

export default function Cars() {
  const [activeCar, setActiveCar] = useState(CARS[0]);
  const [fade, setFade] = useState(true);
  const [mobileTab, setMobileTab] = useState("viewer");
  const [scanY, setScanY] = useState(0);
  const [specKey, setSpecKey] = useState(0); // used to re-trigger stat counter
  const [showKeyHint, setShowKeyHint] = useState(true);

  useEffect(() => {
    let y = 0, raf;
    const tick = () => { y = (y + 0.04) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Hide keyboard hint after first interaction
  useEffect(() => {
    const timer = setTimeout(() => setShowKeyHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const selectCar = useCallback((car) => {
    if (car.id === activeCar.id) return;
    setFade(false);
    setTimeout(() => {
      setActiveCar(car);
      setSpecKey(k => k + 1);
      setFade(true);
    }, 260);
  }, [activeCar]);

  useEffect(() => {
    const onKey = (e) => {
      if (!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      const idx = CARS.findIndex(c => c.id === activeCar.id);
      const next = (e.key === "ArrowDown" || e.key === "ArrowRight")
        ? CARS[(idx+1)%CARS.length]
        : CARS[(idx-1+CARS.length)%CARS.length];
      selectCar(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeCar, selectCar]);

  const acc = activeCar.accent;

  // Parse spec numbers for animated counter
  const parseSpec = (s) => {
    const match = s.match(/([\d.]+)(.*)/);
    return match ? { num: match[1], suffix: match[2].trim() } : { num: s, suffix: "" };
  };

  return (
    <section id="cars" style={{ background:"#030303", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --acc: ${acc}; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes orbit    { from{transform:translate(-50%,-50%) rotate(0)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes orbitRev { from{transform:translate(-50%,-50%) rotate(0)} to{transform:translate(-50%,-50%) rotate(-360deg)} }
        @keyframes pulse    { 0%,100%{opacity:0.2} 50%{opacity:1.0} }
        @keyframes fadeIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lbIn     { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 12px var(--acc)33} 50%{box-shadow:0 0 28px var(--acc)66} }
        @keyframes hintFade { 0%{opacity:1} 80%{opacity:1} 100%{opacity:0} }

        /* ═══════ SHOWROOM ═══════ */
        .nc-wrap { max-width:1480px; margin:0 auto; }
        .nc-header { padding:clamp(48px,7vw,80px) clamp(16px,4vw,40px) 0; display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:20px; position:relative; z-index:4; }
        .nc-eyebrow { display:flex; align-items:center; gap:10px; font-family:'DM Mono',monospace; font-size:9px; font-weight:500; letter-spacing:0.4em; text-transform:uppercase; color:var(--acc); margin-bottom:12px; transition:color 0.4s; }
        .nc-eyebrow-dot { width:5px; height:5px; border-radius:50%; background:var(--acc); animation:pulse 1.8s ease-in-out infinite; transition:background 0.4s; }
        .nc-title { font-family:'DM Serif Display',serif; font-size:clamp(28px,5vw,58px); color:#fff; line-height:1.06; font-weight:400; }
        .nc-title-em { font-style:italic; color:rgba(255,255,255,0.22); }
        .nc-kpi { text-align:right; }
        .nc-kpi-num { font-family:'DM Serif Display',serif; font-size:clamp(34px,5vw,60px); line-height:1; background:linear-gradient(135deg,var(--acc),rgba(255,255,255,0.85)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; transition:background 0.4s; }
        .nc-kpi-lbl { font-family:'DM Mono',monospace; font-size:7px; letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-top:6px; }
        .nc-divider { height:1px; background:linear-gradient(90deg,transparent,var(--acc)55,transparent); margin:20px 0 0; transition:background 0.4s; }
        .nc-tabs { display:none; padding:14px clamp(16px,4vw,40px) 0; gap:0; position:relative; z-index:4; background:rgba(0,0,0,0.6); backdrop-filter:blur(12px); }
        .nc-tab { flex:1; font-family:'DM Mono',monospace; font-size:7.5px; font-weight:500; letter-spacing:0.35em; text-transform:uppercase; background:transparent; border:none; border-bottom:2px solid rgba(255,255,255,0.07); color:rgba(255,255,255,0.3); padding:13px 8px; cursor:pointer; text-align:center; transition:all 0.22s; }
        .nc-tab.active { color:var(--acc); border-bottom-color:var(--acc); }
        @media(max-width:900px){ .nc-tabs { display:flex; } }
        .nc-grid { padding:clamp(14px,2vw,20px) clamp(16px,4vw,40px) 0; display:grid; grid-template-columns:clamp(280px,26vw,360px) 1fr; gap:0; position:relative; z-index:4; }
        @media(max-width:1100px){ .nc-grid { grid-template-columns:300px 1fr; } }
        @media(max-width:900px){ .nc-grid { grid-template-columns:1fr; padding:0; } }

        /* list */
        .nc-list { border:1px solid rgba(255,255,255,0.07); background:#000; overflow-y:auto; max-height:74vh; scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.1) transparent; position:relative; }
        .nc-list::after { content:''; position:sticky; bottom:0; left:0; right:0; height:48px; background:linear-gradient(transparent,#000); pointer-events:none; display:block; }
        .nc-list::-webkit-scrollbar { width:2px; }
        .nc-list::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:2px; }
        @media(max-width:900px){ .nc-list { max-height:none; overflow-y:visible; border:none; border-top:1px solid rgba(255,255,255,0.06); } .nc-list.hide { display:none; } .nc-list::after { display:none; } }
        .nc-row { padding:14px 18px 14px 20px; cursor:pointer; display:grid; grid-template-columns:26px 1fr auto; align-items:center; gap:12px; border-left:2px solid transparent; border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.18s, border-color 0.18s; position:relative; animation:fadeUp 0.45s ease both; }
        .nc-row:last-child { border-bottom:none; }
        .nc-row:hover { background:rgba(255,255,255,0.03); }
        .nc-row.sel { background:rgba(255,255,255,0.04); }
        .nc-row-bar { position:absolute; left:0; top:0; bottom:0; width:2px; transition:background 0.3s; }
        .nc-row-num { font-family:'DM Serif Display',serif; font-size:13px; font-style:italic; color:rgba(255,255,255,0.1); text-align:right; transition:color 0.2s; }
        .nc-row.sel .nc-row-num, .nc-row:hover .nc-row-num { color:rgba(255,255,255,0.4); }
        .nc-row-brand { font-family:'DM Mono',monospace; font-size:7px; font-weight:400; letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.28); margin-bottom:3px; }
        .nc-row-model { font-family:'DM Serif Display',serif; font-size:clamp(15px,1.7vw,17px); color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .nc-row-cat { font-family:'DM Mono',monospace; font-size:6.5px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.14); margin-top:3px; }
        .nc-tag { font-family:'DM Mono',monospace; font-size:5.5px; font-weight:500; letter-spacing:0.22em; text-transform:uppercase; padding:3px 7px; border:1px solid; border-radius:1px; white-space:nowrap; }
        .nc-row-arrow { font-size:15px; opacity:0; transform:translateX(-4px); transition:opacity 0.2s,transform 0.2s; }
        .nc-row:hover .nc-row-arrow, .nc-row.sel .nc-row-arrow { opacity:0.7; transform:translateX(0); }

        /* viewer */
        .nc-viewer { border:1px solid rgba(255,255,255,0.07); border-left:none; display:flex; flex-direction:column; background:#000; }
        @media(max-width:900px){ .nc-viewer { border:none; border-top:1px solid rgba(255,255,255,0.06); } .nc-viewer.hide { display:none; } }
        .nc-canvas { position:relative; flex:1; min-height:clamp(280px,48vw,560px); overflow:hidden; }
        .nc-canvas-bg { position:absolute; inset:0; z-index:1; pointer-events:none; transition:background 0.6s; }
        .nc-canvas-3d { position:absolute; inset:0; z-index:5; transition:opacity 0.28s ease; }
        .nc-scan { position:absolute; left:0; right:0; height:120px; pointer-events:none; z-index:6; transition:background 0.5s; }
        .nc-vignette { position:absolute; inset:0; pointer-events:none; z-index:7; background:radial-gradient(ellipse 88% 78% at 50% 50%, transparent 52%, rgba(0,0,0,0.65) 100%); }
        .nc-fade-b { position:absolute; bottom:0; left:0; right:0; height:80px; background:linear-gradient(transparent,#000); pointer-events:none; z-index:8; }
        .nc-hud-live { position:absolute; top:12px; left:12px; z-index:20; display:flex; align-items:center; gap:8px; font-family:'DM Mono',monospace; font-size:7px; letter-spacing:0.35em; text-transform:uppercase; background:rgba(0,0,0,0.65); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.08); padding:6px 12px; border-radius:3px; transition:color 0.4s, border-color 0.4s; }
        .nc-hud-dot { width:5px; height:5px; border-radius:50%; animation:pulse 1.6s ease-in-out infinite; transition:background 0.4s; }
        .nc-hud-num { position:absolute; top:10px; right:14px; z-index:20; font-family:'DM Serif Display',serif; font-style:italic; font-size:clamp(36px,5vw,58px); color:rgba(255,255,255,0.05); pointer-events:none; }
        .nc-key-hint { position:absolute; bottom:12px; left:12px; z-index:20; font-family:'DM Mono',monospace; font-size:6px; letter-spacing:0.28em; text-transform:uppercase; background:rgba(0,0,0,0.55); backdrop-filter:blur(8px); padding:5px 10px; border-radius:3px; color:rgba(255,255,255,0.32); pointer-events:none; animation:hintFade 5s forwards; }
        .nc-hud-model { position:absolute; bottom:12px; right:14px; z-index:20; text-align:right; pointer-events:none; }
        .nc-hud-brand { font-family:'DM Mono',monospace; font-size:6.5px; letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.22); margin-bottom:3px; }
        .nc-hud-name { font-family:'DM Serif Display',serif; font-style:italic; font-size:clamp(13px,1.6vw,18px); transition:color 0.4s; }
        .nc-corner { position:absolute; pointer-events:none; z-index:12; }
        .nc-corner.tl{top:0;left:0} .nc-corner.br{bottom:0;right:0;transform:rotate(180deg)} .nc-corner.tr{top:0;right:0;transform:rotate(90deg)} .nc-corner.bl{bottom:0;left:0;transform:rotate(-90deg)}
        .nc-orbit { position:absolute; top:50%; left:50%; pointer-events:none; z-index:3; border-radius:50%; border:1px solid; animation:orbit 42s linear infinite; opacity:0.07; }
        .nc-orbit.rev { animation-name:orbitRev; animation-duration:60s; }

        /* detail panel — glass morphism */
        .nc-detail { padding:clamp(14px,2vw,20px) clamp(16px,3vw,24px) clamp(18px,2.5vw,26px); border-top:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.92); backdrop-filter:blur(20px); position:relative; transition:opacity 0.28s; }
        .nc-detail::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--acc)66,transparent); transition:background 0.4s; }
        .nc-detail-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:14px; }
        .nc-detail-brand { font-family:'DM Mono',monospace; font-size:7.5px; font-weight:500; letter-spacing:0.42em; text-transform:uppercase; margin-bottom:5px; transition:color 0.4s; }
        .nc-detail-model { font-family:'DM Serif Display',serif; font-size:clamp(20px,3vw,32px); color:#fff; line-height:1.08; animation:slideIn 0.3s ease both; }
        .nc-detail-desc { font-family:'DM Mono',monospace; font-size:7.5px; color:rgba(255,255,255,0.42); margin-top:8px; letter-spacing:0.12em; line-height:1.65; max-width:320px; }

        /* spec grid */
        .nc-specs { display:grid; grid-template-columns:repeat(3,1fr); border:1px solid; margin:14px 0; overflow:hidden; border-radius:4px; }
        .nc-spec { text-align:center; padding:12px 6px; border-right:1px solid; transition:background 0.2s; position:relative; overflow:hidden; }
        .nc-spec:last-child { border-right:none; }
        .nc-spec:hover { background:rgba(255,255,255,0.03); }
        .nc-spec::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,var(--acc)04,transparent 60%); pointer-events:none; }
        .nc-spec-icon { font-size:13px; margin-bottom:5px; opacity:0.7; }
        .nc-spec-val { font-family:'DM Serif Display',serif; font-size:clamp(12px,1.7vw,17px); transition:color 0.4s; }
        .nc-spec-lbl { font-family:'DM Mono',monospace; font-size:5.5px; letter-spacing:0.4em; text-transform:uppercase; color:rgba(255,255,255,0.22); margin-top:5px; }
        .nc-btns { display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }
        .nc-btn-negotiate { font-family:'DM Mono',monospace; font-size:7.5px; font-weight:500; letter-spacing:0.28em; text-transform:uppercase; color:#000; background:#25D366; border:none; padding:12px 22px; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px; border-radius:3px; box-shadow:0 4px 20px rgba(37,211,102,0.3); transition:filter 0.25s, transform 0.22s, box-shadow 0.25s; }
        .nc-btn-negotiate:hover { filter:brightness(1.1); transform:translateY(-2px); box-shadow:0 6px 30px rgba(37,211,102,0.5); }
        .nc-btn-ghost { font-family:'DM Mono',monospace; font-size:7.5px; font-weight:500; letter-spacing:0.28em; text-transform:uppercase; color:rgba(255,255,255,0.45); background:transparent; border:1px solid rgba(255,255,255,0.12); padding:12px 20px; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:8px; border-radius:3px; transition:all 0.25s; }
        .nc-btn-ghost:hover { border-color:#25D366; color:#25D366; transform:translateY(-2px); }
        @media(max-width:900px){ .nc-detail-head { flex-direction:column; gap:12px; } .nc-btns { flex-direction:column; } .nc-btn-negotiate,.nc-btn-ghost { width:100%; justify-content:center; padding:12px; } }
        @media(max-width:480px){ .nc-header { flex-direction:column; gap:14px; } .nc-kpi { text-align:left; } }

        /* banner */
        .nc-banner { margin:clamp(14px,2vw,22px) clamp(16px,4vw,40px) 0; padding:16px 24px; border:1px solid rgba(255,255,255,0.07); background:linear-gradient(135deg,rgba(255,255,255,0.025),rgba(255,255,255,0.005)); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; border-radius:4px; }
        .nc-banner-txt { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .nc-banner-icon { font-size:26px; }
        .nc-banner-title { font-family:'DM Serif Display',serif; font-size:clamp(14px,1.8vw,18px); color:#fff; }
        .nc-banner-sub { font-family:'DM Mono',monospace; font-size:6.5px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-top:4px; }
        .nc-wa-btn { background:#25D366; color:#000; border:none; padding:10px 22px; font-family:'DM Mono',monospace; font-size:7px; font-weight:500; letter-spacing:0.3em; text-transform:uppercase; text-decoration:none; border-radius:3px; transition:transform 0.25s,filter 0.25s; display:inline-flex; align-items:center; gap:8px; }
        .nc-wa-btn:hover { transform:translateY(-2px); filter:brightness(1.1); }
        @media(max-width:700px){ .nc-banner { flex-direction:column; text-align:center; } }

        /* marquee */
        .nc-marquee-wrap { border-top:1px solid rgba(255,255,255,0.04); overflow:hidden; padding:10px 0; background:#000; margin-top:28px; }
        .nc-marquee { display:flex; gap:36px; animation:marquee 30s linear infinite; width:max-content; }
        .nc-marquee-item { font-family:'DM Mono',monospace; font-size:7px; letter-spacing:0.35em; text-transform:uppercase; white-space:nowrap; }
        .nc-bottom-rule { height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent); }

        /* car selector dots at bottom of canvas */
        .nc-car-dots { position:absolute; bottom:18px; left:50%; transform:translateX(-50%); z-index:20; display:flex; gap:7px; }
        .nc-car-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.18); border:none; cursor:pointer; padding:0; transition:all 0.2s; }
        .nc-car-dot.active { background:var(--acc); transform:scale(1.4); }

        /* ═══════ PHOTO LISTING ═══════ */
        .cl-section { background:#080808; padding:clamp(48px,7vw,80px) clamp(16px,4vw,40px); border-top:1px solid rgba(255,255,255,0.06); font-family:'Plus Jakarta Sans',sans-serif; }
        .cl-section-header { max-width:1200px; margin:0 auto clamp(28px,4vw,48px); }
        .cl-eyebrow { display:flex; align-items:center; gap:8px; font-family:'DM Mono',monospace; font-size:9px; font-weight:500; letter-spacing:0.4em; text-transform:uppercase; color:#25D366; margin-bottom:12px; }
        .cl-eyebrow-dot { width:5px; height:5px; border-radius:50%; background:#25D366; animation:pulse 1.8s ease-in-out infinite; }
        .cl-heading { font-family:'DM Serif Display',serif; font-size:clamp(26px,4vw,48px); font-weight:400; color:#fff; line-height:1.1; margin-bottom:10px; }
        .cl-heading em { font-style:italic; color:rgba(255,255,255,0.22); }
        .cl-subhead { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.18em; color:rgba(255,255,255,0.35); line-height:1.7; max-width:460px; }
        .cl-grid { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr)); gap:clamp(14px,2.5vw,24px); }

        /* card */
        .cl-card { background:#111; border:1px solid rgba(255,255,255,0.07); border-radius:10px; overflow:hidden; display:flex; flex-direction:column; animation:fadeUp 0.5s ease both; transition:border-color 0.25s,transform 0.25s,box-shadow 0.25s; }
        .cl-card:hover { border-color:rgba(37,211,102,0.25); transform:translateY(-4px); box-shadow:0 14px 44px rgba(0,0,0,0.55); }

        /* main photo */
        .cl-main-box { position:relative; aspect-ratio:16/10; background:#1a1a1a; cursor:pointer; overflow:hidden; }
        .cl-main-img { width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.32s,transform 0.38s; }
        .cl-main-img.loaded { opacity:1; }
        .cl-main-box:hover .cl-main-img { transform:scale(1.04); }
        .cl-expand-hint { position:absolute; bottom:32px; left:50%; transform:translateX(-50%); font-family:'DM Mono',monospace; font-size:8px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(255,255,255,0.55); background:rgba(0,0,0,0.6); padding:3px 9px; border-radius:20px; pointer-events:none; opacity:0; transition:opacity 0.2s; white-space:nowrap; }
        .cl-main-box:hover .cl-expand-hint { opacity:1; }
        .cl-no-photo { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; }
        .cl-no-photo span:first-child { font-size:26px; opacity:0.2; }
        .cl-no-photo span:last-child { font-family:'DM Mono',monospace; font-size:8px; letter-spacing:0.25em; text-transform:uppercase; color:rgba(255,255,255,0.18); }
        .cl-arrow { position:absolute; top:50%; transform:translateY(-50%); width:30px; height:30px; border-radius:50%; background:rgba(0,0,0,0.65); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:17px; cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.2s; z-index:5; }
        .cl-main-box:hover .cl-arrow { opacity:1; }
        .cl-arrow:hover { background:rgba(0,0,0,0.9); }
        .cl-arrow-l { left:9px; } .cl-arrow-r { right:9px; }
        .cl-count { position:absolute; top:9px; right:9px; z-index:5; font-family:'DM Mono',monospace; font-size:8px; font-weight:600; letter-spacing:0.1em; background:rgba(0,0,0,0.65); backdrop-filter:blur(8px); color:rgba(255,255,255,0.65); padding:3px 8px; border-radius:20px; pointer-events:none; }

        /* photo progress bar */
        .cl-progress { position:absolute; bottom:0; left:0; right:0; z-index:6; display:flex; gap:2px; padding:0 4px 4px; }
        .cl-progress-seg { flex:1; height:2px; background:rgba(255,255,255,0.22); border-radius:2px; cursor:pointer; transition:background 0.2s,transform 0.2s; }
        .cl-progress-seg.active { background:#25D366; transform:scaleY(1.5); }

        /* thumbnails */
        .cl-thumbs { display:grid; grid-template-columns:repeat(5,1fr); gap:2px; background:#080808; padding:2px; }
        .cl-thumb { position:relative; aspect-ratio:4/3; border:none; padding:0; background:#1a1a1a; cursor:pointer; overflow:hidden; opacity:0.45; transition:opacity 0.18s; }
        .cl-thumb.active { opacity:1; }
        .cl-thumb:hover { opacity:0.82; }
        .cl-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .cl-thumb-err { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:10px; color:rgba(255,255,255,0.15); }
        .cl-thumb-lbl { position:absolute; bottom:0; left:0; right:0; font-family:'DM Mono',monospace; font-size:6px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.45); text-align:center; padding:2px; background:rgba(0,0,0,0.6); pointer-events:none; }
        .cl-thumb.active .cl-thumb-lbl { color:#25D366; }

        /* card body */
        .cl-body { padding:16px 18px 18px; display:flex; flex-direction:column; gap:14px; flex:1; }
        .cl-meta { display:flex; flex-direction:column; gap:5px; }
        .cl-num { font-family:'DM Mono',monospace; font-size:9px; font-weight:600; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.22); }
        .cl-car-name { font-family:'DM Serif Display',serif; font-size:11px; color:rgba(255,255,255,0.35); font-style:italic; }
        .cl-desc { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.1em; color:rgba(255,255,255,0.38); line-height:1.55; }
        .cl-wa-btn { display:flex; align-items:center; justify-content:center; gap:8px; background:#25D366; color:#000; font-family:'Plus Jakarta Sans',sans-serif; font-size:12px; font-weight:700; letter-spacing:0.03em; padding:12px 18px; border-radius:7px; text-decoration:none; transition:background 0.22s,transform 0.22s,box-shadow 0.22s; box-shadow:0 4px 16px rgba(37,211,102,0.22); margin-top:auto; }
        .cl-wa-btn:hover { background:#1fbb58; transform:translateY(-2px); box-shadow:0 8px 28px rgba(37,211,102,0.38); }

        /* lightbox */
        .cl-lightbox { position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.95); backdrop-filter:blur(22px); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.18s ease; }
        .cl-lb-inner { display:flex; flex-direction:column; max-width:min(94vw,1100px); width:100%; animation:lbIn 0.2s ease; }
        .cl-lb-bar { display:flex; align-items:center; justify-content:space-between; padding-bottom:10px; }
        .cl-lb-title { font-family:'DM Mono',monospace; font-size:10px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45); }
        .cl-lb-nav,.cl-lb-close { width:32px; height:32px; border-radius:5px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.6); font-size:14px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.18s; }
        .cl-lb-nav:hover,.cl-lb-close:hover { background:rgba(255,255,255,0.12); color:#fff; }
        .cl-lb-img { width:100%; max-height:76vh; object-fit:contain; border-radius:7px; border:1px solid rgba(255,255,255,0.07); display:block; }
        .cl-lb-dots { display:flex; align-items:center; justify-content:center; gap:7px; padding-top:12px; }
        .cl-lb-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.2); cursor:pointer; transition:background 0.18s,transform 0.18s; }
        .cl-lb-dot.active { background:#25D366; transform:scale(1.35); }

        /* footer cta */
        .cl-footer { max-width:1200px; margin:clamp(32px,4vw,52px) auto 0; padding:22px 26px; background:#111; border:1px solid rgba(255,255,255,0.07); border-radius:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .cl-footer h3 { font-family:'DM Serif Display',serif; font-size:clamp(14px,1.8vw,18px); color:#fff; margin-bottom:4px; }
        .cl-footer p { font-family:'DM Mono',monospace; font-size:8px; letter-spacing:0.18em; color:rgba(255,255,255,0.3); }
        .cl-footer-wa { display:flex; align-items:center; gap:8px; background:#25D366; color:#000; font-family:'Plus Jakarta Sans',sans-serif; font-size:12px; font-weight:700; padding:11px 22px; border-radius:7px; text-decoration:none; transition:background 0.22s,transform 0.22s; white-space:nowrap; }
        .cl-footer-wa:hover { background:#1fbb58; transform:translateY(-2px); }
        @media(max-width:600px){ .cl-footer { flex-direction:column; } .cl-footer-wa { width:100%; justify-content:center; } }
      `}</style>

      {/* ══════ 3D SHOWROOM ══════ */}
      <div className="nc-wrap">
        <div className="nc-header">
          <div>
            <div className="nc-eyebrow" style={{ "--acc": acc }}>
              <div className="nc-eyebrow-dot" style={{ background: acc }} />
              Nigeria Used Cars · Premium Dealer
            </div>
            <h2 className="nc-title">Nigeria's Most<br /><span className="nc-title-em">Trusted Vehicles.</span></h2>
          </div>
          <div className="nc-kpi">
            <div className="nc-kpi-num">500+</div>
            <div className="nc-kpi-lbl">Vehicles in Stock</div>
          </div>
        </div>
        <div style={{ padding:"0 clamp(16px,4vw,40px)" }}>
          <div className="nc-divider" />
        </div>
      </div>

      <div className="nc-wrap nc-tabs">
        {["viewer","list"].map(tab => (
          <button key={tab} className={`nc-tab${mobileTab === tab ? " active" : ""}`} onClick={() => setMobileTab(tab)}>
            {tab === "viewer" ? "3D Viewer" : "Collection"}
          </button>
        ))}
      </div>

      <div className="nc-wrap nc-grid" style={{ "--acc": acc }}>
        {/* Car list */}
        <div className={`nc-list${mobileTab === "viewer" ? " hide" : ""}`}>
          {CARS.map((car, i) => {
            const isSel = car.id === activeCar.id;
            return (
              <div
                key={car.id}
                className={`nc-row${isSel ? " sel" : ""}`}
                style={{ animationDelay:`${i * 0.06}s`, borderLeftColor: isSel ? car.accent : "transparent" }}
                onClick={() => selectCar(car)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && selectCar(car)}
              >
                <div className="nc-row-bar" style={{ background: isSel ? car.accent : "transparent" }} />
                <div className="nc-row-num">{String(i+1).padStart(2,"0")}</div>
                <div>
                  <div className="nc-row-brand">{car.brand}</div>
                  <div className="nc-row-model">{car.model}</div>
                  <div className="nc-row-cat">{car.category}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"5px" }}>
                  {car.tag && <span className="nc-tag" style={{ color:car.accent, borderColor:`${car.accent}40` }}>{car.tag}</span>}
                  <span className="nc-row-arrow" style={{ color:car.accent }}>›</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Viewer */}
        <div className={`nc-viewer${mobileTab === "list" ? " hide" : ""}`}>
          <div className="nc-canvas">
            <div className="nc-canvas-bg" style={{ background:`radial-gradient(ellipse 65% 65% at 50% 45%, ${acc}22 0%, #000 72%)` }} />
            <div className="nc-orbit" style={{ width:320, height:320, borderColor:`${acc}1a`, marginLeft:-160, marginTop:-160 }} />
            <div className="nc-orbit rev" style={{ width:520, height:520, borderColor:`${acc}0e`, marginLeft:-260, marginTop:-260 }} />
            <div className="nc-scan" style={{ top:`${scanY}%`, background:`linear-gradient(to bottom, transparent, ${acc}14, transparent)` }} />

            {["tl","br","tr","bl"].map(pos => (
              <svg key={pos} className={`nc-corner ${pos}`} width="36" height="36" viewBox="0 0 40 40" fill="none" style={{ opacity:0.45 }}>
                <path d="M0 40V0H40" stroke={acc} strokeWidth="1" fill="none" />
                <circle cx="0" cy="0" r="2.5" fill={acc} opacity="0.95" />
              </svg>
            ))}

            <div className="nc-canvas-3d" style={{ opacity: fade ? 1 : 0 }}>
              <ShowroomScene car={activeCar} />
            </div>
            <div className="nc-vignette" />
            <div className="nc-fade-b" />

            {/* HUD */}
            <div className="nc-hud-live" style={{ color:acc, borderColor:`${acc}30` }}>
              <div className="nc-hud-dot" style={{ background:acc }} />
              Interactive 3D · Drag to Rotate
            </div>
            <div className="nc-hud-num">{String(activeCar.id).padStart(2,"0")}</div>
            {showKeyHint && <div className="nc-key-hint">↺ Drag · Pinch · ↑↓ Arrow Keys</div>}
            <div className="nc-hud-model">
              <div className="nc-hud-brand">{activeCar.brand}</div>
              <div className="nc-hud-name" style={{ color:`${acc}cc` }}>{activeCar.model}</div>
            </div>

            {/* Quick-select car dots */}
            <div className="nc-car-dots">
              {CARS.map(car => (
                <button
                  key={car.id}
                  className={`nc-car-dot${car.id === activeCar.id ? " active" : ""}`}
                  style={{ "--acc": car.accent }}
                  onClick={() => selectCar(car)}
                  title={`${car.brand} ${car.model}`}
                />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="nc-detail" style={{ "--acc": acc, opacity: fade ? 1 : 0 }}>
            <div className="nc-detail-head">
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap", marginBottom:"5px" }}>
                  <div className="nc-detail-brand" style={{ color:acc }}>{activeCar.brand}</div>
                  <span className="nc-tag" style={{ color:acc, borderColor:`${acc}40` }}>{activeCar.tag}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"6px", letterSpacing:"0.3em", textTransform:"uppercase", padding:"2px 8px", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.22)", borderRadius:"2px" }}>
                    {activeCar.category}
                  </span>
                </div>
                <div key={`model-${specKey}`} className="nc-detail-model">{activeCar.model}</div>
                <div className="nc-detail-desc">{activeCar.description}</div>
              </div>
            </div>

            {/* Animated spec counters */}
            <div className="nc-specs" style={{ borderColor:`${acc}28` }}>
              {activeCar.specs.map((s, i) => {
                const { num, suffix } = parseSpec(s);
                return (
                  <div key={i} className="nc-spec" style={{ borderColor:`${acc}18` }}>
                    <div className="nc-spec-icon">{SPEC_ICONS[i]}</div>
                    <div className="nc-spec-val" style={{ color:acc }}>
                      <StatCounter key={`${specKey}-${i}`} value={num} suffix={suffix} duration={700 + i * 120} />
                    </div>
                    <div className="nc-spec-lbl">{SPEC_LABELS_3D[i]}</div>
                  </div>
                );
              })}
            </div>

            <div className="nc-btns">
              <a href={WA_NEGOTIATE(activeCar.brand, activeCar.model)} target="_blank" rel="noopener noreferrer" className="nc-btn-negotiate">
                💬 Negotiate on WhatsApp
              </a>
              <a href={WA_GENERAL} target="_blank" rel="noopener noreferrer" className="nc-btn-ghost">
                📞 View All Inventory
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="nc-wrap">
        <div className="nc-banner">
          <div className="nc-banner-txt">
            <div className="nc-banner-icon">🚗</div>
            <div>
              <div className="nc-banner-title">Looking for a different vehicle?</div>
              <div className="nc-banner-sub">We have 500+ cars in stock — tell us what you need</div>
            </div>
          </div>
          <a href={WA_GENERAL} target="_blank" rel="noopener noreferrer" className="nc-wa-btn">📱 Chat on WhatsApp</a>
        </div>
      </div>

      <div className="nc-marquee-wrap">
        <div className="nc-marquee">
          {[...Array(3)].flatMap((_, idx) =>
            ["🇳🇬 Hilux — No.1 Pickup","🇳🇬 Corolla — Best Seller","🇳🇬 CR-V — Family SUV","🇳🇬 C300 — Luxury","🇳🇬 RX 350 — Premium SUV","📍 Nationwide Delivery","✅ Quality Guaranteed","💰 Best Prices in Nigeria"]
            .map((item, i) => <span key={`${idx}-${i}`} className="nc-marquee-item" style={{ color:`${acc}75` }}>{item} &nbsp;·</span>)
          )}
        </div>
      </div>
      <div className="nc-bottom-rule" />

      {/* ══════ PHOTO LISTING ══════ */}
      <div className="cl-section">
        <div className="cl-section-header">
          <div className="cl-eyebrow"><span className="cl-eyebrow-dot" />Current Stock · Real Photos</div>
          <h2 className="cl-heading">Cars for Sale.<br /><em>Real photos. Real prices.</em></h2>
          <p className="cl-subhead">Browse our current stock. Tap any photo to expand, then chat us on WhatsApp to ask about price or arrange inspection.</p>
        </div>

        <div className="cl-grid">
          {LISTINGS.map((listing, i) => (
            <CarListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>

        <div className="cl-footer">
          <div>
            <h3>Don't see what you're looking for?</h3>
            <p>We have more cars in stock — send us a message and we'll find it for you.</p>
          </div>
          <a href={`${WA_BASE}?text=${encodeURIComponent("Hello Nigeria Used Cars! I'm looking for a specific car. Can you help me find it?")}`} target="_blank" rel="noopener noreferrer" className="cl-footer-wa">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>

    </section>
  );
}