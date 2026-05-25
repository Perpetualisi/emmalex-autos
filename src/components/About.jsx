import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

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

const glowMat = (color, intensity = 2.0) =>
  new THREE.MeshStandardMaterial({ color: new THREE.Color(color), emissive: new THREE.Color(color), emissiveIntensity: intensity });

const wireMat = (color, opacity = 0.08) =>
  new THREE.MeshBasicMaterial({ color: new THREE.Color(color), wireframe: true, transparent: true, opacity });

function makeParticles(color, count = 350) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 22;
    pos[i*3+1] = (Math.random() - 0.5) * 14;
    pos[i*3+2] = (Math.random() - 0.5) * 12 - 2;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: new THREE.Color(color), size: 0.022, transparent: true, opacity: 0.45,
    blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }));
}

function makeGround() {
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 18),
    new THREE.MeshStandardMaterial({ color: 0x0a0a1a, metalness: 0.85, roughness: 0.08, emissive: 0x0a0a1a, emissiveIntensity: 0.05 })
  );
  g.rotation.x = -Math.PI / 2;
  g.position.y = -2.4;
  g.receiveShadow = true;
  return g;
}

function makeGrid(color) {
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 15, 32, 32),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color), wireframe: true, transparent: true, opacity: 0.045 })
  );
  g.rotation.x = -Math.PI / 2;
  g.position.y = -2.38;
  return g;
}

function makeRing(color, radius, tube, tiltX, tiltZ) {
  const r = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 64, 128),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.35 })
  );
  r.rotation.x = tiltX;
  r.rotation.z = tiltZ;
  return r;
}

/* ══════════════════════════════════════════════════
   ENHANCED 3D MODELS
══════════════════════════════════════════════════ */

/* ─── PREMIUM TROPHY / AWARD ─── */
function makeTrophy() {
  const g = new THREE.Group();
  const gold = premiumPaint(0xc6a84b, 0.96, 0.06);
  const darkGold = premiumPaint(0x8a6f28, 0.92, 0.12);
  const chrome = chromeMat();
  const glow = glowMat(0xc6a84b, 1.8);

  // Base platform
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.92, 0.12, 48), darkGold);
  base1.position.y = -1.65;
  base1.castShadow = true;
  g.add(base1);
  
  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.82, 0.1, 48), darkGold);
  base2.position.y = -1.48;
  base2.castShadow = true;
  g.add(base2);
  
  // Engraved plate on base
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.85), gold);
  plate.position.y = -1.55;
  g.add(plate);
  
  // Stem
  const stemLower = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 0.48, 32), gold);
  stemLower.position.y = -1.12;
  stemLower.castShadow = true;
  g.add(stemLower);
  
  const stemKnot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 24), gold);
  stemKnot.scale.set(1, 0.6, 1);
  stemKnot.position.y = -0.78;
  stemKnot.castShadow = true;
  g.add(stemKnot);
  
  const stemUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 0.45, 32), gold);
  stemUpper.position.y = -0.44;
  stemUpper.castShadow = true;
  g.add(stemUpper);
  
  // Cup body (elegant goblet)
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.16, 1.25, 64), gold);
  cup.position.y = 0.42;
  cup.castShadow = true;
  g.add(cup);
  
  // Cup rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.05, 16, 96), gold);
  rim.position.y = 1.05;
  rim.castShadow = true;
  g.add(rim);
  
  // Cup interior
  const interior = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.22, 1.05, 48), darkGold);
  interior.position.y = 0.52;
  interior.castShadow = true;
  g.add(interior);
  
  // Handles
  [-1, 1].forEach(s => {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.06, 16, 48, Math.PI), gold);
    handle.position.set(s * 1.05, 0.52, 0);
    handle.rotation.z = s * Math.PI / 2;
    handle.rotation.y = Math.PI / 2;
    handle.castShadow = true;
    g.add(handle);
    
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16), gold);
    knob.position.set(s * 1.05, 0.88, 0);
    g.add(knob);
    
    const knobBottom = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16), gold);
    knobBottom.position.set(s * 1.05, 0.16, 0);
    g.add(knobBottom);
  });
  
  // Decorative bands
  const band1 = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.012, 12, 96), chrome);
  band1.position.y = 0.18;
  g.add(band1);
  
  const band2 = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.012, 12, 96), chrome);
  band2.position.y = 0.72;
  g.add(band2);
  
  // Top star
  const starGeo = new THREE.OctahedronGeometry(0.26);
  const star = new THREE.Mesh(starGeo, glow);
  star.position.y = 1.32;
  star.rotation.y = Math.PI / 4;
  star.castShadow = true;
  g.add(star);
  
  // Glow ring around star
  const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.015, 16, 64), 
    new THREE.MeshBasicMaterial({ color: 0xc6a84b, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending }));
  glowRing.position.y = 1.32;
  g.add(glowRing);
  
  // Laser-engraved text effect on base
  const textRing = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.008, 8, 128), chrome);
  textRing.position.y = -1.55;
  g.add(textRing);
  
  // Ghost wireframe (floating)
  const ghost = g.clone();
  ghost.scale.setScalar(1.32);
  ghost.traverse(c => { if (c.isMesh) c.material = wireMat(0xc6a84b, 0.07); });
  g.add(ghost);
  
  return g;
}

/* ─── PREMIUM SHIELD / CREST ─── */
function makeShield() {
  const g = new THREE.Group();
  const blue = premiumPaint(0x1a3a6a, 0.88, 0.15);
  const gold = premiumPaint(0xc6a84b, 0.96, 0.06);
  const chrome = chromeMat();
  const glow = glowMat(0x5599ff, 2.0);
  
  // Shield shape using extrusion
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 1.45);
  shieldShape.lineTo(0.85, 1.45);
  shieldShape.bezierCurveTo(1.05, 1.0, 1.02, 0.3, 0.85, -0.35);
  shieldShape.bezierCurveTo(0.68, -0.95, 0.38, -1.18, 0, -1.42);
  shieldShape.lineTo(-0.85, 1.45);
  shieldShape.bezierCurveTo(-1.05, 1.0, -1.02, 0.3, -0.85, -0.35);
  shieldShape.bezierCurveTo(-0.68, -0.95, -0.38, -1.18, 0, -1.42);
  
  const extrudeSettings = { depth: 0.28, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 8 };
  const shieldBody = new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape, extrudeSettings), blue);
  shieldBody.position.z = -0.14;
  shieldBody.castShadow = true;
  g.add(shieldBody);
  
  // Gold border
  const border = new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape, { depth: 0.06, bevelEnabled: false }), gold);
  border.position.z = -0.16;
  border.scale.setScalar(1.05);
  border.castShadow = true;
  g.add(border);
  
  // Central gem/emblem
  const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 1), glow);
  emblem.position.set(0, 0.12, 0.18);
  emblem.rotation.y = Math.PI / 4;
  g.add(emblem);
  
  // Checkmark (victory symbol)
  const tickBar1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 }));
  tickBar1.position.set(-0.18, -0.12, 0.18);
  tickBar1.rotation.z = 0.55;
  g.add(tickBar1);
  
  const tickBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.68, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 }));
  tickBar2.position.set(0.14, -0.02, 0.18);
  tickBar2.rotation.z = -0.48;
  g.add(tickBar2);
  
  // Top crown bar
  const crownBar = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.16, 0.32), gold);
  crownBar.position.set(0, 1.45, 0.02);
  crownBar.castShadow = true;
  g.add(crownBar);
  
  // Decorative rivets
  [-0.65, 0, 0.65].forEach(x => {
    const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12), chrome);
    rivet.position.set(x, 1.45, 0.2);
    g.add(rivet);
  });
  
  // Bottom point cap
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 12), gold);
  tip.position.set(0, -1.55, 0.02);
  g.add(tip);
  
  // Side ornaments
  [-0.85, 0.85].forEach(s => {
    const ornament = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12), gold);
    ornament.position.set(s * 1.08, -0.45, 0.12);
    g.add(ornament);
  });
  
  // Ghost
  const ghost = g.clone();
  ghost.scale.setScalar(1.3);
  ghost.traverse(c => { if (c.isMesh) c.material = wireMat(0x5599ff, 0.07); });
  g.add(ghost);
  
  return g;
}

/* ─── PREMIUM STAR / COMPASS ─── */
function makeStar() {
  const g = new THREE.Group();
  const gold = premiumPaint(0xc6a84b, 0.96, 0.06);
  const darkGold = premiumPaint(0x8a6f28, 0.88, 0.12);
  const glow = glowMat(0xf5c518, 2.2);
  
  // Outer ornate ring
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.065, 24, 96), gold);
  outerRing.castShadow = true;
  g.add(outerRing);
  
  // Inner ring
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.045, 20, 80), darkGold);
  innerRing.castShadow = true;
  g.add(innerRing);
  
  // 8-point compass star
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const isMajor = i % 2 === 0;
    const height = isMajor ? 0.82 : 0.52;
    const width = isMajor ? 0.16 : 0.1;
    const point = new THREE.Mesh(new THREE.ConeGeometry(width, height, 6), isMajor ? gold : darkGold);
    point.position.set(Math.sin(angle) * (isMajor ? 0.88 : 0.72), Math.cos(angle) * (isMajor ? 0.88 : 0.72), 0);
    point.rotation.z = -angle;
    point.castShadow = true;
    g.add(point);
  }
  
  // Central disc
  const centerDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 48), premiumPaint(0x111111, 0.85, 0.1));
  centerDisc.rotation.x = Math.PI / 2;
  g.add(centerDisc);
  
  // Glowing core
  const coreOrb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 24), glow);
  coreOrb.castShadow = true;
  g.add(coreOrb);
  
  // Detail rings
  const detailRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.008, 12, 72), chromeMat());
  g.add(detailRing1);
  
  const detailRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.006, 12, 96), chromeMat());
  g.add(detailRing2);
  
  // Tick marks on outer ring
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    const isMajorTick = i % 6 === 0;
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.018, isMajorTick ? 0.14 : 0.08, 0.025), 
      new THREE.MeshBasicMaterial({ color: 0xc6a84b, transparent: true, opacity: 0.55 }));
    tick.position.set(Math.sin(angle) * 1.14, Math.cos(angle) * 1.14, 0);
    tick.rotation.z = -angle;
    g.add(tick);
  }
  
  // Diamond frame behind
  const diamondShape = new THREE.Shape();
  diamondShape.moveTo(0, 1.55);
  diamondShape.lineTo(1.12, 0);
  diamondShape.lineTo(0, -1.55);
  diamondShape.lineTo(-1.12, 0);
  diamondShape.closePath();
  
  const diamondFrame = new THREE.Mesh(new THREE.ExtrudeGeometry(diamondShape, { depth: 0.05, bevelEnabled: false }),
    new THREE.MeshBasicMaterial({ color: 0xc6a84b, wireframe: true, transparent: true, opacity: 0.1 }));
  diamondFrame.position.z = -0.08;
  g.add(diamondFrame);
  
  // Ghost
  const ghost = g.clone();
  ghost.scale.setScalar(1.32);
  ghost.traverse(c => { if (c.isMesh) c.material = wireMat(0xf5c518, 0.07); });
  g.add(ghost);
  
  return g;
}

/* ══════════════════════════════════════════════════
   ENHANCED MINI 3D CANVAS
══════════════════════════════════════════════════ */
function MiniScene({ buildFn, accentHex, camZ = 5.5 }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const frameRef = useRef(null);
  const ringsRef = useRef([]);
  const particlesRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.3, camZ);

    // Enhanced lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    
    const ambientFill = new THREE.AmbientLight(new THREE.Color(accentHex), 0.25);
    scene.add(ambientFill);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 3.0);
    keyLight.position.set(5, 9, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.85);
    fillLight.position.set(-5, 4, 4);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(new THREE.Color(accentHex), 5.0, 22);
    accentLight.position.set(-2.5, 3.5, 5);
    scene.add(accentLight);

    const rimLight = new THREE.PointLight(new THREE.Color(accentHex), 2.5, 16);
    rimLight.position.set(3, -2, -4);
    scene.add(rimLight);

    const backLight = new THREE.PointLight(0xffffff, 0.6);
    backLight.position.set(0, 1, -6);
    scene.add(backLight);

    // Ground and grid
    scene.add(makeGround());
    scene.add(makeGrid(accentHex));

    // Particles
    const particles = makeParticles(accentHex, 280);
    scene.add(particles);
    particlesRef.current = particles;

    // Decorative rings
    const rings = [
      makeRing(accentHex, 1.95, 0.01, 0.72, 0.2),
      makeRing(accentHex, 2.6, 0.007, 1.2, -0.4),
      makeRing(accentHex, 3.25, 0.005, 0.4, 0.85),
    ];
    rings.forEach(r => scene.add(r));
    ringsRef.current = rings;

    // Main model
    const model = buildFn();
    model.castShadow = true;
    model.receiveShadow = true;
    scene.add(model);
    modelRef.current = model;

    // Animation state
    const mouse = { x: 0, y: 0 };
    let camX = 0, camY = 0.3;
    let accentIntensity = 5.0;
    let time = 0;

    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    mount.addEventListener("mousemove", onMouseMove);

    const resizeObserver = new ResizeObserver(() => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(mount);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.016;

      // Camera follow mouse
      camX += (mouse.x * 0.55 - camX) * 0.045;
      camY += (0.3 + mouse.y * 0.3 - camY) * 0.045;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.lookAt(0, 0, 0);

      // Model animation
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.0045 + mouse.x * 0.001;
        modelRef.current.rotation.x += 0.0008 + mouse.y * 0.0005;
        modelRef.current.position.y = Math.sin(time * 0.8) * 0.1;
      }

      // Animate lights
      accentLight.intensity = 4.8 + Math.sin(time * 1.6) * 1.2;
      rimLight.intensity = 2.2 + Math.cos(time * 2.2) * 0.6;

      // Animate rings
      if (ringsRef.current.length) {
        ringsRef.current[0].rotation.y += 0.0055;
        ringsRef.current[0].rotation.x += 0.0025;
        ringsRef.current[1].rotation.y -= 0.004;
        ringsRef.current[1].rotation.z += 0.002;
        ringsRef.current[2].rotation.x += 0.002;
        ringsRef.current[2].rotation.z += 0.003;
        
        ringsRef.current.forEach(ring => {
          if (modelRef.current) ring.position.copy(modelRef.current.position);
        });
      }

      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.012;
        particlesRef.current.rotation.x = Math.sin(time * 0.06) * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      mount.removeEventListener("mousemove", onMouseMove);
      
      if (sceneRef.current) {
        sceneRef.current.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) [obj.material].flat().forEach(m => m.dispose());
        });
      }
      if (rendererRef.current) rendererRef.current.dispose();
      if (mount.contains(rendererRef.current?.domElement)) mount.removeChild(rendererRef.current.domElement);
    };
  }, [buildFn, accentHex, camZ]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />;
}

/* ══════════════════════════════════════════════════
   SVG DECORATIONS
══════════════════════════════════════════════════ */
const CornerTL = ({ accent }) => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ position: "absolute", top: 0, left: 0, opacity: 0.4, pointerEvents: "none", zIndex: 10 }}>
    <path d="M0 52 L0 0 L52 0" stroke={accent} strokeWidth="0.9" fill="none"/>
    <circle cx="0" cy="0" r="3.5" fill={accent} opacity="0.85"/>
    <path d="M12 0 L12 12 L0 12" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.4"/>
  </svg>
);

const CornerBR = ({ accent }) => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.4, pointerEvents: "none", zIndex: 10 }}>
    <path d="M52 0 L52 52 L0 52" stroke={accent} strokeWidth="0.9" fill="none"/>
    <circle cx="52" cy="52" r="3.5" fill={accent} opacity="0.85"/>
    <path d="M40 52 L40 40 L52 40" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.4"/>
  </svg>
);

const Reticle = ({ accent }) => (
  <svg width="56" height="56" viewBox="0 0 60 60" fill="none"
    style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.07, pointerEvents: "none", zIndex: 10, animation: "aboutReticle 20s linear infinite" }}>
    <circle cx="30" cy="30" r="28" stroke={accent} strokeWidth="0.6" strokeDasharray="4 6"/>
    <circle cx="30" cy="30" r="20" stroke={accent} strokeWidth="0.4"/>
    <line x1="30" y1="0" x2="30" y2="10" stroke={accent} strokeWidth="0.8"/>
    <line x1="30" y1="50" x2="30" y2="60" stroke={accent} strokeWidth="0.8"/>
    <line x1="0" y1="30" x2="10" y2="30" stroke={accent} strokeWidth="0.8"/>
    <line x1="50" y1="30" x2="60" y2="30" stroke={accent} strokeWidth="0.8"/>
  </svg>
);

/* ══════════════════════════════════════════════════
   STAT COUNTER
══════════════════════════════════════════════════ */
function StatCounter({ target, suffix = "", label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: "clamp(36px,5vw,58px)",
        fontWeight: 400, color: "#C6A84B",
        lineHeight: 1, letterSpacing: "-0.02em",
      }}>
        {count}{suffix}
      </div>
      <div style={{
        fontFamily: "'Overpass Mono', monospace",
        fontSize: 9, fontWeight: 600,
        letterSpacing: "0.45em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.3)", marginTop: 8,
      }}>
        {label}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   VALUE CARD
══════════════════════════════════════════════════ */
function ValueCard({ icon, title, text, accent, delay }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      background: "rgba(0,0,0,0.92)",
      border: `1px solid rgba(255,255,255,0.06)`,
      padding: "32px 28px",
      position: "relative", overflow: "hidden",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div style={{ position: "absolute", top: 8, left: 8, width: 12, height: 12, borderTop: `1px solid ${accent}`, borderLeft: `1px solid ${accent}`, opacity: 0.5 }} />
      <div style={{ position: "absolute", bottom: 8, right: 8, width: 12, height: 12, borderBottom: `1px solid ${accent}`, borderRight: `1px solid ${accent}`, opacity: 0.5 }} />

      <div style={{ fontSize: 34, marginBottom: 18 }}>{icon}</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(18px,2vw,22px)", fontWeight: 400, color: "#fff", marginBottom: 12, letterSpacing: "-0.01em" }}>
        {title}
      </div>
      <div style={{ fontFamily: "'Overpass Mono', monospace", fontSize: 10.5, fontWeight: 300, lineHeight: 1.9, color: "rgba(255,255,255,0.32)", letterSpacing: "0.04em" }}>
        {text}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN ABOUT COMPONENT
══════════════════════════════════════════════════ */
export default function About() {
  const [scanY, setScanY] = useState(20);

  useEffect(() => {
    let y = 20, raf;
    const tick = () => { y = (y + 0.08) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section id="about" style={{
      background: "#000",
      position: "relative", overflow: "hidden",
      fontFamily: "'Overpass Mono', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Overpass+Mono:wght@300;400;600&display=swap');
        @keyframes aboutReticle { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes aboutFadeUp { to{opacity:1;transform:translateY(0)} }
        @keyframes aboutScanMove { from{background-position:0 -200px} to{background-position:0 100%} }

        #about::before {
          content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image: linear-gradient(rgba(255,255,255,0.007) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.007) 1px, transparent 1px);
          background-size:55px 55px;
        }

        .about-scan {
          position:absolute; inset:0; pointer-events:none; z-index:1;
          background:linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%);
          background-size:100% 220px;
          animation:aboutScanMove 9s linear infinite;
        }

        .about-beam {
          position:absolute; left:0; right:0; pointer-events:none; z-index:2;
          height:70px;
          background:linear-gradient(to bottom,transparent,rgba(198,168,75,0.05),transparent);
        }

        .about-intro {
          display:grid;
          grid-template-columns:1fr 1fr;
          min-height:100vh;
          align-items:center;
          position:relative; z-index:4;
          max-width:1380px; margin:0 auto;
          padding:100px 7% 80px;
          gap:60px;
          background:#000;
        }
        @media(max-width:860px){
          .about-intro{
            grid-template-columns:1fr!important;
            padding:88px 5% 52px!important;
            min-height:auto!important;
            gap:0!important;
          }
          .about-canvas-wrap{ height:56vw!important; min-height:260px!important; max-height:380px!important; order:-1!important; margin-bottom:36px; }
          .about-text{ padding:0!important; }
        }

        .about-canvas-wrap {
          position:relative;
          height:560px;
          border:1px solid rgba(255,255,255,0.04);
          overflow:hidden;
          box-shadow:0 20px 40px rgba(0,0,0,0.5);
        }

        .about-canvas-wrap::before {
          content:''; position:absolute; inset:0; z-index:5; pointer-events:none;
          background: linear-gradient(180deg, #000 0%, transparent 15%, transparent 85%, #000 100%), linear-gradient(90deg, #000 0%, transparent 12%, transparent 88%, #000 100%);
        }

        .canvas-hud-badge {
          position:absolute; top:18px; right:18px; z-index:8;
          font-size:7px; letter-spacing:0.45em; text-transform:uppercase;
          padding:6px 14px;
          border:1px solid rgba(255,255,255,0.05);
          background:rgba(0,0,0,0.85);
          backdrop-filter:blur(12px);
          display:flex; align-items:center; gap:8px;
          border-radius:2px;
        }
        .canvas-hud-dot {
          width:5px; height:5px; border-radius:50%;
          animation:aboutPulse 2s ease-in-out infinite;
        }
        @keyframes aboutPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}

        .canvas-hud-label {
          position:absolute; bottom:22px; left:22px; z-index:8;
          font-size:8px; letter-spacing:0.5em; text-transform:uppercase;
        }

        .about-text { display:flex; flex-direction:column; gap:0; }

        .about-eyebrow {
          display:flex; align-items:flex-start; gap:10px;
          margin-bottom:20px; flex-wrap:wrap;
        }
        .about-eyebrow-bar { width:24px; height:2px; background:#C6A84B; border-radius:2px; flex-shrink:0; margin-top:6px; }
        .about-eyebrow-txt {
          font-size:8px; font-weight:700; letter-spacing:0.5em;
          text-transform:uppercase; color:#C6A84B; line-height:1.6;
          word-break:break-word;
        }
        @media(max-width:480px){ .about-eyebrow-txt{ font-size:7px; letter-spacing:0.35em; } }

        .about-index {
          font-size:9px; letter-spacing:0.35em;
          color:rgba(255,255,255,0.18);
          margin-bottom:16px;
          display:flex; align-items:center; gap:10px;
        }
        .about-index-line { width:20px; height:1px; background:rgba(198,168,75,0.3); }

        .about-headline {
          font-family:'DM Serif Display',serif;
          font-size:clamp(38px,5.5vw,72px);
          font-weight:400; line-height:1.0;
          letter-spacing:-0.02em; color:#fff;
          margin-bottom:6px;
        }
        .about-headline em { font-style:italic; color:#C6A84B; }

        .about-gold-rule {
          width:52px; height:2px; border-radius:2px;
          background:linear-gradient(90deg,#C6A84B,transparent);
          margin:22px 0;
        }

        .about-body {
          font-size:10.5px; font-weight:300;
          line-height:2.0; color:rgba(255,255,255,0.32);
          letter-spacing:0.04em; max-width:440px;
          margin-bottom:18px;
        }
        @media(max-width:860px){ .about-body{ max-width:100%!important; font-size:11px; } }

        .about-tagline {
          font-family:'DM Serif Display',serif;
          font-style:italic; font-size:16px;
          color:rgba(255,255,255,0.18);
          margin-bottom:36px;
          border-left:2px solid #C6A84B;
          padding-left:16px;
        }

        .about-cta {
          font-size:8.5px; font-weight:600;
          letter-spacing:0.42em; text-transform:uppercase;
          color:#000; background:#C6A84B; border:none;
          padding:14px 30px; cursor:pointer;
          text-decoration:none; display:inline-block;
          transition:all 0.3s;
        }
        .about-cta:hover { filter:brightness(1.18); transform:translateY(-2px); box-shadow:0 8px 28px rgba(198,168,75,0.3); }

        .about-cta-ghost {
          font-size:8.5px; font-weight:600;
          letter-spacing:0.42em; text-transform:uppercase;
          color:rgba(255,255,255,0.28); background:transparent;
          border:none; padding:14px 0;
          cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:10px;
          transition:color 0.3s;
        }
        .about-cta-ghost:hover{ color:#fff; }
        .about-cta-row { display:flex; gap:16px; flex-wrap:wrap; align-items:center; }
        @media(max-width:400px){ .about-cta-row{ flex-direction:column; align-items:stretch; } .about-cta{ text-align:center; } }

        .founder-inner {
          display:grid;
          grid-template-columns:auto 1fr;
          gap:40px;
          align-items:start;
        }
        @media(max-width:520px){ .founder-inner{ grid-template-columns:1fr!important; gap:20px!important; } }

        .stats-band {
          position:relative; z-index:4;
          border-top:1px solid rgba(255,255,255,0.04);
          border-bottom:1px solid rgba(255,255,255,0.04);
          background:rgba(0,0,0,0.95);
          backdrop-filter:blur(8px);
        }
        .stats-band-inner {
          max-width:1380px; margin:0 auto;
          padding:52px 7%;
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:1px;
        }
        @media(max-width:680px){
          .stats-band-inner{ grid-template-columns:repeat(2,1fr)!important; padding:36px 5%!important; gap:28px!important; }
        }
        @media(max-width:400px){
          .stats-band-inner{ grid-template-columns:1fr 1fr!important; gap:20px!important; padding:28px 5%!important; }
        }

        .stat-divider { width:1px; background:rgba(255,255,255,0.04); align-self:stretch; }

        .story-section {
          max-width:1380px; margin:0 auto;
          padding:72px 5%;
          position:relative; z-index:4;
          background:#000;
        }
        @media(max-width:860px){ .story-section{ padding:52px 5%!important; } }

        .story-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:80px;
          align-items:center;
          margin-top:56px;
        }
        @media(max-width:860px){
          .story-grid{ grid-template-columns:1fr!important; gap:36px!important; margin-top:36px!important; }
        }

        .story-canvas-pair {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:20px;
        }
        .story-mini-canvas {
          position:relative;
          height:260px;
          border:1px solid rgba(255,255,255,0.04);
          overflow:hidden;
          box-shadow:0 10px 20px rgba(0,0,0,0.3);
        }
        .story-mini-canvas::before {
          content:''; position:absolute; inset:0; z-index:5; pointer-events:none;
          background:linear-gradient(180deg,#000 0%,transparent 20%,transparent 80%,#000 100%);
        }
        @media(max-width:480px){
          .story-canvas-pair{ grid-template-columns:1fr!important; gap:16px!important; }
          .story-mini-canvas{ height:56vw!important; min-height:200px!important; }
        }

        .values-section {
          max-width:1380px; margin:0 auto;
          padding:0 5% 72px;
          position:relative; z-index:4;
          background:#000;
        }
        .values-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:1px;
          background:rgba(255,255,255,0.04);
          margin-top:52px;
        }
        @media(max-width:860px){
          .values-grid{ grid-template-columns:1fr!important; }
          .values-section{ padding:0 5% 52px!important; }
        }

        .section-hdr { margin-bottom:0; }
        .section-hdr-eyebrow {
          display:flex; align-items:center; gap:10px; margin-bottom:14px;
        }
        .section-hdr-bar { width:22px; height:2px; background:#C6A84B; border-radius:2px; }
        .section-hdr-txt {
          font-size:9px; font-weight:700; letter-spacing:0.6em;
          text-transform:uppercase; color:#C6A84B;
        }
        .section-hdr-title {
          font-family:'DM Serif Display',serif;
          font-size:clamp(28px,3.5vw,44px);
          font-weight:400; color:#fff;
          letter-spacing:-0.01em; line-height:1.1;
        }
        .section-hdr-title em { font-style:italic; color:rgba(255,255,255,0.28); }

        .team-section {
          max-width:1380px; margin:0 auto;
          padding:0 5% 72px;
          position:relative; z-index:4;
          background:#000;
        }
        @media(max-width:860px){ .team-section{ padding:0 5% 52px!important; } }
        .team-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:20px;
          margin-top:52px;
        }
        @media(max-width:860px){ .team-grid{ grid-template-columns:1fr 1fr!important; } }
        @media(max-width:520px){ .team-grid{ grid-template-columns:1fr!important; } }

        .team-card {
          border:1px solid rgba(255,255,255,0.05);
          padding:28px 24px;
          position:relative;
          background:rgba(0,0,0,0.85);
          transition:border-color 0.3s, transform 0.3s;
          cursor:default;
        }
        .team-card:hover { border-color:rgba(198,168,75,0.25); transform:translateY(-4px); }
        .team-card::before {
          content:''; position:absolute; top:0; left:0; right:0;
          height:1px;
          background:linear-gradient(90deg,transparent,#C6A84B,transparent);
          opacity:0; transition:opacity 0.3s;
        }
        .team-card:hover::before { opacity:1; }

        .team-avatar {
          width:64px; height:64px; border-radius:0;
          border:1px solid rgba(198,168,75,0.3);
          display:flex; align-items:center; justify-content:center;
          font-size:26px; margin-bottom:18px;
          background:rgba(198,168,75,0.05);
        }
        .team-name {
          font-family:'DM Serif Display',serif;
          font-size:18px; color:#fff; margin-bottom:4px;
        }
        .team-role {
          font-size:8px; font-weight:600;
          letter-spacing:0.45em; text-transform:uppercase;
          color:#C6A84B; margin-bottom:12px;
        }
        .team-bio {
          font-size:10px; font-weight:300;
          line-height:1.85; color:rgba(255,255,255,0.28);
          letter-spacing:0.03em;
        }

        .about-progress {
          position:absolute; bottom:0; left:0; right:0;
          height:1px; background:rgba(255,255,255,0.04); z-index:10;
        }
      `}</style>

      <div className="about-scan" />
      <div className="about-beam" style={{ top: `${scanY}%` }} />

      {/* SECTION 1 — INTRO */}
      <div className="about-intro">
        <div className="about-canvas-wrap">
          <CornerTL accent="#C6A84B" />
          <CornerBR accent="#C6A84B" />
          <Reticle accent="#C6A84B" />

          <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(198,168,75,0.04)" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(198,168,75,0.04)" }} />
          </div>

          <MiniScene buildFn={makeTrophy} accentHex="#C6A84B" camZ={5.2} />

          <div className="canvas-hud-badge" style={{ color: "#C6A84B", borderColor: "rgba(198,168,75,0.15)" }}>
            <div className="canvas-hud-dot" style={{ background: "#C6A84B" }} />
            Live 3D · Excellence
          </div>
          <div className="canvas-hud-label" style={{ color: "rgba(198,168,75,0.4)" }}>
            Est. 2022 · Lagos
          </div>
          <div style={{ position: "absolute", bottom: 24, right: 24, zIndex: 8, fontFamily: "'DM Serif Display',serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.22)" }}>
            Award of Excellence
          </div>
        </div>

        <div className="about-text">
          <div className="about-index fi">
            <div className="about-index-line" />
            <span>01 / About</span>
          </div>

          <div className="about-eyebrow">
            <div className="about-eyebrow-bar" />
            <div className="about-eyebrow-txt">Emmalex Autos & Logistics Services Ltd</div>
          </div>

          <h2 className="about-headline">
            Built on<br />
            <em>Trust &amp;</em><br />
            Excellence.
          </h2>

          <div className="about-gold-rule" />

          <p className="about-body">
            Founded in Lagos, Nigeria in 2022, Emmalex Autos & Logistics Services Ltd was built from the ground up by Emmanuel Ehiawaguan — a passionate entrepreneur with a clear vision: to deliver premium vehicles, prime real estate, and construction equipment leasing under one trusted roof.
          </p>

          <p className="about-body">
            In just 3 years, we have served individuals, corporations, and government agencies across Lagos, Abuja, and Port Harcourt — delivering verified quality, transparent pricing, and white-glove service on every single engagement.
          </p>

          <p className="about-tagline">
            "Where premium meets purpose."
          </p>

          <div className="about-cta-row">
            <a href="#cars" className="about-cta">Explore Our Services</a>
            <a href="#contact" className="about-cta-ghost">
              Contact Us
              <span className="about-cta-ghost-line" style={{ width: 22, height: 1, background: "currentColor", marginLeft: 8 }} />
            </a>
          </div>
        </div>
      </div>

      {/* SECTION 2 — STATS */}
      <div className="stats-band">
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#C6A84B,transparent)", opacity: 0.3 }} />
        <div className="stats-band-inner">
          <StatCounter target={200} suffix="+" label="Vehicles in Stock" />
          <StatCounter target={3} suffix="yr" label="Years in Business" />
          <StatCounter target={500} suffix="+" label="Happy Clients" />
          <StatCounter target={50} suffix="+" label="Equipment Fleet" />
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#C6A84B,transparent)", opacity: 0.3 }} />
      </div>

      {/* SECTION 3 — STORY + DUAL 3D */}
      <div className="story-section">
        <div className="section-hdr">
          <div className="section-hdr-eyebrow">
            <div className="section-hdr-bar" />
            <div className="section-hdr-txt">Our Story</div>
          </div>
          <h3 className="section-hdr-title">
            Integrity in <em>every transaction.</em>
          </h3>
        </div>

        <div className="story-grid">
          <div className="story-canvas-pair">
            <div className="story-mini-canvas">
              <CornerTL accent="#5599FF" />
              <MiniScene buildFn={makeShield} accentHex="#5599FF" camZ={5.0} />
              <div style={{ position: "absolute", bottom: 14, left: 14, zIndex: 8, fontFamily: "'Overpass Mono',monospace", fontSize: 7, letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(85,153,255,0.5)" }}>
                Trust &amp; Integrity
              </div>
            </div>
            <div className="story-mini-canvas">
              <CornerTL accent="#F5C518" />
              <MiniScene buildFn={makeStar} accentHex="#F5C518" camZ={5.0} />
              <div style={{ position: "absolute", bottom: 14, left: 14, zIndex: 8, fontFamily: "'Overpass Mono',monospace", fontSize: 7, letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(245,197,24,0.5)" }}>
                Vision &amp; Direction
              </div>
            </div>
          </div>

          <div>
            <p style={{ fontFamily: "'Overpass Mono',monospace", fontSize: 10.5, fontWeight: 300, lineHeight: 2.0, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", marginBottom: 24 }}>
              We started with a simple belief: that every Nigerian deserves access to quality vehicles, premium properties, and reliable industrial equipment — without compromise. Emmanuel Ehiawaguan built this company with his own hands, driven by that single conviction.
            </p>
            <p style={{ fontFamily: "'Overpass Mono',monospace", fontSize: 10.5, fontWeight: 300, lineHeight: 2.0, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", marginBottom: 36 }}>
              In just 3 years we have facilitated hundreds of successful transactions, built lasting relationships with top international manufacturers, and established Emmalex as a trusted name across Nigeria's business landscape.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 24, borderTop: "1px solid rgba(198,168,75,0.12)", paddingTop: 28 }}>
              {[
                { n: "100%", l: "Verified Imports" },
                { n: "24/7", l: "Client Support" },
                { n: "3", l: "Cities Covered" },
                { n: "₦0", l: "Hidden Charges" },
              ].map(s => (
                <div key={s.l}>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color: "#C6A84B", fontWeight: 400, lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontFamily: "'Overpass Mono',monospace", fontSize: 8, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 6 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4 — VALUES */}
      <div className="values-section">
        <div className="section-hdr">
          <div className="section-hdr-eyebrow">
            <div className="section-hdr-bar" />
            <div className="section-hdr-txt">Our Values</div>
          </div>
          <h3 className="section-hdr-title">
            What we <em>stand for.</em>
          </h3>
        </div>

        <div className="values-grid">
          <ValueCard accent="#C6A84B" delay={0} icon="🏆"
            title="Excellence"
            text="Every vehicle is inspected. Every property is vetted. Every piece of equipment is certified. We hold ourselves to the highest standard so you never have to question ours." />
          <ValueCard accent="#5599FF" delay={0.12} icon="🛡️"
            title="Integrity"
            text="Transparent pricing, honest documentation, and zero hidden charges. We believe trust is built one transaction at a time — and we've been building it for over a decade." />
          <ValueCard accent="#F5C518" delay={0.24} icon="🚀"
            title="Innovation"
            text="From digital inventory management to real-time fleet tracking, we continuously invest in technology to deliver faster, smarter service across all our business verticals." />
        </div>
      </div>

      {/* SECTION 5 — FOUNDER */}
      <div className="team-section">
        <div className="section-hdr">
          <div className="section-hdr-eyebrow">
            <div className="section-hdr-bar" />
            <div className="section-hdr-txt">Leadership</div>
          </div>
          <h3 className="section-hdr-title">
            The vision <em>behind it all.</em>
          </h3>
        </div>

        <div style={{
          marginTop: 52,
          border: "1px solid rgba(198,168,75,0.15)",
          padding: "clamp(24px,5vw,44px) clamp(20px,5vw,48px)",
          position: "relative",
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(12px)",
          animation: "aboutFadeUp 0.8s ease 0.1s forwards",
          opacity: 0,
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,#C6A84B,transparent)", opacity: 0.6 }} />
          <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: "1px solid rgba(198,168,75,0.5)", borderLeft: "1px solid rgba(198,168,75,0.5)" }} />
          <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: "1px solid rgba(198,168,75,0.5)", borderRight: "1px solid rgba(198,168,75,0.5)" }} />
          <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: "1px solid rgba(198,168,75,0.5)", borderLeft: "1px solid rgba(198,168,75,0.5)" }} />
          <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: "1px solid rgba(198,168,75,0.5)", borderRight: "1px solid rgba(198,168,75,0.5)" }} />

          <div className="founder-inner">
            <div style={{
              width: 88, height: 88,
              border: "1px solid rgba(198,168,75,0.4)",
              background: "rgba(198,168,75,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, flexShrink: 0,
            }}>
              👨‍💼
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Overpass Mono',monospace", fontSize: 8, fontWeight: 600, letterSpacing: "0.55em", textTransform: "uppercase", color: "rgba(198,168,75,0.5)", marginBottom: 4 }}>
                Founder &amp; CEO · Emmalex Autos
              </div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(22px,4vw,38px)", fontWeight: 400, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1 }}>
                Emmanuel
                <span style={{ fontStyle: "italic", color: "#C6A84B" }}> Ehiawaguan</span>
              </div>
              <div style={{ width: 48, height: 2, background: "linear-gradient(90deg,#C6A84B,transparent)", borderRadius: 2, margin: "10px 0" }} />
              <div style={{ fontFamily: "'Overpass Mono',monospace", fontSize: 10.5, fontWeight: 300, lineHeight: 1.9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
                Visionary entrepreneur and sole proprietor of Emmalex Autos & Logistics Services Ltd. Emmanuel founded the business in 2022 with a mission to bring world-class vehicles, real estate, and construction equipment leasing to Nigeria — built entirely on trust, quality, and personal service.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {["Automotive", "Real Estate", "Equipment Leasing", "Lagos"].map(tag => (
                  <div key={tag} style={{
                    fontFamily: "'Overpass Mono',monospace", fontSize: 7.5, fontWeight: 600,
                    letterSpacing: "0.35em", textTransform: "uppercase",
                    color: "rgba(198,168,75,0.7)", border: "1px solid rgba(198,168,75,0.2)",
                    padding: "4px 10px", background: "rgba(198,168,75,0.04)",
                  }}>
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, fontFamily: "'Overpass Mono',monospace", fontSize: 7, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.12)", textAlign: "right" }}>
            Est. 2022 · Lagos, Nigeria
          </div>
        </div>
      </div>

      <div className="about-progress">
        <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,#C6A84B,transparent)", opacity: 0.25 }} />
      </div>
    </section>
  );
}