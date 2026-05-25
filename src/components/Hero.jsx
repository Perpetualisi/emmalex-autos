import React, { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";

/* ══════════════════════════════════════════════════
   SLIDE DATA (unchanged)
══════════════════════════════════════════════════ */
const slides = [
  {
    category: "Vehicles",
    label: "Luxury & Regular Cars",
    count: 200,
    accent: "#C6A84B",
    accentRGB: [0.776, 0.659, 0.294],
    bg: "radial-gradient(ellipse at 65% 40%, rgba(198,168,75,0.18) 0%, rgba(198,168,75,0.04) 45%, transparent 70%)",
    scene: "cars",
    tagline: "Drive the extraordinary.",
    stat: "200+ vehicles in stock",
  },
  {
    category: "Real Estate",
    label: "Commercial & Residential",
    count: 50,
    accent: "#5599FF",
    accentRGB: [0.333, 0.6, 1.0],
    bg: "radial-gradient(ellipse at 65% 40%, rgba(85,153,255,0.18) 0%, rgba(85,153,255,0.04) 45%, transparent 70%)",
    scene: "realestate",
    tagline: "Prime properties, prime locations.",
    stat: "Exclusive listings nationwide",
  },
  {
    category: "Equipment",
    label: "Construction & Leasing",
    count: 50,
    accent: "#F5C518",
    accentRGB: [0.961, 0.773, 0.094],
    bg: "radial-gradient(ellipse at 65% 40%, rgba(245,197,24,0.18) 0%, rgba(245,197,24,0.04) 45%, transparent 70%)",
    scene: "equipment",
    tagline: "Heavy machinery, ready to deploy.",
    stat: "50+ active fleet",
  },
];

/* ══════════════════════════════════════════════════
   ENHANCED MATERIAL HELPERS
══════════════════════════════════════════════════ */
const mat = (color, rough = 0.3, metal = 0.6) =>
  new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: rough, metalness: metal });

const premiumPaint = (color, metalness = 0.92, roughness = 0.08) =>
  new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: metalness,
    roughness: roughness,
    clearcoat: 0.95,
    clearcoatRoughness: 0.05,
    reflectivity: 0.5,
  });

const chromeMat = (color = 0xc0d0e0) =>
  new THREE.MeshStandardMaterial({ color: color, metalness: 0.98, roughness: 0.04, emissive: 0x224466, emissiveIntensity: 0.08 });

const glassMat = (color = 0xa8d0f0, opacity = 0.7) =>
  new THREE.MeshPhysicalMaterial({
    color: color,
    metalness: 0.95,
    roughness: 0.08,
    transparent: true,
    opacity: opacity,
    ior: 1.52,
    transmission: 0.3,
  });

const rubberMat = () => new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85, metalness: 0.05 });

const lightMat = (color, intensity = 0.8) =>
  new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: intensity, metalness: 0.9, roughness: 0.1 });

const wireMat = (color, opacity = 0.08) =>
  new THREE.MeshBasicMaterial({ color: new THREE.Color(color), wireframe: true, transparent: true, opacity });

/* ══════════════════════════════════════════════════
   ENHANCED WHEEL BUILDER
══════════════════════════════════════════════════ */
function makePremiumWheel(accentHex, size = 1) {
  const g = new THREE.Group();
  const accentColor = new THREE.Color(accentHex);
  
  // Tyre
  const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.42 * size, 0.14 * size, 32, 64), rubberMat());
  tyre.rotation.x = Math.PI / 2;
  g.add(tyre);
  
  // Rim base
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32 * size, 0.32 * size, 0.16 * size, 48), chromeMat());
  rim.rotation.x = Math.PI / 2;
  g.add(rim);
  
  // Premium spokes
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.045 * size, 0.55 * size, 0.06 * size), chromeMat(accentColor.getHex()));
    spoke.position.set(Math.sin(angle) * 0.18 * size, 0, Math.cos(angle) * 0.18 * size);
    spoke.rotation.set(Math.PI / 2, 0, angle);
    g.add(spoke);
  }
  
  // Centre cap
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * size, 0.09 * size, 0.14 * size, 24), chromeMat());
  cap.rotation.x = Math.PI / 2;
  g.add(cap);
  
  // Brake disc visible
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * size, 0.22 * size, 0.03 * size, 32), mat(0x888888, 0.2, 0.85));
  disc.rotation.x = Math.PI / 2;
  disc.position.z = 0.08 * size;
  g.add(disc);
  
  // Caliper
  const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.1 * size, 0.12 * size, 0.22 * size), mat(0xcc3300, 0.3, 0.7));
  caliper.position.set(0.22 * size, -0.05 * size, 0.12 * size);
  g.add(caliper);
  
  return g;
}

/* ══════════════════════════════════════════════════
   ENHANCED CAR MODELS
══════════════════════════════════════════════════ */

// Premium Luxury Sedan (Mercedes-Benz S-Class style)
function makeLuxurySedan(accentHex) {
  const g = new THREE.Group();
  const bodyColor = 0x0a0a0a;
  const bodyMat = premiumPaint(bodyColor, 0.96, 0.06);
  const chrome = chromeMat();
  const glass = glassMat(0xaaddff, 0.65);
  const accentMat = premiumPaint(accentHex, 0.95, 0.05);
  
  // Main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.48, 1.88), bodyMat);
  body.position.y = -0.18;
  body.castShadow = true;
  g.add(body);
  
  // Roof (sleek)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 1.65), bodyMat);
  roof.position.set(-0.15, 0.4, 0);
  roof.castShadow = true;
  g.add(roof);
  
  // Panoramic glass roof
  const panoRoof = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.04, 1.45), glass);
  panoRoof.position.set(-0.2, 0.48, 0);
  g.add(panoRoof);
  
  // Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 1.7), glass);
  windshield.position.set(0.85, 0.28, 0);
  windshield.rotation.z = -0.28;
  g.add(windshield);
  
  // Rear window
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 1.7), glass);
  rearGlass.position.set(-1.2, 0.28, 0);
  rearGlass.rotation.z = 0.22;
  g.add(rearGlass);
  
  // Side windows
  [-0.85, 0.05, 0.95].forEach(x => {
    [0.92, -0.92].forEach(z => {
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.38, 0.04), glass);
      sideGlass.position.set(x, 0.26, z);
      g.add(sideGlass);
    });
  });
  
  // Chrome window trim
  const trim = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.03, 0.08), chrome);
  trim.position.set(0, 0.18, 0.98);
  g.add(trim);
  
  // Grille (premium)
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 1.65), chrome);
  grille.position.set(2.12, -0.08, 0);
  g.add(grille);
  
  // Vertical grille bars
  for (let i = -0.7; i <= 0.7; i += 0.14) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.04), chrome);
    bar.position.set(2.1, -0.08, i);
    g.add(bar);
  }
  
  // Headlights (LED matrix)
  [0.9, -0.9].forEach(z => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.42), lightMat(0xffeedd, 0.85));
    hl.position.set(2.18, 0.02, z);
    g.add(hl);
    const drl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.38), lightMat(0x88aaff, 0.6));
    drl.position.set(2.16, 0.1, z);
    g.add(drl);
  });
  
  // Taillights (full-width LED bar)
  const tailBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 1.55), lightMat(0xff2200, 0.7));
  tailBar.position.set(-2.18, -0.05, 0);
  g.add(tailBar);
  
  // Quad exhaust
  [[-2.05, -0.45, 0.75], [-2.05, -0.45, -0.75], [-2.15, -0.45, 0.62], [-2.15, -0.45, -0.62]].forEach(pos => {
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16), chrome);
    exhaust.position.set(pos[0], pos[1], pos[2]);
    exhaust.rotation.x = Math.PI / 2;
    g.add(exhaust);
  });
  
  // Wheels
  const wheelPos = [[-1.35, -0.52, 1.02], [1.35, -0.52, 1.02], [-1.35, -0.52, -1.02], [1.35, -0.52, -1.02]];
  wheelPos.forEach(pos => {
    const wheel = makePremiumWheel(accentHex, 1.0);
    wheel.position.set(pos[0], pos[1], pos[2]);
    g.add(wheel);
  });
  
  // Body-colored door handles
  [-1.2, -0.2, 0.8].forEach(x => {
    [0.98, -0.98].forEach(z => {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.05), chrome);
      handle.position.set(x, -0.02, z);
      g.add(handle);
    });
  });
  
  return g;
}

// Premium SUV (Range Rover style)
function makePremiumSUV(accentHex) {
  const g = new THREE.Group();
  const bodyColor = 0x0d1a28;
  const bodyMat = premiumPaint(bodyColor, 0.92, 0.1);
  const chrome = chromeMat();
  const glass = glassMat(0xaaddff, 0.65);
  const accentMat = premiumPaint(accentHex, 0.94, 0.06);
  
  // Main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.58, 2.05), bodyMat);
  body.position.y = -0.22;
  body.castShadow = true;
  g.add(body);
  
  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.1, 1.92), bodyMat);
  roof.position.set(0, 0.46, 0);
  g.add(roof);
  
  // Floating roof effect (black pillars illusion)
  const roofGloss = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.04, 1.92), chrome);
  roofGloss.position.set(0, 0.51, 0);
  g.add(roofGloss);
  
  // Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.62, 1.85), glass);
  windshield.position.set(1.85, 0.38, 0);
  windshield.rotation.z = -0.22;
  g.add(windshield);
  
  // Rear window
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 1.85), glass);
  rearGlass.position.set(-1.85, 0.38, 0);
  rearGlass.rotation.z = 0.2;
  g.add(rearGlass);
  
  // Side windows
  [-1.1, -0.2, 0.7, 1.5].forEach(x => {
    [1.04, -1.04].forEach(z => {
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.48, 0.04), glass);
      sideGlass.position.set(x, 0.42, z);
      g.add(sideGlass);
    });
  });
  
  // Chrome window surround
  const windowTrim = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.04, 0.08), chrome);
  windowTrim.position.set(0, 0.24, 1.06);
  g.add(windowTrim);
  
  // Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, 1.75), chrome);
  grille.position.set(2.35, -0.06, 0);
  g.add(grille);
  
  // Mesh grille pattern
  for (let i = -0.8; i <= 0.8; i += 0.16) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.04), chrome);
    bar.position.set(2.33, -0.06, i);
    g.add(bar);
  }
  
  // Headlights
  [0.98, -0.98].forEach(z => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.38), lightMat(0xffeedd, 0.8));
    hl.position.set(2.32, -0.02, z);
    g.add(hl);
    const drl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.32), lightMat(0x88aaff, 0.55));
    drl.position.set(2.3, 0.08, z);
    g.add(drl);
  });
  
  // Taillights
  [0.98, -0.98].forEach(z => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.12), lightMat(0xff2200, 0.65));
    tl.position.set(-2.34, 0.04, z);
    g.add(tl);
  });
  
  // Roof rails
  [1.08, -1.08].forEach(z => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 0.08), chrome);
    rail.position.set(0, 0.66, z);
    g.add(rail);
  });
  
  // Side steps
  [1.15, -1.15].forEach(z => {
    const step = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.06, 0.2), chrome);
    step.position.set(0, -0.38, z);
    g.add(step);
  });
  
  // Wheels
  const wheelPos = [[-1.5, -0.54, 1.15], [1.5, -0.54, 1.15], [-1.5, -0.54, -1.15], [1.5, -0.54, -1.15]];
  wheelPos.forEach(pos => {
    const wheel = makePremiumWheel(accentHex, 1.1);
    wheel.position.set(pos[0], pos[1], pos[2]);
    g.add(wheel);
  });
  
  return g;
}

// Premium Sports Car (Porsche 911 style)
function makeSportsCar(accentHex) {
  const g = new THREE.Group();
  const bodyColor = 0x8a0000;
  const bodyMat = premiumPaint(bodyColor, 0.96, 0.05);
  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.35 });
  const chrome = chromeMat();
  const glass = glassMat(0xaaddff, 0.7);
  
  // Low, wide body
  const body = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.34, 1.92), bodyMat);
  body.position.y = -0.28;
  body.castShadow = true;
  g.add(body);
  
  // Curved roofline
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.28, 1.68), bodyMat);
  cabin.position.set(-0.1, 0.12, 0);
  g.add(cabin);
  
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.09, 1.55), bodyMat);
  roof.position.set(-0.3, 0.34, 0);
  g.add(roof);
  
  // Windshield (raked)
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 1.72), glass);
  windshield.position.set(0.75, 0.18, 0);
  windshield.rotation.z = -0.42;
  g.add(windshield);
  
  // Rear glass (fastback)
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.52, 1.72), glass);
  rearGlass.position.set(-0.95, 0.16, 0);
  rearGlass.rotation.z = 0.38;
  g.add(rearGlass);
  
  // Side windows
  [0.92, -0.92].forEach(z => {
    const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 0.04), glass);
    sideGlass.position.set(0.25, 0.2, z);
    g.add(sideGlass);
    const rearSide = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.18, 0.04), glass);
    rearSide.position.set(-0.6, 0.2, z);
    g.add(rearSide);
  });
  
  // Front bumper with splitter
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 1.85), carbonMat);
  splitter.position.set(2.2, -0.48, 0);
  g.add(splitter);
  
  // Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 1.55), carbonMat);
  grille.position.set(2.18, -0.22, 0);
  g.add(grille);
  
  // Headlights (round)
  [0.95, -0.95].forEach(z => {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), lightMat(0xffeedd, 0.9));
    hl.position.set(2.2, -0.08, z);
    g.add(hl);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.008, 24, 48), chrome);
    ring.position.set(2.18, -0.06, z);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
  });
  
  // Rear wing
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.05, 0.52), carbonMat);
  wing.position.set(-2.05, 0.38, 0);
  g.add(wing);
  const wingEnd = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.48), carbonMat);
  wingEnd.position.set(-2.05, 0.38, 1.06);
  g.add(wingEnd);
  
  // Taillight bar
  const tailBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 1.45), lightMat(0xff2200, 0.75));
  tailBar.position.set(-2.18, -0.1, 0);
  g.add(tailBar);
  
  // Quad exhaust
  [[-2.1, -0.44, 0.72], [-2.1, -0.44, -0.72], [-2.2, -0.44, 0.6], [-2.2, -0.44, -0.6]].forEach(pos => {
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.16, 16), chrome);
    exhaust.position.set(pos[0], pos[1], pos[2]);
    exhaust.rotation.x = Math.PI / 2;
    g.add(exhaust);
  });
  
  // Side skirts
  [1.02, -1.02].forEach(z => {
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 0.08), carbonMat);
    skirt.position.set(0, -0.32, z);
    g.add(skirt);
  });
  
  // Wheels (larger, sporty)
  const wheelPos = [[-1.45, -0.52, 1.02], [1.45, -0.52, 1.02], [-1.45, -0.52, -1.02], [1.45, -0.52, -1.02]];
  wheelPos.forEach(pos => {
    const wheel = makePremiumWheel(accentHex, 0.98);
    wheel.position.set(pos[0], pos[1], pos[2]);
    g.add(wheel);
  });
  
  return g;
}

/* ══════════════════════════════════════════════════
   REAL ESTATE - ENHANCED BUILDINGS
══════════════════════════════════════════════════ */

function makePremiumTower(accentHex, floors = 12, scale = 1) {
  const g = new THREE.Group();
  const accentColor = new THREE.Color(accentHex);
  const glassFacade = new THREE.MeshPhysicalMaterial({
    color: 0x88aacc,
    metalness: 0.85,
    roughness: 0.08,
    transparent: true,
    opacity: 0.7,
    transmission: 0.25,
    ior: 1.5,
  });
  const structural = new THREE.MeshStandardMaterial({ color: 0x2a3a4a, metalness: 0.7, roughness: 0.2 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.85, roughness: 0.12 });
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, metalness: 0.5, roughness: 0.4 });
  
  const floorHeight = 0.38 * scale;
  const towerWidth = 1.1 * scale;
  const towerDepth = 0.95 * scale;
  
  // Main tower
  const tower = new THREE.Mesh(new THREE.BoxGeometry(towerWidth, floors * floorHeight, towerDepth), structural);
  tower.position.y = floors * floorHeight / 2;
  tower.castShadow = true;
  g.add(tower);
  
  // Glass panels per floor
  for (let i = 0; i < floors; i++) {
    const yPos = i * floorHeight + floorHeight / 2;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(towerWidth - 0.1, floorHeight - 0.06, 0.05), glassFacade);
    panel.position.set(0, yPos, towerDepth / 2 + 0.02);
    panel.castShadow = true;
    g.add(panel);
  }
  
  // Floor dividers (horizontal accents)
  for (let i = 0; i <= floors; i++) {
    const divider = new THREE.Mesh(new THREE.BoxGeometry(towerWidth + 0.05, 0.04, towerDepth + 0.05), accentMat);
    divider.position.y = i * floorHeight;
    g.add(divider);
  }
  
  // Base / Lobby
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(1.4 * scale, 0.3 * scale, 1.2 * scale), groundMat);
  lobby.position.y = -0.15 * scale;
  g.add(lobby);
  
  // Glass lobby entrance
  const entrance = new THREE.Mesh(new THREE.BoxGeometry(0.6 * scale, 0.22 * scale, 0.05), glassFacade);
  entrance.position.set(0, 0.05 * scale, 0.65 * scale);
  g.add(entrance);
  
  // Crown / architectural top
  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.85 * scale, 0.15 * scale, 0.7 * scale), accentMat);
  crown.position.y = floors * floorHeight + 0.08;
  g.add(crown);
  
  // Spire
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.06 * scale, 0.6 * scale, 8), accentMat);
  spire.position.y = floors * floorHeight + 0.45;
  g.add(spire);
  
  // Beacon light
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.05 * scale, 12), lightMat(accentHex, 0.9));
  beacon.position.y = floors * floorHeight + 0.78;
  g.add(beacon);
  
  return g;
}

function makeRealEstateSkyline(accentHex) {
  const g = new THREE.Group();
  
  // Central hero tower
  const mainTower = makePremiumTower(accentHex, 14, 1.0);
  mainTower.position.set(0, -2.2, 0);
  g.add(mainTower);
  
  // Left high-rise
  const leftTower = makePremiumTower(accentHex, 10, 0.82);
  leftTower.position.set(-2.4, -2.2, -0.5);
  g.add(leftTower);
  
  // Right tower
  const rightTower = makePremiumTower(accentHex, 8, 0.72);
  rightTower.position.set(2.5, -2.2, -0.6);
  g.add(rightTower);
  
  // Far left
  const farLeft = makePremiumTower(accentHex, 6, 0.62);
  farLeft.position.set(-3.8, -2.2, -1.0);
  g.add(farLeft);
  
  // Far right
  const farRight = makePremiumTower(accentHex, 7, 0.68);
  farRight.position.set(3.7, -2.2, -0.9);
  g.add(farRight);
  
  // Small mid-rise
  const midRise = makePremiumTower(accentHex, 5, 0.55);
  midRise.position.set(-1.0, -2.2, 0.5);
  g.add(midRise);
  
  const small = makePremiumTower(accentHex, 4, 0.48);
  small.position.set(1.5, -2.2, 0.3);
  g.add(small);
  
  return g;
}

/* ══════════════════════════════════════════════════
   EQUIPMENT - ENHANCED MODELS
══════════════════════════════════════════════════ */

function makePremiumExcavator(accentHex) {
  const g = new THREE.Group();
  const yellow = premiumPaint(accentHex, 0.82, 0.35);
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.4, roughness: 0.65 });
  const chrome = chromeMat();
  const glass = glassMat(0x88ccff, 0.55);
  
  // Track frames
  [-0.75, 0.75].forEach(z => {
    const trackFrame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.32, 0.55), dark);
    trackFrame.position.set(0, -0.65, z);
    trackFrame.castShadow = true;
    g.add(trackFrame);
    
    // Track rollers
    [-1.1, -0.55, 0, 0.55, 1.1].forEach(x => {
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.55, 16), chrome);
      roller.rotation.x = Math.PI / 2;
      roller.position.set(x, -0.65, z);
      g.add(roller);
    });
  });
  
  // Undercarriage
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.24, 1.4), dark);
  chassis.position.set(0, -0.44, 0);
  g.add(chassis);
  
  // Slew ring
  const slewRing = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.12, 32), dark);
  slewRing.position.set(0, -0.28, 0);
  g.add(slewRing);
  
  // Upper structure
  const upper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.32, 1.55), yellow);
  upper.position.set(0, -0.12, 0);
  g.add(upper);
  
  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.78, 1.45), yellow);
  cabin.position.set(0.15, 0.32, 0);
  g.add(cabin);
  
  // Cabin glass
  const cabinFront = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 1.35), glass);
  cabinFront.position.set(0.82, 0.32, 0);
  g.add(cabinFront);
  
  const cabinSide = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.58, 0.05), glass);
  cabinSide.position.set(0.15, 0.32, 0.76);
  g.add(cabinSide);
  
  // Cabin roof
  const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 1.4), yellow);
  cabRoof.position.set(0.15, 0.75, 0);
  g.add(cabRoof);
  
  // Counterweight
  const cw = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.45, 1.35), dark);
  cw.position.set(-0.8, 0.08, 0);
  g.add(cw);
  
  // Boom
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.7, 0.22), yellow);
  boom.position.set(0.85, 0.85, 0);
  boom.rotation.z = 0.38;
  g.add(boom);
  
  // Stick
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.2), yellow);
  stick.position.set(1.25, 1.65, 0);
  stick.rotation.z = -0.25;
  g.add(stick);
  
  // Bucket
  const bucket = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.68), dark);
  bucket.position.set(1.55, 0.85, 0);
  g.add(bucket);
  
  // Bucket teeth
  [-0.18, 0, 0.18].forEach(z => {
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.08), chrome);
    tooth.position.set(1.82, 0.78, z);
    g.add(tooth);
  });
  
  // Hydraulic cylinders
  const hyd1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 12), chrome);
  hyd1.rotation.z = 0.55;
  hyd1.position.set(0.8, 0.72, 0.12);
  g.add(hyd1);
  
  const hyd2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 12), chrome);
  hyd2.rotation.z = -0.35;
  hyd2.position.set(1.15, 1.35, 0.12);
  g.add(hyd2);
  
  // Exhaust
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.48, 12), dark);
  exhaust.position.set(-0.45, 0.78, -0.68);
  g.add(exhaust);
  
  // Headlight
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16), lightMat(0xffaa66, 0.55));
  light.position.set(1.45, 0.25, 0.98);
  g.add(light);
  
  return g;
}

function makePremiumCrane(accentHex) {
  const g = new THREE.Group();
  const yellow = premiumPaint(accentHex, 0.78, 0.42);
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.45, roughness: 0.6 });
  const chrome = chromeMat();
  
  // Mast sections
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.32, 7.2, 0.32), yellow);
  mast.position.set(0, 1.1, 0);
  g.add(mast);
  
  // Cross bracing
  for (let i = 0; i < 7; i++) {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.32), dark);
    brace.position.set(0, -1.8 + i * 1.2, 0);
    brace.rotation.y = Math.PI / 4;
    g.add(brace);
  }
  
  // Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.6), dark);
  base.position.set(0, -2.2, 0);
  g.add(base);
  
  // Slewing unit
  const slew = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.25, 24), dark);
  slew.position.set(0, 4.0, 0);
  g.add(slew);
  
  // Operator cab
  const opCab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.9), yellow);
  opCab.position.set(0.4, 4.25, 0);
  g.add(opCab);
  
  // Jib (horizontal boom)
  const jib = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 0.32), yellow);
  jib.position.set(1.8, 4.7, 0);
  g.add(jib);
  
  // Counter-jib
  const cjib = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.32), yellow);
  cjib.position.set(-0.8, 4.7, 0);
  g.add(cjib);
  
  // Counterweight
  const cwCrane = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 1.1), dark);
  cwCrane.position.set(-1.45, 4.55, 0);
  g.add(cwCrane);
  
  // Tower peak
  const peak = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.0, 12), yellow);
  peak.position.set(0, 5.25, 0);
  g.add(peak);
  
  // Trolley
  const trolley = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.28), dark);
  trolley.position.set(2.6, 4.55, 0);
  g.add(trolley);
  
  // Hoist cable
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.3, 6), chrome);
  cable.position.set(2.6, 3.9, 0);
  g.add(cable);
  
  // Hook
  const hookBlock = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.18), dark);
  hookBlock.position.set(2.6, 3.25, 0);
  g.add(hookBlock);
  
  // Warning light
  const warning = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12), lightMat(0xff2200, 0.85));
  warning.position.set(0, 5.85, 0);
  g.add(warning);
  
  return g;
}

/* ══════════════════════════════════════════════════
   SCENE ASSEMBLER
══════════════════════════════════════════════════ */
function assembleScene(sceneName, accentRGB) {
  const accent = new THREE.Color(...accentRGB);
  const accentHex = `#${accent.getHexString()}`;
  const objects = [];

  const addObj = (mesh, pos, rx = 0, ry = 0, rz = 0, ud = {}) => {
    mesh.position.set(...pos);
    mesh.rotation.set(rx, ry, rz);
    mesh.userData = { rotY: 0.005, rotX: 0.0008, floatAmp: 0.18, floatSpeed: 0.88, floatOffset: 0, ...ud };
    objects.push(mesh);
    return mesh;
  };

  if (sceneName === "cars") {
    addObj(makeLuxurySedan(accentHex), [0, 0.15, 0], 0, 0.25, 0, { rotY: 0.0045, floatAmp: 0.15, floatSpeed: 0.85, floatOffset: 0 });
    addObj(makePremiumSUV(accentHex), [-3.0, 0.05, 0.35], 0, 0.75, 0, { rotY: 0.005, floatAmp: 0.12, floatSpeed: 1.05, floatOffset: 1.2 });
    addObj(makeSportsCar(accentHex), [3.2, -0.05, -0.25], 0, -0.65, 0, { rotY: 0.006, floatAmp: 0.11, floatSpeed: 1.15, floatOffset: 2.4 });
  }

  if (sceneName === "realestate") {
    addObj(makeRealEstateSkyline(accentHex), [0, 0, 0], 0, 0.12, 0, { rotY: 0.0025, rotX: 0.0004, floatAmp: 0.08, floatSpeed: 0.55, floatOffset: 0 });
  }

  if (sceneName === "equipment") {
    addObj(makePremiumExcavator(accentHex), [-1.3, 0.25, 0], 0, 0.45, 0, { rotY: 0.0045, floatAmp: 0.12, floatSpeed: 0.8, floatOffset: 0 });
    addObj(makePremiumCrane(accentHex), [2.9, 0.5, -0.35], 0, -0.35, 0, { rotY: 0.0035, floatAmp: 0.08, floatSpeed: 0.68, floatOffset: 1.5 });
  }

  return objects;
}

/* ══════════════════════════════════════════════════
   ENHANCED THREE.JS SCENE
══════════════════════════════════════════════════ */
const ThreeScene = ({ slide, transitioning }) => {
  const mountRef = useRef(null);
  const rendRef = useRef(null);
  const camRef = useRef(null);
  const sceneRef = useRef(null);
  const ptRef = useRef(null);
  const frameRef = useRef(null);
  const clockRef = useRef({ startTime: performance.now(), getElapsedTime() { return (performance.now() - this.startTime) / 1000; } });
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetCam = useRef({ x: 0, y: 0.5 });
  const introRef = useRef({ active: true, t: 0 });
  const accentLightRef = useRef(null);
  const rimLightRef = useRef(null);
  const fillLightRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);
    rendRef.current = renderer;
    
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.5, 9.8);
    camRef.current = camera;
    
    const ro = new ResizeObserver(() => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);
    
    const onMouse = e => {
      const rect = mount.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: -((e.clientY - rect.top) / rect.height - 0.5) * 2
      };
    };
    mount.addEventListener('mousemove', onMouse);
    
    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      mount.removeEventListener('mousemove', onMouse);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const renderer = rendRef.current;
    const camera = camRef.current;
    if (!renderer || !camera) return;
    
    cancelAnimationFrame(frameRef.current);
    
    if (sceneRef.current) {
      sceneRef.current.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) [obj.material].flat().forEach(m => m.dispose());
      });
    }
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Ambient lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    
    // Fill ambient with color
    const ambientFill = new THREE.AmbientLight(new THREE.Color(...slide.accentRGB), 0.25);
    scene.add(ambientFill);
    
    // Key light (main directional)
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.5);
    keyLight.position.set(5, 9, 6);
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
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.85);
    fillLight.position.set(-4, 5, 3);
    scene.add(fillLight);
    fillLightRef.current = fillLight;
    
    // Rim/back light
    const rimLight = new THREE.PointLight(0xffaa77, 1.2);
    rimLight.position.set(-2, 2, -7);
    scene.add(rimLight);
    rimLightRef.current = rimLight;
    
    // Accent light (color-matched to slide)
    const accentLight = new THREE.PointLight(new THREE.Color(...slide.accentRGB), 4.5, 22);
    accentLight.position.set(-3, 3.5, 5.5);
    scene.add(accentLight);
    accentLightRef.current = accentLight;
    
    // Top down fill
    const topFill = new THREE.PointLight(0x88aaff, 0.6);
    topFill.position.set(0, 7, 0);
    scene.add(topFill);
    
    // Ground shadow catcher
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 18),
      new THREE.MeshStandardMaterial({ color: 0x0a0a1a, metalness: 0.85, roughness: 0.08, emissive: 0x0a0a1a, emissiveIntensity: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.4;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Reflective grid
    const gridFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 16, 32, 32),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(...slide.accentRGB), wireframe: true, transparent: true, opacity: 0.045 })
    );
    gridFloor.rotation.x = -Math.PI / 2;
    gridFloor.position.y = -2.38;
    scene.add(gridFloor);
    
    // Decorative data lines
    const dataLines = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const height = Math.random() * 1.5 + 0.3;
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, height, 0.008),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(...slide.accentRGB), transparent: true, opacity: 0.08 + Math.random() * 0.1 })
      );
      bar.position.set((Math.random() - 0.5) * 12, -2.35 + height / 2, (Math.random() - 0.5) * 7);
      dataLines.add(bar);
    }
    scene.add(dataLines);
    
    // Floating particles
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 22;
      particlePos[i * 3 + 1] = Math.random() * 8;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: new THREE.Color(...slide.accentRGB), size: 0.022, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    ptRef.current = particles;
    
    // Main 3D objects
    const objects = assembleScene(slide.scene, slide.accentRGB);
    objects.forEach(obj => {
      obj.castShadow = true;
      obj.receiveShadow = true;
      scene.add(obj);
    });
    
    // Decorative rings around hero object
    const rings = [];
    if (objects.length > 0) {
      const hero = objects[0];
      
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.012, 64, 128), new THREE.MeshBasicMaterial({ color: new THREE.Color(...slide.accentRGB), transparent: true, opacity: 0.35 }));
      ring1.rotation.x = 0.72;
      ring1.rotation.z = 0.18;
      ring1.position.copy(hero.position);
      scene.add(ring1);
      rings.push({ mesh: ring1, speed: 0.42, axis: 'y' });
      
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.008, 64, 160), new THREE.MeshBasicMaterial({ color: new THREE.Color(...slide.accentRGB), transparent: true, opacity: 0.22 }));
      ring2.rotation.x = 1.25;
      ring2.rotation.z = -0.45;
      ring2.position.copy(hero.position);
      scene.add(ring2);
      rings.push({ mesh: ring2, speed: -0.28, axis: 'x' });
      
      const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.006, 64, 180), new THREE.MeshBasicMaterial({ color: new THREE.Color(...slide.accentRGB), transparent: true, opacity: 0.15 }));
      ring3.rotation.x = 0.4;
      ring3.rotation.z = 0.85;
      ring3.position.copy(hero.position);
      scene.add(ring3);
      rings.push({ mesh: ring3, speed: 0.18, axis: 'z' });
      
      // Ghost outline
      const ghost = objects[0].clone();
      ghost.traverse(child => {
        if (child.isMesh) child.material = wireMat(slide.accent, 0.05);
      });
      ghost.scale.setScalar(1.28);
      ghost.position.copy(hero.position);
      scene.add(ghost);
      objects[0].userData._ghost = ghost;
    }
    
    // Store initial positions
    objects.forEach(obj => {
      obj.userData._baseX = obj.position.x;
      obj.userData._baseY = obj.position.y;
    });
    
    introRef.current = { active: true, t: 0 };
    camera.position.set(0, 3.8, 16);
    clockRef.current = { startTime: performance.now(), getElapsedTime() { return (performance.now() - this.startTime) / 1000; } };
    
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = clockRef.current.getElapsedTime();
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      
      // Intro animation
      if (introRef.current.active) {
        introRef.current.t = Math.min(introRef.current.t + 0.012, 1);
        const p = 1 - Math.pow(1 - introRef.current.t, 3.2);
        camera.position.z = 16 - p * 6.2;
        camera.position.y = 3.8 - p * 3.3;
        if (introRef.current.t >= 1) introRef.current.active = false;
      } else {
        targetCam.current.x += (mx * 0.7 - targetCam.current.x) * 0.038;
        targetCam.current.y += (0.5 + my * 0.4 - targetCam.current.y) * 0.038;
        camera.position.x += (targetCam.current.x - camera.position.x) * 0.038;
        camera.position.y += (targetCam.current.y - camera.position.y) * 0.038;
      }
      camera.lookAt(0, 0.2, 0);
      
      // Animate lights
      if (accentLightRef.current) accentLightRef.current.intensity = 4.2 + Math.sin(t * 1.4) * 1.0;
      if (rimLightRef.current) rimLightRef.current.intensity = 1.0 + Math.cos(t * 2.0) * 0.5;
      if (fillLightRef.current) fillLightRef.current.intensity = 0.7 + Math.sin(t * 1.1) * 0.15;
      
      // Animate objects
      objects.forEach(obj => {
        const { rotY = 0.005, rotX = 0.0008, floatAmp = 0.18, floatSpeed = 0.88, floatOffset = 0, _baseX = 0, _baseY = 0, _ghost } = obj.userData;
        obj.rotation.y += rotY + mx * 0.0005;
        obj.rotation.x += rotX + my * 0.00025;
        obj.position.y = _baseY + Math.sin(t * floatSpeed + floatOffset) * floatAmp;
        obj.position.x = _baseX + Math.sin(t * floatSpeed * 0.35 + floatOffset) * floatAmp * 0.06;
        if (_ghost) {
          _ghost.position.copy(obj.position);
          _ghost.rotation.copy(obj.rotation);
          _ghost.rotation.y += t * 0.1;
        }
      });
      
      // Animate rings
      if (objects.length > 0) {
        const hero = objects[0];
        rings.forEach(({ mesh, speed, axis }) => {
          mesh.position.copy(hero.position);
          if (axis === 'y') mesh.rotation.y += speed * 0.008;
          else if (axis === 'x') mesh.rotation.x += speed * 0.008;
          else mesh.rotation.z += speed * 0.008;
        });
      }
      
      // Animate particles
      if (ptRef.current) {
        ptRef.current.rotation.y = t * 0.01;
        ptRef.current.rotation.x = Math.sin(t * 0.05) * 0.03;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => cancelAnimationFrame(frameRef.current);
  }, [slide]);
  
  return (
    <div ref={mountRef} style={{ position: 'absolute', inset: 0, opacity: transitioning ? 0 : 1, transition: 'opacity 0.5s ease' }} />
  );
};

/* ══════════════════════════════════════════════════
   LIVE CLOCK (unchanged)
══════════════════════════════════════════════════ */
const LiveClock = ({ accent }) => {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => { const iv = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(iv); }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div style={{ position: 'absolute', top: 22, left: 26, zIndex: 40, fontFamily: "'Overpass Mono',monospace", fontSize: '8px', letterSpacing: '0.4em', textTransform: 'uppercase', color: accent, opacity: 0.65, transition: 'color 0.8s' }}>
      {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   SVG DECORATIONS (unchanged)
══════════════════════════════════════════════════ */
const SVGCornerTL = ({ accent }) => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.4, pointerEvents: 'none', zIndex: 30 }}>
    <path d="M0 56 L0 0 L56 0" stroke={accent} strokeWidth="0.8" fill="none" />
    <circle cx="0" cy="0" r="3.5" fill={accent} opacity="0.8" />
    <path d="M12 0 L12 12 L0 12" stroke={accent} strokeWidth="0.4" fill="none" opacity="0.5" />
  </svg>
);

const SVGCornerBR = ({ accent }) => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.4, pointerEvents: 'none', zIndex: 30 }}>
    <path d="M56 0 L56 56 L0 56" stroke={accent} strokeWidth="0.8" fill="none" />
    <circle cx="56" cy="56" r="3.5" fill={accent} opacity="0.8" />
    <path d="M44 56 L44 44 L56 44" stroke={accent} strokeWidth="0.4" fill="none" opacity="0.5" />
  </svg>
);

const SVGCornerTR = ({ accent }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.25, pointerEvents: 'none', zIndex: 30 }}>
    <path d="M0 0 L40 0 L40 40" stroke={accent} strokeWidth="0.8" fill="none" />
  </svg>
);

const SVGCornerBL = ({ accent }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.25, pointerEvents: 'none', zIndex: 30 }}>
    <path d="M40 40 L0 40 L0 0" stroke={accent} strokeWidth="0.8" fill="none" />
  </svg>
);

const SVGReticle = ({ accent }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none"
    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.08, pointerEvents: 'none', zIndex: 30, animation: 'reticleSpin 20s linear infinite' }}>
    <circle cx="30" cy="30" r="28" stroke={accent} strokeWidth="0.6" strokeDasharray="4 6" />
    <circle cx="30" cy="30" r="20" stroke={accent} strokeWidth="0.4" />
    <line x1="30" y1="0" x2="30" y2="10" stroke={accent} strokeWidth="0.8" />
    <line x1="30" y1="50" x2="30" y2="60" stroke={accent} strokeWidth="0.8" />
    <line x1="0" y1="30" x2="10" y2="30" stroke={accent} strokeWidth="0.8" />
    <line x1="50" y1="30" x2="60" y2="30" stroke={accent} strokeWidth="0.8" />
  </svg>
);

const SVGStamp = ({ accent }) => (
  <svg width="72" height="72" viewBox="0 0 80 80" fill="none"
    style={{ position: 'absolute', bottom: 56, right: 28, opacity: 0.14, transform: 'rotate(-18deg)', pointerEvents: 'none', zIndex: 30 }}>
    <circle cx="40" cy="40" r="36" stroke={accent} strokeWidth="0.8" />
    <circle cx="40" cy="40" r="29" stroke={accent} strokeWidth="0.4" strokeDasharray="2 3" />
    <text x="40" y="34" textAnchor="middle" fill={accent} fontSize="5.5" fontFamily="'Overpass Mono',monospace" letterSpacing="2">EMMALEX</text>
    <text x="40" y="43" textAnchor="middle" fill={accent} fontSize="4.5" fontFamily="'Overpass Mono',monospace" letterSpacing="1.5">AUTOS</text>
    <text x="40" y="52" textAnchor="middle" fill={accent} fontSize="3.8" fontFamily="'Overpass Mono',monospace" letterSpacing="1.2">LAGOS · NG</text>
  </svg>
);

const SVGWaveform = ({ accent }) => {
  const pts = Array.from({ length: 40 }, (_, i) => ({ x: (i / 39) * 100, y: 50 + Math.sin(i * 0.58) * 14 + Math.sin(i * 1.3) * 6 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  return (
    <svg width="130" height="28" viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', opacity: 0.22, pointerEvents: 'none', zIndex: 30 }}>
      <path d={d} stroke={accent} strokeWidth="1.8" fill="none" />
    </svg>
  );
};

const SVGScanBeam = ({ accent, y }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: `${y}%`, height: '80px', background: `linear-gradient(to bottom, transparent 0%, ${accent}08 40%, ${accent}10 50%, ${accent}08 60%, transparent 100%)` }} />
  </div>
);

/* ══════════════════════════════════════════════════
   STYLES (unchanged)
══════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Overpass+Mono:wght@300;400;600&family=DM+Serif+Display:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes reticleSpin { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.75)} }
  @keyframes fadeUp { to{opacity:1;transform:translateY(0)} }
  @keyframes scanMove { from{background-position:0 -200px} to{background-position:0 100vh} }

  .hero-root { font-family:'Overpass Mono',monospace; background:#000; }

  .hero-section {
    width:100%; height:100dvh; min-height:680px;
    display:grid; grid-template-columns:52% 48%;
    background:#000; overflow:hidden; position:relative;
  }
  @media(max-width:1100px){ .hero-section{ grid-template-columns:50% 50% } }
  @media(max-width:768px){ .hero-section{ display:flex; flex-direction:column-reverse; height:auto; min-height:100dvh } }

  .left-panel {
    position:relative; display:flex; flex-direction:column;
    justify-content:center; padding:0 5vw 0 4vw; z-index:20; background:#000;
  }
  @media(max-width:768px){ .left-panel{ padding:48px 7vw 96px; height:auto; width:100% } }

  .cat-ticker {
    position:absolute; left:0; top:0; bottom:0; width:28px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    border-right:1px solid rgba(255,255,255,0.04); gap:30px; z-index:10;
  }
  @media(max-width:768px){ .cat-ticker{ display:none } }
  .cat-tick-item {
    writing-mode:vertical-rl; transform:rotate(180deg);
    font-size:7px; letter-spacing:0.5em; text-transform:uppercase;
    cursor:pointer; transition:color 0.4s, letter-spacing 0.3s;
  }
  .cat-tick-item:hover{ letter-spacing:0.62em }

  .hero-content{ padding-left:36px }

  .hero-meta { display:flex; align-items:center; gap:20px; margin-bottom:clamp(22px,4vh,38px) }
  .hero-index { font-size:9px; letter-spacing:0.4em; color:rgba(255,255,255,0.18); display:flex; align-items:center; gap:12px }
  .hero-index-line { height:1px; transition:background 0.8s }
  .hero-edition { font-size:7px; letter-spacing:0.5em; text-transform:uppercase; color:rgba(255,255,255,0.14); padding:4px 10px; border:1px solid rgba(255,255,255,0.06) }

  .hero-badge {
    display:inline-flex; align-items:center; gap:9px;
    margin-bottom:18px; padding:5px 14px;
    border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.015);
    font-size:7.5px; letter-spacing:0.45em; text-transform:uppercase;
    color:rgba(255,255,255,0.22); width:fit-content; transition:border-color 0.8s;
  }
  .hero-badge-dot{ width:5px; height:5px; border-radius:50%; flex-shrink:0; animation:pulse 2s ease-in-out infinite }

  .hero-eyebrow { font-size:9px; letter-spacing:0.6em; text-transform:uppercase; margin-bottom:14px; transition:color 0.8s }

  .hero-headline {
    font-family:'DM Serif Display',serif; font-weight:400;
    line-height:1.04; letter-spacing:-0.02em; color:#fff; margin-bottom:16px;
    font-size:clamp(34px,4.2vw,78px); transition:opacity 0.45s, transform 0.45s;
  }
  @media(max-width:768px){ .hero-headline{ font-size:clamp(28px,9vw,44px) } }
  .hero-headline em{ font-family:'DM Serif Display',serif; font-style:italic; color:rgba(255,255,255,0.36) }

  .hero-tagline {
    font-family:'Cormorant Garamond',serif; font-style:italic;
    font-size:clamp(13px,1.3vw,18px); color:rgba(255,255,255,0.28);
    margin-bottom:18px; letter-spacing:0.01em; transition:opacity 0.45s;
  }

  .hero-stat {
    display:flex; align-items:center; gap:12px; margin-bottom:clamp(20px,3.5vh,34px);
    font-size:8px; letter-spacing:0.3em; text-transform:uppercase;
    color:rgba(255,255,255,0.18); transition:opacity 0.45s;
  }
  .hero-stat-line{ height:1px; width:24px; flex-shrink:0; transition:background 0.8s }

  .hero-sub {
    font-size:10px; line-height:2; color:rgba(255,255,255,0.2);
    max-width:400px; margin-bottom:clamp(26px,4vh,42px);
    letter-spacing:0.04em; transition:opacity 0.45s;
  }

  .cta-row{ display:flex; gap:12px; flex-wrap:wrap; align-items:center }

  .btn-fill {
    padding:16px 42px; font-family:'Overpass Mono',monospace;
    font-size:8.5px; letter-spacing:0.4em; text-transform:uppercase;
    text-decoration:none; border:none; cursor:pointer;
    color:#000; font-weight:600; display:inline-block;
    position:relative; overflow:hidden;
    transition:transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s;
  }
  .btn-fill:hover{ transform:translateY(-2px); box-shadow:0 14px 40px rgba(0,0,0,0.55) }

  .btn-ghost {
    padding:15px 24px; font-family:'Overpass Mono',monospace;
    font-size:8.5px; letter-spacing:0.4em; text-transform:uppercase;
    text-decoration:none; background:transparent; cursor:pointer;
    color:rgba(255,255,255,0.28); display:inline-flex; align-items:center; gap:10px;
    border:none; transition:color 0.3s;
  }
  .btn-ghost:hover{ color:#fff }
  .btn-ghost-line{ height:1px; width:22px; background:currentColor; transition:width 0.35s cubic-bezier(0.16,1,0.3,1); flex-shrink:0 }
  .btn-ghost:hover .btn-ghost-line{ width:38px }

  .hero-dots{ position:absolute; bottom:44px; left:5vw; display:flex; gap:10px; align-items:center }
  @media(max-width:768px){ .hero-dots{ bottom:32px; left:7vw } }
  .hero-dot{ height:1px; cursor:pointer; transition:all 0.6s cubic-bezier(0.4,0,0.2,1) }

  .hero-progress{ position:absolute; bottom:0; left:0; right:0; height:1px; background:rgba(255,255,255,0.04) }
  .hero-progress-fill{ height:100%; transition:width 6.5s linear, background 0.8s ease }

  .kb-hint {
    position:absolute; bottom:46px; right:5vw;
    font-size:7px; letter-spacing:0.4em; text-transform:uppercase;
    color:rgba(255,255,255,0.07); display:flex; align-items:center; gap:8px;
  }
  @media(max-width:768px){ .kb-hint{ display:none } }
  .kb-key {
    display:inline-flex; align-items:center; justify-content:center;
    width:18px; height:18px; border:1px solid rgba(255,255,255,0.07);
    font-size:9px; color:rgba(255,255,255,0.12);
  }

  .right-panel {
    position:relative; overflow:hidden;
    border-left:1px solid rgba(255,255,255,0.04); background:#000;
  }
  @media(max-width:768px){
    .right-panel{ height:48vh; min-height:320px; width:100%; border-left:none; border-bottom:1px solid rgba(255,255,255,0.04) }
  }

  .grid-lines {
    position:absolute; inset:0; z-index:1; pointer-events:none;
    background-image:
      linear-gradient(rgba(255,255,255,0.007) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.007) 1px, transparent 1px);
    background-size:55px 55px;
  }
  .scan-line {
    position:absolute; inset:0; pointer-events:none; z-index:3;
    background:linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%);
    background-size:100% 220px; animation:scanMove 9s linear infinite;
  }
  .right-hud{ position:absolute; inset:0; z-index:40; pointer-events:none }
  .hud-label { position:absolute; bottom:28px; right:28px; font-size:8px; letter-spacing:0.6em; text-transform:uppercase; transition:color 0.8s, opacity 0.45s }
  .hud-badge {
    position:absolute; top:20px; right:20px;
    font-size:7px; letter-spacing:0.45em; text-transform:uppercase;
    padding:5px 12px; border:1px solid rgba(255,255,255,0.05);
    background:rgba(0,0,0,0.8); backdrop-filter:blur(12px);
    transition:color 0.8s, border-color 0.8s;
    display:flex; align-items:center; gap:8px;
  }
  .hud-badge-dot{ width:4px; height:4px; border-radius:50%; animation:pulse 2s ease-in-out infinite }
  .hud-stat { position:absolute; bottom:52px; left:24px; font-size:7px; letter-spacing:0.35em; text-transform:uppercase; color:rgba(255,255,255,0.15); display:flex; flex-direction:column; gap:5px }
  .hud-stat-val { font-size:13px; letter-spacing:-0.01em; font-weight:600; transition:color 0.8s; font-family:'DM Serif Display',serif }
  .hud-crossh { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:100%; height:100%; pointer-events:none; z-index:6 }
  .hud-crossh::before,.hud-crossh::after { content:''; position:absolute; background:rgba(255,255,255,0.025) }
  .hud-crossh::before{ left:50%; top:0; width:1px; height:100% }
  .hud-crossh::after{ top:50%; left:0; height:1px; width:100% }

  .fi{ opacity:0; transform:translateY(22px); animation:fadeUp 0.9s ease forwards }
  .fd1{animation-delay:.06s} .fd2{animation-delay:.14s} .fd3{animation-delay:.22s}
  .fd4{animation-delay:.3s}  .fd5{animation-delay:.38s} .fd6{animation-delay:.46s}
`;

/* ══════════════════════════════════════════════════
   HERO EXPORT
══════════════════════════════════════════════════ */
const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanY, setScanY] = useState(20);
  const progRef = useRef(null);

  const goTo = useCallback((index) => {
    if (index === current || transitioning) return;
    setTransitioning(true);
    setProgress(0);
    setTimeout(() => { setCurrent(index); setTransitioning(false); }, 500);
  }, [current, transitioning]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);

  useEffect(() => {
    setProgress(0);
    const iv = setInterval(next, 6500);
    const start = performance.now();
    const anim = now => {
      const pct = Math.min(((now - start) / 6500) * 100, 100);
      setProgress(pct);
      if (pct < 100) progRef.current = requestAnimationFrame(anim);
    };
    progRef.current = requestAnimationFrame(anim);
    return () => { clearInterval(iv); cancelAnimationFrame(progRef.current); };
  }, [current, next]);

  useEffect(() => {
    let raf;
    let y = 20;
    const tick = () => { y = (y + 0.1) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo((current - 1 + slides.length) % slides.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, next, goTo]);

  const slide = slides[current];
  const fade = (d = 0) => ({
    opacity: transitioning ? 0 : 1,
    transform: `translateY(${transitioning ? 14 : 0}px)`,
    transition: `opacity 0.45s ease ${d}s, transform 0.45s ease ${d}s`,
  });

  const statNum = slide.stat.split(' ')[0];

  return (
    <>
      <style>{STYLES}</style>
      <div className="hero-root">
        <section className="hero-section" id="home">

          {/* LEFT PANEL */}
          <div className="left-panel">
            <div className="cat-ticker">
              {slides.map((s, i) => (
                <div key={s.category} className="cat-tick-item"
                  style={{ color: i === current ? s.accent : 'rgba(255,255,255,0.12)' }}
                  onClick={() => goTo(i)}>
                  {s.category}
                </div>
              ))}
            </div>

            <div className="hero-content">
              <div className="hero-meta fi fd1">
                <div className="hero-index">
                  <div className="hero-index-line" style={{ width: 28, background: slide.accent, transition: 'background 0.8s' }} />
                  <span>0{current + 1} / 0{slides.length}</span>
                </div>
                <div className="hero-edition">Lagos · Abuja · PH</div>
              </div>

              <div className="hero-badge fi fd2" style={{ borderColor: `${slide.accent}28` }}>
                <div className="hero-badge-dot" style={{ background: slide.accent, transition: 'background 0.8s' }} />
                {slide.count}+ {slide.label}
              </div>

              <div className="hero-eyebrow fi fd2" style={{ color: slide.accent, ...fade(0.04) }}>
                {slide.category} · Emmalex Autos & Logistics
              </div>

              <h1 className="hero-headline fi fd3" style={fade(0.08)}>
                Cars, Real Estate<br />&amp; <em>Equipment Leasing.</em>
              </h1>

              <p className="hero-tagline fi fd4" style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.45s ease 0.1s' }}>
                {slide.tagline}
              </p>

              <div className="hero-stat fi fd4" style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.45s ease 0.12s' }}>
                <div className="hero-stat-line" style={{ background: slide.accent, transition: 'background 0.8s' }} />
                {slide.stat}
              </div>

              <p className="hero-sub fi fd5" style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.45s ease 0.14s' }}>
                Premium vehicles, prime real estate listings, and construction equipment — all under one roof. Serving Lagos, Abuja, Port Harcourt.
              </p>

              <div className="cta-row fi fd6">
                <a href="#cars">
                  <button className="btn-fill" style={{ background: slide.accent, transition: 'background 0.8s' }}>
                    Explore Now
                  </button>
                </a>
                <a href="#contact">
                  <button className="btn-ghost">
                    Get in Touch
                    <span className="btn-ghost-line" />
                  </button>
                </a>
              </div>
            </div>

            <div className="hero-dots">
              {slides.map((_, i) => (
                <div key={i} className="hero-dot" style={{
                  width: i === current ? '48px' : '12px',
                  background: i === current ? slide.accent : 'rgba(255,255,255,0.1)',
                }} onClick={() => goTo(i)} />
              ))}
            </div>

            <div className="kb-hint">
              <span className="kb-key">←</span>
              <span className="kb-key">→</span>
              Navigate
            </div>

            <div className="hero-progress">
              <div className="hero-progress-fill" style={{ width: `${progress}%`, background: slide.accent }} />
            </div>
          </div>

          {/* RIGHT PANEL — ENHANCED 3D */}
          <div className="right-panel">
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: slide.bg, transition: 'background 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
            <div className="grid-lines" />
            <div className="scan-line" />
            <SVGScanBeam accent={slide.accent} y={scanY} />
            <div className="hud-crossh" />
            <SVGCornerTL accent={slide.accent} />
            <SVGCornerBR accent={slide.accent} />
            <SVGCornerTR accent={slide.accent} />
            <SVGCornerBL accent={slide.accent} />
            <SVGReticle accent={slide.accent} />
            <SVGStamp accent={slide.accent} />

            <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
              <ThreeScene slide={slide} transitioning={transitioning} />
            </div>

            <div className="right-hud">
              <LiveClock accent={slide.accent} />
              <div className="hud-badge" style={{ color: slide.accent, borderColor: `${slide.accent}22` }}>
                <div className="hud-badge-dot" style={{ background: slide.accent }} />
                Live 3D Preview
              </div>
              <div className="hud-stat" style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.45s' }}>
                <span className="hud-stat-val" style={{ color: slide.accent }}>{statNum}</span>
                <span>{slide.label}</span>
              </div>
              <div className="hud-label" style={{ color: slide.accent, opacity: transitioning ? 0 : 1, transition: 'color 0.8s,opacity 0.45s' }}>
                {slide.label}
              </div>
            </div>

            <SVGWaveform accent={slide.accent} />
          </div>

        </section>
      </div>
    </>
  );
};

export default Hero;