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

function makeParticles(color, count = 250) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 20;
    pos[i*3+1] = (Math.random() - 0.5) * 12;
    pos[i*3+2] = (Math.random() - 0.5) * 10 - 2;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: new THREE.Color(color), size: 0.02, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }));
}

function makeGround() {
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 16),
    new THREE.MeshStandardMaterial({ color: 0x0a0a1a, metalness: 0.85, roughness: 0.08, emissive: 0x0a0a1a, emissiveIntensity: 0.05 })
  );
  g.rotation.x = -Math.PI / 2;
  g.position.y = -2.2;
  g.receiveShadow = true;
  return g;
}

function makeGrid(color) {
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 13, 28, 28),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color), wireframe: true, transparent: true, opacity: 0.04 })
  );
  g.rotation.x = -Math.PI / 2;
  g.position.y = -2.18;
  return g;
}

function makeRing(color, radius, tube, tiltX, tiltZ) {
  const r = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 56, 100),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.3 })
  );
  r.rotation.x = tiltX;
  r.rotation.z = tiltZ;
  return r;
}

/* ══════════════════════════════════════════════════
   ENHANCED 3D MODELS (SIMPLIFIED FOR PERFORMANCE)
══════════════════════════════════════════════════ */

function makeTrophy() {
  const g = new THREE.Group();
  const gold = premiumPaint(0xc6a84b, 0.96, 0.06);
  const darkGold = premiumPaint(0x8a6f28, 0.92, 0.12);
  const chrome = chromeMat();
  const glow = glowMat(0xc6a84b, 1.5);

  // Base platform
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.88, 0.1, 40), darkGold);
  base1.position.y = -1.6;
  base1.castShadow = true;
  g.add(base1);
  
  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.78, 0.08, 40), darkGold);
  base2.position.y = -1.45;
  base2.castShadow = true;
  g.add(base2);
  
  // Stem
  const stemLower = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.38, 0.42, 32), gold);
  stemLower.position.y = -1.1;
  stemLower.castShadow = true;
  g.add(stemLower);
  
  const stemKnot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 28, 20), gold);
  stemKnot.scale.set(1, 0.6, 1);
  stemKnot.position.y = -0.78;
  stemKnot.castShadow = true;
  g.add(stemKnot);
  
  const stemUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.4, 32), gold);
  stemUpper.position.y = -0.46;
  stemUpper.castShadow = true;
  g.add(stemUpper);
  
  // Cup body
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.15, 1.15, 56), gold);
  cup.position.y = 0.38;
  cup.castShadow = true;
  g.add(cup);
  
  // Cup rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.79, 0.045, 14, 80), gold);
  rim.position.y = 0.98;
  rim.castShadow = true;
  g.add(rim);
  
  // Handles
  [-1, 1].forEach(s => {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 14, 40, Math.PI), gold);
    handle.position.set(s * 0.98, 0.48, 0);
    handle.rotation.z = s * Math.PI / 2;
    handle.rotation.y = Math.PI / 2;
    handle.castShadow = true;
    g.add(handle);
  });
  
  // Top star
  const starGeo = new THREE.OctahedronGeometry(0.24);
  const star = new THREE.Mesh(starGeo, glow);
  star.position.y = 1.25;
  star.rotation.y = Math.PI / 4;
  star.castShadow = true;
  g.add(star);
  
  // Ghost wireframe
  const ghost = g.clone();
  ghost.scale.setScalar(1.28);
  ghost.traverse(c => { if (c.isMesh) c.material = wireMat(0xc6a84b, 0.06); });
  g.add(ghost);
  
  return g;
}

function makeShield() {
  const g = new THREE.Group();
  const blue = premiumPaint(0x1a3a6a, 0.88, 0.15);
  const gold = premiumPaint(0xc6a84b, 0.96, 0.06);
  const chrome = chromeMat();
  const glow = glowMat(0x5599ff, 1.6);
  
  // Shield shape - simplified
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 1.35);
  shieldShape.lineTo(0.78, 1.35);
  shieldShape.lineTo(0.78, 0.3);
  shieldShape.lineTo(0, -1.32);
  shieldShape.lineTo(-0.78, 0.3);
  shieldShape.lineTo(-0.78, 1.35);
  shieldShape.lineTo(0, 1.35);
  
  const extrudeSettings = { depth: 0.25, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 6 };
  const shieldBody = new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape, extrudeSettings), blue);
  shieldBody.position.z = -0.12;
  shieldBody.castShadow = true;
  g.add(shieldBody);
  
  // Central emblem
  const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), glow);
  emblem.position.set(0, 0.1, 0.16);
  emblem.rotation.y = Math.PI / 4;
  g.add(emblem);
  
  // Checkmark
  const tickBar1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.1), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 }));
  tickBar1.position.set(-0.16, -0.1, 0.16);
  tickBar1.rotation.z = 0.55;
  g.add(tickBar1);
  
  const tickBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.1), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 }));
  tickBar2.position.set(0.12, 0, 0.16);
  tickBar2.rotation.z = -0.48;
  g.add(tickBar2);
  
  // Ghost
  const ghost = g.clone();
  ghost.scale.setScalar(1.28);
  ghost.traverse(c => { if (c.isMesh) c.material = wireMat(0x5599ff, 0.06); });
  g.add(ghost);
  
  return g;
}

function makeStar() {
  const g = new THREE.Group();
  const gold = premiumPaint(0xc6a84b, 0.96, 0.06);
  const darkGold = premiumPaint(0x8a6f28, 0.88, 0.12);
  const glow = glowMat(0xf5c518, 1.8);
  
  // Outer ring
  const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.058, 20, 80), gold);
  outerRing.castShadow = true;
  g.add(outerRing);
  
  // Inner ring
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.04, 18, 70), darkGold);
  innerRing.castShadow = true;
  g.add(innerRing);
  
  // 8-point star
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const isMajor = i % 2 === 0;
    const height = isMajor ? 0.75 : 0.48;
    const width = isMajor ? 0.14 : 0.09;
    const point = new THREE.Mesh(new THREE.ConeGeometry(width, height, 6), isMajor ? gold : darkGold);
    point.position.set(Math.sin(angle) * (isMajor ? 0.82 : 0.68), Math.cos(angle) * (isMajor ? 0.82 : 0.68), 0);
    point.rotation.z = -angle;
    point.castShadow = true;
    g.add(point);
  }
  
  // Glowing core
  const coreOrb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 28, 22), glow);
  coreOrb.castShadow = true;
  g.add(coreOrb);
  
  // Ghost
  const ghost = g.clone();
  ghost.scale.setScalar(1.28);
  ghost.traverse(c => { if (c.isMesh) c.material = wireMat(0xf5c518, 0.06); });
  g.add(ghost);
  
  return g;
}

/* ══════════════════════════════════════════════════
   ENHANCED MINI 3D CANVAS (OPTIMIZED)
══════════════════════════════════════════════════ */
function MiniScene({ buildFn, accentHex, camZ = 5.2 }) {
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.3, camZ);

    // Simplified lighting for performance
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.5);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.7);
    fillLight.position.set(-4, 3, 3);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(new THREE.Color(accentHex), 4.0, 18);
    accentLight.position.set(-2, 3, 4);
    scene.add(accentLight);

    const rimLight = new THREE.PointLight(new THREE.Color(accentHex), 1.8, 14);
    rimLight.position.set(2, -1, -3.5);
    scene.add(rimLight);

    // Ground and grid
    scene.add(makeGround());
    scene.add(makeGrid(accentHex));

    // Particles
    const particles = makeParticles(accentHex, 180);
    scene.add(particles);
    particlesRef.current = particles;

    // Decorative rings
    const rings = [
      makeRing(accentHex, 1.85, 0.008, 0.72, 0.2),
      makeRing(accentHex, 2.45, 0.006, 1.2, -0.4),
    ];
    rings.forEach(r => scene.add(r));
    ringsRef.current = rings;

    // Main model
    const model = buildFn();
    model.castShadow = true;
    model.receiveShadow = true;
    scene.add(model);
    modelRef.current = model;

    let time = 0;
    let autoRotate = true;
    let targetY = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.016;

      if (autoRotate && modelRef.current) {
        modelRef.current.rotation.y += 0.003;
        targetY = Math.sin(time * 0.8) * 0.06;
        modelRef.current.position.y = targetY;
      }

      // Animate lights
      accentLight.intensity = 3.8 + Math.sin(time * 1.5) * 0.8;
      rimLight.intensity = 1.6 + Math.cos(time * 2) * 0.4;

      // Animate rings
      if (ringsRef.current.length) {
        ringsRef.current[0].rotation.y += 0.004;
        ringsRef.current[0].rotation.x += 0.002;
        ringsRef.current[1].rotation.y -= 0.003;
        ringsRef.current[1].rotation.z += 0.0015;
        
        ringsRef.current.forEach(ring => {
          if (modelRef.current) ring.position.copy(modelRef.current.position);
        });
      }

      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.01;
      }

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (rendererRef.current && camera) {
        rendererRef.current.setSize(mount.clientWidth, mount.clientHeight);
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      
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
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ position: "absolute", top: 0, left: 0, opacity: 0.35, pointerEvents: "none", zIndex: 10 }}>
    <path d="M0 40 L0 0 L40 0" stroke={accent} strokeWidth="0.8" fill="none"/>
    <circle cx="0" cy="0" r="2.5" fill={accent} opacity="0.8"/>
    <path d="M10 0 L10 10 L0 10" stroke={accent} strokeWidth="0.4" fill="none" opacity="0.3"/>
  </svg>
);

const CornerBR = ({ accent }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.35, pointerEvents: "none", zIndex: 10 }}>
    <path d="M40 0 L40 40 L0 40" stroke={accent} strokeWidth="0.8" fill="none"/>
    <circle cx="40" cy="40" r="2.5" fill={accent} opacity="0.8"/>
    <path d="M30 40 L30 30 L40 30" stroke={accent} strokeWidth="0.4" fill="none" opacity="0.3"/>
  </svg>
);

const Reticle = ({ accent }) => (
  <svg width="50" height="50" viewBox="0 0 50 50" fill="none"
    style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.06, pointerEvents: "none", zIndex: 10, animation: "aboutReticle 20s linear infinite" }}>
    <circle cx="25" cy="25" r="23" stroke={accent} strokeWidth="0.5" strokeDasharray="3 5"/>
    <circle cx="25" cy="25" r="16" stroke={accent} strokeWidth="0.3"/>
  </svg>
);

/* ══════════════════════════════════════════════════
   STAT COUNTER (MOBILE OPTIMIZED)
══════════════════════════════════════════════════ */
function StatCounter({ target, suffix = "", label, mobileLabel }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1500;
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

  const displayLabel = mobileLabel || label;

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: "clamp(28px, 6vw, 52px)",
        fontWeight: 400, color: "#C6A84B",
        lineHeight: 1, letterSpacing: "-0.02em",
      }}>
        {count}{suffix}
      </div>
      <div style={{
        fontFamily: "'Overpass Mono', monospace",
        fontSize: "clamp(7px, 2.5vw, 9px)",
        fontWeight: 600,
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.3)", marginTop: "6px",
      }}>
        {displayLabel}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   VALUE CARD (MOBILE RESPONSIVE)
══════════════════════════════════════════════════ */
function ValueCard({ icon, title, text, accent, delay, mobileText }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const displayText = mobileText || text;
  const isMobile = window.innerWidth <= 768;

  return (
    <div ref={ref} style={{
      background: "rgba(0,0,0,0.92)",
      border: `1px solid rgba(255,255,255,0.06)`,
      padding: isMobile ? "24px 20px" : "32px 28px",
      position: "relative", overflow: "hidden",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div style={{ position: "absolute", top: 6, left: 6, width: 10, height: 10, borderTop: `1px solid ${accent}`, borderLeft: `1px solid ${accent}`, opacity: 0.4 }} />

      <div style={{ fontSize: isMobile ? 28 : 34, marginBottom: isMobile ? 12 : 18 }}>{icon}</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(16px, 4vw, 20px)", fontWeight: 400, color: "#fff", marginBottom: 10, letterSpacing: "-0.01em" }}>
        {title}
      </div>
      <div style={{ fontFamily: "'Overpass Mono', monospace", fontSize: isMobile ? 9 : 10.5, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.32)", letterSpacing: "0.03em" }}>
        {displayText}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN ABOUT COMPONENT (MOBILE RESPONSIVE)
══════════════════════════════════════════════════ */
export default function About() {
  const [scanY, setScanY] = useState(20);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    let y = 20, raf;
    const tick = () => { y = (y + 0.08) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", checkMobile);
    };
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
          background-image: linear-gradient(rgba(255,255,255,0.006) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.006) 1px, transparent 1px);
          background-size:50px 50px;
        }

        .about-scan {
          position:absolute; inset:0; pointer-events:none; z-index:1;
          background:linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.008) 50%, transparent 100%);
          background-size:100% 200px;
          animation:aboutScanMove 9s linear infinite;
        }

        .about-beam {
          position:absolute; left:0; right:0; pointer-events:none; z-index:2;
          height:60px;
          background:linear-gradient(to bottom,transparent,rgba(198,168,75,0.04),transparent);
        }

        .about-intro {
          display:grid;
          grid-template-columns:1fr 1fr;
          min-height:90vh;
          align-items:center;
          position:relative; z-index:4;
          max-width:1400px; margin:0 auto;
          padding:80px 6% 60px;
          gap:50px;
          background:#000;
        }
        @media(max-width:860px){
          .about-intro{
            grid-template-columns:1fr!important;
            padding:60px 5% 40px!important;
            min-height:auto!important;
            gap:0!important;
          }
        }

        .about-canvas-wrap {
          position:relative;
          height:480px;
          border:1px solid rgba(255,255,255,0.04);
          overflow:hidden;
          box-shadow:0 15px 30px rgba(0,0,0,0.4);
        }
        @media(max-width:860px){
          .about-canvas-wrap{ height:52vw!important; min-height:260px!important; max-height:340px!important; order:-1!important; margin-bottom:30px; }
        }

        .about-canvas-wrap::before {
          content:''; position:absolute; inset:0; z-index:5; pointer-events:none;
          background: linear-gradient(180deg, #000 0%, transparent 15%, transparent 85%, #000 100%), linear-gradient(90deg, #000 0%, transparent 12%, transparent 88%, #000 100%);
        }

        .canvas-hud-badge {
          position:absolute; top:12px; right:12px; z-index:8;
          font-size:6px; letter-spacing:0.4em; text-transform:uppercase;
          padding:5px 10px;
          border:1px solid rgba(255,255,255,0.05);
          background:rgba(0,0,0,0.85);
          backdrop-filter:blur(10px);
          display:flex; align-items:center; gap:6px;
          border-radius:2px;
        }
        @media(max-width:480px){
          .canvas-hud-badge{ top:8px; right:8px; padding:4px 8px; font-size:5px; }
        }
        .canvas-hud-dot {
          width:4px; height:4px; border-radius:50%;
          animation:aboutPulse 2s ease-in-out infinite;
        }
        @keyframes aboutPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.7)}}

        .canvas-hud-label {
          position:absolute; bottom:16px; left:16px; z-index:8;
          font-size:7px; letter-spacing:0.45em; text-transform:uppercase;
        }
        @media(max-width:480px){
          .canvas-hud-label{ bottom:10px; left:10px; font-size:6px; letter-spacing:0.3em; }
        }

        .about-text { display:flex; flex-direction:column; gap:0; }

        .about-eyebrow {
          display:flex; align-items:flex-start; gap:8px;
          margin-bottom:16px; flex-wrap:wrap;
        }
        .about-eyebrow-bar { width:20px; height:2px; background:#C6A84B; border-radius:2px; flex-shrink:0; margin-top:5px; }
        .about-eyebrow-txt {
          font-size:clamp(6px, 2.5vw, 8px); font-weight:700; letter-spacing:0.45em;
          text-transform:uppercase; color:#C6A84B; line-height:1.5;
        }

        .about-index {
          font-size:8px; letter-spacing:0.3em;
          color:rgba(255,255,255,0.15);
          margin-bottom:14px;
          display:flex; align-items:center; gap:8px;
        }
        .about-index-line { width:16px; height:1px; background:rgba(198,168,75,0.3); }

        .about-headline {
          font-family:'DM Serif Display',serif;
          font-size:clamp(28px, 7vw, 62px);
          font-weight:400; line-height:1.05;
          letter-spacing:-0.02em; color:#fff;
          margin-bottom:4px;
        }
        .about-headline em { font-style:italic; color:#C6A84B; }

        .about-gold-rule {
          width:45px; height:2px; border-radius:2px;
          background:linear-gradient(90deg,#C6A84B,transparent);
          margin:18px 0;
        }

        .about-body {
          font-size:clamp(9px, 3vw, 10.5px); font-weight:300;
          line-height:1.8; color:rgba(255,255,255,0.32);
          letter-spacing:0.04em; max-width:460px;
          margin-bottom:14px;
        }
        @media(max-width:860px){ .about-body{ max-width:100%!important; } }

        .about-tagline {
          font-family:'DM Serif Display',serif;
          font-style:italic; font-size:clamp(13px, 4vw, 16px);
          color:rgba(255,255,255,0.15);
          margin-bottom:28px;
          border-left:2px solid #C6A84B;
          padding-left:14px;
        }

        .about-cta-row {
          display:flex; gap:12px; flex-wrap:wrap; align-items:center;
        }
        @media(max-width:480px){ .about-cta-row{ flex-direction:column; align-items:stretch; } }

        .about-cta {
          font-size:clamp(7px, 3vw, 8.5px); font-weight:600;
          letter-spacing:0.4em; text-transform:uppercase;
          color:#000; background:#C6A84B; border:none;
          padding:12px 24px; cursor:pointer;
          text-decoration:none; display:inline-block;
          text-align:center;
          transition:all 0.3s;
        }
        .about-cta:hover { filter:brightness(1.1); transform:translateY(-2px); }

        .about-cta-ghost {
          font-size:clamp(7px, 3vw, 8.5px); font-weight:600;
          letter-spacing:0.4em; text-transform:uppercase;
          color:rgba(255,255,255,0.35); background:transparent;
          border:none; padding:12px 0;
          cursor:pointer; text-decoration:none;
          display:inline-flex; align-items:center; gap:8px;
          text-align:center;
        }
        .about-cta-ghost:hover{ color:#fff; }

        .stats-band {
          position:relative; z-index:4;
          border-top:1px solid rgba(255,255,255,0.04);
          border-bottom:1px solid rgba(255,255,255,0.04);
          background:rgba(0,0,0,0.95);
        }
        .stats-band-inner {
          max-width:1400px; margin:0 auto;
          padding:40px 6%;
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:1px;
        }
        @media(max-width:680px){
          .stats-band-inner{ grid-template-columns:repeat(2,1fr)!important; padding:30px 5%!important; gap:24px!important; }
        }

        .story-section {
          max-width:1400px; margin:0 auto;
          padding:60px 6%;
          position:relative; z-index:4;
          background:#000;
        }
        @media(max-width:860px){ .story-section{ padding:40px 5%!important; } }

        .story-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:60px;
          align-items:center;
          margin-top:40px;
        }
        @media(max-width:860px){
          .story-grid{ grid-template-columns:1fr!important; gap:30px!important; margin-top:30px!important; }
        }

        .story-canvas-pair {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:16px;
        }
        .story-mini-canvas {
          position:relative;
          height:220px;
          border:1px solid rgba(255,255,255,0.04);
          overflow:hidden;
        }
        @media(max-width:860px){
          .story-mini-canvas{ height:200px; }
        }
        @media(max-width:480px){
          .story-canvas-pair{ grid-template-columns:1fr!important; gap:12px!important; }
          .story-mini-canvas{ height:55vw!important; min-height:180px!important; }
        }
        .story-mini-canvas::before {
          content:''; position:absolute; inset:0; z-index:5; pointer-events:none;
          background:linear-gradient(180deg,#000 0%,transparent 20%,transparent 80%,#000 100%);
        }

        .values-section {
          max-width:1400px; margin:0 auto;
          padding:0 6% 60px;
          position:relative; z-index:4;
          background:#000;
        }
        @media(max-width:860px){
          .values-section{ padding:0 5% 40px!important; }
        }
        .values-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:1px;
          background:rgba(255,255,255,0.04);
          margin-top:40px;
        }
        @media(max-width:860px){
          .values-grid{ grid-template-columns:1fr!important; }
        }

        .section-hdr { margin-bottom:0; }
        .section-hdr-eyebrow {
          display:flex; align-items:center; gap:8px; margin-bottom:12px;
        }
        .section-hdr-bar { width:20px; height:2px; background:#C6A84B; border-radius:2px; }
        .section-hdr-txt {
          font-size:clamp(7px, 2.5vw, 9px); font-weight:700; letter-spacing:0.5em;
          text-transform:uppercase; color:#C6A84B;
        }
        .section-hdr-title {
          font-family:'DM Serif Display',serif;
          font-size:clamp(22px, 5vw, 38px);
          font-weight:400; color:#fff;
          letter-spacing:-0.01em; line-height:1.1;
        }
        .section-hdr-title em { font-style:italic; color:rgba(255,255,255,0.2); }

        .team-section {
          max-width:1400px; margin:0 auto;
          padding:0 6% 60px;
          position:relative; z-index:4;
          background:#000;
        }
        @media(max-width:860px){ .team-section{ padding:0 5% 40px!important; } }
        .team-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:16px;
          margin-top:40px;
        }
        @media(max-width:860px){ .team-grid{ grid-template-columns:1fr 1fr!important; } }
        @media(max-width:520px){ .team-grid{ grid-template-columns:1fr!important; } }

        .team-card {
          border:1px solid rgba(255,255,255,0.05);
          padding:24px 20px;
          position:relative;
          background:rgba(0,0,0,0.85);
          transition:border-color 0.3s;
        }
        .team-card:hover { border-color:rgba(198,168,75,0.25); }

        .team-avatar {
          width:52px; height:52px; border-radius:0;
          border:1px solid rgba(198,168,75,0.3);
          display:flex; align-items:center; justify-content:center;
          font-size:22px; margin-bottom:14px;
          background:rgba(198,168,75,0.05);
        }
        .team-name {
          font-family:'DM Serif Display',serif;
          font-size:16px; color:#fff; margin-bottom:3px;
        }
        .team-role {
          font-size:7px; font-weight:600;
          letter-spacing:0.4em; text-transform:uppercase;
          color:#C6A84B; margin-bottom:10px;
        }
        .team-bio {
          font-size:9px; font-weight:300;
          line-height:1.7; color:rgba(255,255,255,0.28);
          letter-spacing:0.03em;
        }

        .founder-card {
          margin-top:40px;
          border:1px solid rgba(198,168,75,0.12);
          padding:clamp(20px, 5vw, 36px) clamp(16px, 5vw, 40px);
          position:relative;
          background:rgba(0,0,0,0.88);
          backdrop-filter:blur(10px);
        }
        .founder-inner {
          display:grid;
          grid-template-columns:auto 1fr;
          gap:24px;
          align-items:start;
        }
        @media(max-width:520px){ .founder-inner{ grid-template-columns:1fr!important; gap:16px!important; text-align:center; } }
        .founder-avatar {
          width:70px; height:70px;
          border:1px solid rgba(198,168,75,0.4);
          background:rgba(198,168,75,0.06);
          display:flex; align-items:center; justify-content:center;
          font-size:32px;
        }
        @media(max-width:520px){ .founder-avatar{ margin:0 auto; } }

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

          <MiniScene buildFn={makeTrophy} accentHex="#C6A84B" camZ={5.0} />

          <div className="canvas-hud-badge" style={{ color: "#C6A84B", borderColor: "rgba(198,168,75,0.15)" }}>
            <div className="canvas-hud-dot" style={{ background: "#C6A84B" }} />
            Live 3D
          </div>
          <div className="canvas-hud-label" style={{ color: "rgba(198,168,75,0.4)" }}>
            Est. 2022
          </div>
        </div>

        <div className="about-text">
          <div className="about-index">
            <div className="about-index-line" />
            <span>01 / About</span>
          </div>

          <div className="about-eyebrow">
            <div className="about-eyebrow-bar" />
            <div className="about-eyebrow-txt">Emmalex Autos & Logistics</div>
          </div>

          <h2 className="about-headline">
            Built on<br />
            <em>Trust &amp;</em><br />
            Excellence.
          </h2>

          <div className="about-gold-rule" />

          <p className="about-body">
            {isMobile ? 
              "Founded in Lagos, Nigeria (2022) by Emmanuel Ehiawaguan — delivering premium vehicles, real estate, and equipment leasing under one trusted roof." :
              "Founded in Lagos, Nigeria in 2022, Emmalex Autos & Logistics Services Ltd was built from the ground up by Emmanuel Ehiawaguan — a passionate entrepreneur with a clear vision: to deliver premium vehicles, prime real estate, and construction equipment leasing under one trusted roof."
            }
          </p>

          {!isMobile && (
            <p className="about-body">
              In just 3 years, we have served individuals, corporations, and government agencies across Lagos, Abuja, and Port Harcourt — delivering verified quality and transparent pricing.
            </p>
          )}

          <p className="about-tagline">
            "Where premium meets purpose."
          </p>

          <div className="about-cta-row">
            <a href="#cars" className="about-cta">Explore Services</a>
            <a href="#contact" className="about-cta-ghost">
              Contact Us →
            </a>
          </div>
        </div>
      </div>

      {/* SECTION 2 — STATS */}
      <div className="stats-band">
        <div className="stats-band-inner">
          <StatCounter target={200} suffix="+" label="Vehicles" mobileLabel="Vehicles" />
          <StatCounter target={3} suffix="yr" label="In Business" mobileLabel="Years" />
          <StatCounter target={500} suffix="+" label="Happy Clients" mobileLabel="Clients" />
          <StatCounter target={50} suffix="+" label="Equipment" mobileLabel="Equipment" />
        </div>
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
              <MiniScene buildFn={makeShield} accentHex="#5599FF" camZ={4.8} />
              <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 8, fontSize: 6, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(85,153,255,0.5)" }}>
                Trust
              </div>
            </div>
            <div className="story-mini-canvas">
              <CornerTL accent="#F5C518" />
              <MiniScene buildFn={makeStar} accentHex="#F5C518" camZ={4.8} />
              <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 8, fontSize: 6, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(245,197,24,0.5)" }}>
                Vision
              </div>
            </div>
          </div>

          <div>
            <p style={{ fontSize: "clamp(9px, 3vw, 10.5px)", lineHeight: 1.9, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
              {isMobile ?
                "Emmanuel Ehiawaguan built Emmalex to deliver quality vehicles, properties, and equipment to Nigerians — with zero compromise." :
                "We started with a simple belief: that every Nigerian deserves access to quality vehicles, premium properties, and reliable industrial equipment — without compromise."
              }
            </p>
            {!isMobile && (
              <p style={{ fontSize: "clamp(9px, 3vw, 10.5px)", lineHeight: 1.9, color: "rgba(255,255,255,0.35)", marginBottom: 30 }}>
                In just 3 years we have facilitated hundreds of successful transactions, built lasting relationships with top international manufacturers, and established Emmalex as a trusted name across Nigeria.
              </p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 20, borderTop: "1px solid rgba(198,168,75,0.1)", paddingTop: 24 }}>
              {[
                { n: "100%", l: "Verified" },
                { n: "24/7", l: "Support" },
                { n: isMobile ? "3 Cities" : "3 Cities Covered", l: "Locations" },
              ].map(s => (
                <div key={s.l}>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(24px, 5vw, 32px)", color: "#C6A84B", lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: "clamp(6px, 2.5vw, 8px)", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{s.l}</div>
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
            text="Every vehicle is inspected. Every property is vetted. We hold ourselves to the highest standard."
            mobileText="Every vehicle and property is inspected to the highest standard." />
          <ValueCard accent="#5599FF" delay={0.1} icon="🛡️"
            title="Integrity"
            text="Transparent pricing, honest documentation, and zero hidden charges. Trust built one transaction at a time."
            mobileText="Transparent pricing, zero hidden charges. Built on trust." />
          <ValueCard accent="#F5C518" delay={0.2} icon="🚀"
            title="Innovation"
            text="From digital inventory to real-time tracking, we invest in technology for faster, smarter service."
            mobileText="Digital inventory and real-time tracking for faster service." />
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

        <div className="founder-card">
          <div style={{ position: "absolute", top: 8, left: 8, width: 12, height: 12, borderTop: "1px solid rgba(198,168,75,0.4)", borderLeft: "1px solid rgba(198,168,75,0.4)" }} />
          <div style={{ position: "absolute", top: 8, right: 8, width: 12, height: 12, borderTop: "1px solid rgba(198,168,75,0.4)", borderRight: "1px solid rgba(198,168,75,0.4)" }} />

          <div className="founder-inner">
            <div className="founder-avatar">
              👨‍💼
            </div>

            <div>
              <div style={{ fontSize: "clamp(7px, 2.5vw, 8px)", fontWeight: 600, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(198,168,75,0.5)", marginBottom: 6 }}>
                Founder &amp; CEO
              </div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(20px, 5vw, 34px)", fontWeight: 400, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                Emmanuel<br />
                <span style={{ fontStyle: "italic", color: "#C6A84B" }}>Ehiawaguan</span>
              </div>
              <div style={{ width: 40, height: 2, background: "linear-gradient(90deg,#C6A84B,transparent)", margin: "12px 0" }} />
              <div style={{ fontSize: "clamp(9px, 3vw, 10.5px)", fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.35)" }}>
                {isMobile ?
                  "Visionary entrepreneur who founded Emmalex in 2022 to bring world-class vehicles, real estate, and equipment leasing to Nigeria — built entirely on trust and quality." :
                  "Visionary entrepreneur and sole proprietor of Emmalex Autos & Logistics Services Ltd. Emmanuel founded the business in 2022 with a mission to bring world-class vehicles, real estate, and construction equipment leasing to Nigeria — built entirely on trust, quality, and personal service."
                }
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16, justifyContent: isMobile ? "center" : "flex-start" }}>
                {["Automotive", "Real Estate", "Equipment", "Lagos"].map(tag => (
                  <div key={tag} style={{
                    fontSize: "clamp(6px, 2.5vw, 7.5px)", fontWeight: 600,
                    letterSpacing: "0.3em", textTransform: "uppercase",
                    color: "rgba(198,168,75,0.6)", border: "1px solid rgba(198,168,75,0.15)",
                    padding: "3px 8px",
                  }}>
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, fontSize: "clamp(6px, 2vw, 7px)", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(255,255,255,0.1)", textAlign: "center" }}>
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