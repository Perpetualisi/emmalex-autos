import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ══════════════════════════════════════════════════
   CONSTANTS - All WhatsApp messages go to this number
══════════════════════════════════════════════════ */
const WA_NUMBER = "2347034627308";
const WA_URL = `https://wa.me/${WA_NUMBER}`;
const WA_MSG = (name, email, phone, service, message) => {
  let fullMessage = `*NEW INQUIRY FROM EMMALEX WEBSITE*%0A%0A`;
  fullMessage += `*Name:* ${name || "Not provided"}%0A`;
  fullMessage += `*Email:* ${email || "Not provided"}%0A`;
  fullMessage += `*Phone:* ${phone || "Not provided"}%0A`;
  fullMessage += `*Service:* ${service}%0A`;
  fullMessage += `*Message:* ${message || "No message provided"}%0A%0A`;
  fullMessage += `*Sent from Emmalex Nigeria (Port Harcourt)*`;
  return `${WA_URL}?text=${fullMessage}`;
};

/* Quick contact message */
const WA_QUICK = (subject) => `${WA_URL}?text=${encodeURIComponent(`Hello Emmalex! I'm interested in ${subject}. Please share more details.`)}`;

/* ══════════════════════════════════════════════════
   ENHANCED 3D MATERIALS
══════════════════════════════════════════════════ */
const premiumPaint = (color, metalness = 0.92, roughness = 0.08) =>
  new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: metalness,
    roughness: roughness,
    clearcoat: 0.95,
    clearcoatRoughness: 0.05,
    reflectivity: 0.5,
  });

const chromeMat = () =>
  new THREE.MeshStandardMaterial({ color: 0xc0d0e0, metalness: 0.98, roughness: 0.04, emissive: 0x224466, emissiveIntensity: 0.08 });

const glassMat = (opacity = 0.7) =>
  new THREE.MeshPhysicalMaterial({
    color: 0xa8d0f0,
    metalness: 0.95,
    roughness: 0.08,
    transparent: true,
    opacity: opacity,
    ior: 1.52,
  });

const glowMat = (color, intensity = 1.5) =>
  new THREE.MeshStandardMaterial({ color: new THREE.Color(color), emissive: new THREE.Color(color), emissiveIntensity: intensity });

const wireMat = (color, opacity = 0.06) =>
  new THREE.MeshBasicMaterial({ color: new THREE.Color(color), wireframe: true, transparent: true, opacity });

/* ══════════════════════════════════════════════════
   3D ENVELOPE / PAPER PLANE MODELS
══════════════════════════════════════════════════ */

// Premium 3D Envelope (Message icon)
function makeEnvelope() {
  const g = new THREE.Group();
  const gold = premiumPaint(0xc6a84b, 0.96, 0.06);
  const darkGold = premiumPaint(0x8a6f28, 0.92, 0.12);
  const paper = premiumPaint(0xf5f0e0, 0.2, 0.45);
  
  // Base envelope body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 2.2), paper);
  body.position.y = 0;
  body.castShadow = true;
  g.add(body);
  
  // Envelope flap (back)
  const flap = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.05, 2.15), gold);
  flap.position.y = 0.58;
  flap.castShadow = true;
  g.add(flap);
  
  // Envelope fold lines
  const foldLeft = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.05, 0.03), darkGold);
  foldLeft.position.set(-0.8, 0, 0);
  g.add(foldLeft);
  
  const foldRight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.05, 0.03), darkGold);
  foldRight.position.set(0.8, 0, 0);
  g.add(foldRight);
  
  // Decorative seal
  const seal = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24), gold);
  seal.position.set(0, 0.55, 0.95);
  seal.castShadow = true;
  g.add(seal);
  
  const sealRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 16, 48), chromeMat());
  sealRing.position.set(0, 0.55, 0.95);
  sealRing.rotation.x = Math.PI / 2;
  g.add(sealRing);
  
  // "Stamp" effect on envelope
  const stamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.5), premiumPaint(0xccaa88, 0.1, 0.6));
  stamp.position.set(0.65, 0.3, 1.05);
  g.add(stamp);
  
  // Floating particles around envelope
  const particleCount = 60;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePos[i*3] = (Math.random() - 0.5) * 2.5;
    particlePos[i*3+1] = Math.random() * 1.5;
    particlePos[i*3+2] = (Math.random() - 0.5) * 3;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
  const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0xc6a84b, size: 0.012, transparent: true, opacity: 0.4 }));
  g.add(particles);
  
  // Ghost wireframe
  const ghost = g.clone();
  ghost.scale.setScalar(1.25);
  ghost.traverse(c => { if (c.isMesh) c.material = wireMat(0xc6a84b, 0.06); });
  g.add(ghost);
  
  return g;
}

// Premium Paper Plane (Message sending)
function makePaperPlane() {
  const g = new THREE.Group();
  const gold = premiumPaint(0xc6a84b, 0.96, 0.06);
  const silver = chromeMat();
  
  // Main body
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 4), silver);
  body.rotation.x = Math.PI / 2;
  body.position.z = 0.4;
  body.castShadow = true;
  g.add(body);
  
  // Left wing
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.6), silver);
  wingL.position.set(-0.55, 0, 0);
  wingL.rotation.z = -0.3;
  wingL.castShadow = true;
  g.add(wingL);
  
  // Right wing
  const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.6), silver);
  wingR.position.set(0.55, 0, 0);
  wingR.rotation.z = 0.3;
  wingR.castShadow = true;
  g.add(wingR);
  
  // Top fin
  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 3), gold);
  fin.position.set(0, 0.35, 0.3);
  fin.rotation.x = 0;
  g.add(fin);
  
  // Trail effect
  const trailCount = 30;
  const trailGeo = new THREE.BufferGeometry();
  const trailPos = new Float32Array(trailCount * 3);
  for (let i = 0; i < trailCount; i++) {
    trailPos[i*3] = (Math.random() - 0.5) * 0.3;
    trailPos[i*3+1] = (Math.random() - 0.5) * 0.3;
    trailPos[i*3+2] = -0.8 - i * 0.05;
  }
  trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
  const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({ color: 0xc6a84b, size: 0.015, transparent: true, opacity: 0.3 }));
  g.add(trail);
  
  // Ghost
  const ghost = g.clone();
  ghost.scale.setScalar(1.3);
  ghost.traverse(c => { if (c.isMesh) c.material = wireMat(0xc6a84b, 0.07); });
  g.add(ghost);
  
  return g;
}

// Premium Compass (Location icon)
function makeCompass() {
  const g = new THREE.Group();
  const gold = premiumPaint(0xc6a84b, 0.96, 0.06);
  const dark = premiumPaint(0x1a1a2a, 0.85, 0.15);
  const silver = chromeMat();
  const glow = glowMat(0x5599ff, 1.2);
  
  // Base disc
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 48), dark);
  base.rotation.x = Math.PI / 2;
  base.castShadow = true;
  g.add(base);
  
  // Compass face
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.04, 48), gold);
  face.rotation.x = Math.PI / 2;
  face.position.y = 0.02;
  g.add(face);
  
  // Compass rose (N,S,E,W)
  const directions = ["N", "E", "S", "W"];
  const angles = [0, 90, 180, 270];
  directions.forEach((dir, i) => {
    const angle = (angles[i] * Math.PI) / 180;
    const marker = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.02), dir === "N" ? gold : silver);
    marker.position.set(Math.sin(angle) * 0.65, 0.06, Math.cos(angle) * 0.65);
    g.add(marker);
  });
  
  // Needle
  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.08, 1.1, 4), glow);
  needle.rotation.z = Math.PI / 4;
  needle.position.y = 0.08;
  g.add(needle);
  
  const needleSouth = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.8, 4), silver);
  needleSouth.rotation.z = Math.PI / 4 + Math.PI;
  needleSouth.position.y = 0.08;
  g.add(needleSouth);
  
  // Center cap
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24), gold);
  cap.position.y = 0.1;
  g.add(cap);
  
  // Outer ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.02, 24, 96), silver);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.02;
  g.add(ring);
  
  // Ghost
  const ghost = g.clone();
  ghost.scale.setScalar(1.28);
  ghost.traverse(c => { if (c.isMesh) c.material = wireMat(0x5599ff, 0.07); });
  g.add(ghost);
  
  return g;
}

/* ══════════════════════════════════════════════════
   ENHANCED 3D SCENE COMPONENT
══════════════════════════════════════════════════ */
function ContactScene() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const frameRef = useRef(null);
  const modelRef = useRef(null);
  const particlesRef = useRef(null);
  const ringsRef = useRef([]);
  const timeRef = useRef(0);

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
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.2, 6.5);
    camera.lookAt(0, 0, 0);

    // Lighting system
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    
    const ambientWarm = new THREE.AmbientLight(0x442200, 0.25);
    scene.add(ambientWarm);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.8);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.8);
    fillLight.position.set(-4, 5, 4);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(0xc6a84b, 4.5, 20);
    accentLight.position.set(-2, 3, 5);
    scene.add(accentLight);

    const rimLight = new THREE.PointLight(0xffaa66, 2.2);
    rimLight.position.set(3, -1, -5);
    scene.add(rimLight);

    const backLight = new THREE.PointLight(0x88aaff, 0.6);
    backLight.position.set(0, 1, -7);
    scene.add(backLight);

    // Ground plane (invisible but catches shadows)
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.4, transparent: true, color: 0x000000, blur: 1.5 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Reflective grid
    const grid = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 8, 24, 20),
      new THREE.MeshBasicMaterial({ color: 0xc6a84b, wireframe: true, transparent: true, opacity: 0.045 })
    );
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -1.18;
    scene.add(grid);

    // Floating particles
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i*3] = (Math.random() - 0.5) * 14;
      particlePos[i*3+1] = (Math.random() - 0.5) * 6 + 1;
      particlePos[i*3+2] = (Math.random() - 0.5) * 12 - 2;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0xc6a84b, size: 0.018, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending }));
    scene.add(particles);
    particlesRef.current = particles;

    // Decorative rings
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.008, 48, 120), new THREE.MeshBasicMaterial({ color: 0xc6a84b, transparent: true, opacity: 0.35 }));
    ring1.rotation.x = 0.72;
    ring1.rotation.z = 0.18;
    scene.add(ring1);
    
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.006, 48, 140), new THREE.MeshBasicMaterial({ color: 0xc6a84b, transparent: true, opacity: 0.22 }));
    ring2.rotation.x = 1.25;
    ring2.rotation.z = -0.45;
    scene.add(ring2);
    
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.004, 48, 160), new THREE.MeshBasicMaterial({ color: 0xc6a84b, transparent: true, opacity: 0.15 }));
    ring3.rotation.x = 0.4;
    ring3.rotation.z = 0.85;
    scene.add(ring3);
    
    ringsRef.current = [ring1, ring2, ring3];

    // Main model (alternating between envelope and paper plane with time)
    const envelope = makeEnvelope();
    const paperPlane = makePaperPlane();
    
    envelope.visible = true;
    paperPlane.visible = false;
    scene.add(envelope);
    scene.add(paperPlane);
    modelRef.current = { envelope, paperPlane, current: "envelope" };

    // Animation loop
    let time = 0;
    let switchTimer = 0;
    let mouseX = 0, mouseY = 0;
    
    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    mount.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.016;
      switchTimer += 0.016;
      
      // Switch models every 6 seconds for variety
      if (switchTimer > 6) {
        switchTimer = 0;
        if (modelRef.current.current === "envelope") {
          modelRef.current.envelope.visible = false;
          modelRef.current.paperPlane.visible = true;
          modelRef.current.current = "paperPlane";
        } else {
          modelRef.current.envelope.visible = true;
          modelRef.current.paperPlane.visible = false;
          modelRef.current.current = "envelope";
        }
      }
      
      const activeModel = modelRef.current.current === "envelope" ? modelRef.current.envelope : modelRef.current.paperPlane;
      
      // Camera follow mouse
      camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.04;
      camera.position.y += (0.2 + mouseY * 0.3 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      
      // Animate active model
      if (activeModel) {
        activeModel.rotation.y += 0.003 + mouseX * 0.001;
        activeModel.rotation.x += 0.001 + mouseY * 0.0005;
        activeModel.position.y = Math.sin(time * 0.8) * 0.08;
      }
      
      // Animate lights
      accentLight.intensity = 4.2 + Math.sin(time * 1.5) * 0.8;
      rimLight.intensity = 1.8 + Math.cos(time * 2.0) * 0.5;
      
      // Animate rings
      ringsRef.current[0].rotation.y += 0.004;
      ringsRef.current[0].rotation.x += 0.002;
      ringsRef.current[1].rotation.y -= 0.003;
      ringsRef.current[1].rotation.z += 0.0015;
      ringsRef.current[2].rotation.x += 0.002;
      ringsRef.current[2].rotation.z += 0.0025;
      
      ringsRef.current.forEach(ring => {
        ring.position.copy(activeModel.position);
      });
      
      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.008;
        particlesRef.current.rotation.x = Math.sin(time * 0.05) * 0.02;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (rendererRef.current && camera) {
        const width = mount.clientWidth;
        const height = mount.clientHeight;
        rendererRef.current.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(mount);

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
  }, []);

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
    style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.06, pointerEvents: "none", zIndex: 10, animation: "contactReticle 20s linear infinite" }}>
    <circle cx="30" cy="30" r="28" stroke={accent} strokeWidth="0.6" strokeDasharray="4 6"/>
    <circle cx="30" cy="30" r="20" stroke={accent} strokeWidth="0.4"/>
    <line x1="30" y1="0" x2="30" y2="10" stroke={accent} strokeWidth="0.8"/>
    <line x1="30" y1="50" x2="30" y2="60" stroke={accent} strokeWidth="0.8"/>
    <line x1="0" y1="30" x2="10" y2="30" stroke={accent} strokeWidth="0.8"/>
    <line x1="50" y1="30" x2="60" y2="30" stroke={accent} strokeWidth="0.8"/>
  </svg>
);

/* ══════════════════════════════════════════════════
   MAIN CONTACT COMPONENT
══════════════════════════════════════════════════ */
export default function Contact() {
  const [scanY, setScanY] = useState(20);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "vehicles",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let y = 20, raf;
    const tick = () => { y = (y + 0.08) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Build WhatsApp message with all form data
    const waUrl = WA_MSG(
      formData.name,
      formData.email,
      formData.phone,
      formData.service,
      formData.message
    );
    
    // Open WhatsApp in new tab
    window.open(waUrl, "_blank");
    
    // Show success message
    setSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "vehicles",
      message: "",
    });
    
    // Hide success message after 4 seconds
    setTimeout(() => setSubmitted(false), 4000);
  };

  const contactCards = [
    { icon: "📍", title: "Visit Us", details: ["Port Harcourt, Nigeria", "Rumuokwurushi, PH", "Mon-Fri: 9am - 6pm"], accent: "#C6A84B", action: null },
    { icon: "📞", title: "Call Us", details: ["+234 703 462 7308", "+234 802 345 6789", "24/7 Customer Support"], accent: "#5599FF", action: "tel:+2347034627308" },
    { icon: "✉️", title: "WhatsApp", details: ["Fastest Response", "Send Documents", "Video Call Available"], accent: "#25D366", action: WA_URL },
  ];

  return (
    <section id="contact" style={{
      background: "#000",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Overpass Mono', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Overpass+Mono:wght@300;400;600&display=swap');
        
        @keyframes contactReticle { 
          from{transform:translate(-50%,-50%) rotate(0deg)} 
          to{transform:translate(-50%,-50%) rotate(360deg)} 
        }
        
        @keyframes contactFadeUp { 
          from{opacity:0;transform:translateY(20px)} 
          to{opacity:1;transform:translateY(0)} 
        }
        
        @keyframes contactScanMove { 
          0%{background-position:0 -200px} 
          100%{background-position:0 100%} 
        }
        
        @keyframes contactPulse { 
          0%,100%{opacity:0.6;transform:scale(1)} 
          50%{opacity:1;transform:scale(1.05)} 
        }

        #contact {
          -webkit-overflow-scrolling: touch;
          overflow-x: hidden;
        }

        #contact::before {
          content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image: linear-gradient(rgba(255,255,255,0.007) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.007) 1px, transparent 1px);
          background-size:55px 55px;
        }

        .contact-scan {
          position:absolute; inset:0; pointer-events:none; z-index:1;
          background:linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%);
          background-size:100% 220px;
          animation:contactScanMove 9s linear infinite;
        }

        .contact-beam {
          position:absolute; left:0; right:0; pointer-events:none; z-index:2;
          height:70px;
          background:linear-gradient(to bottom,transparent,rgba(198,168,75,0.05),transparent);
        }

        .contact-header {
          max-width:1380px; margin:0 auto;
          padding:100px 7% 40px;
          position:relative; z-index:4;
          text-align:center;
        }
        
        @media(max-width:860px){ 
          .contact-header{ padding:60px 5% 30px; } 
        }
        
        @media(max-width:480px){ 
          .contact-header{ padding:40px 20px 25px; } 
        }

        .contact-eyebrow {
          display:flex; align-items:center; justify-content:center; gap:10px;
          margin-bottom:16px;
          flex-wrap:wrap;
        }
        
        .contact-eyebrow-bar { width:24px; height:2px; background:#C6A84B; border-radius:2px; }
        
        .contact-eyebrow-txt {
          font-size:8px; font-weight:700; letter-spacing:0.5em;
          text-transform:uppercase; color:#C6A84B;
        }

        .contact-title {
          font-family:'DM Serif Display',serif;
          font-size:clamp(32px,5.5vw,72px);
          font-weight:400; line-height:1.05;
          letter-spacing:-0.02em; color:#fff;
        }
        
        .contact-title em { font-style:italic; color:#C6A84B; }

        .contact-sub {
          font-size:10.5px; color:rgba(255,255,255,0.28);
          max-width:580px; margin:20px auto 0;
          line-height:1.8; letter-spacing:0.04em;
          padding:0 16px;
        }
        
        @media(max-width:480px){
          .contact-sub{ font-size:9px; line-height:1.6; }
        }

        .contact-grid {
          max-width:1380px; margin:0 auto;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:40px;
          padding:40px 7% 80px;
          position:relative; z-index:4;
        }
        
        @media(max-width:900px){
          .contact-grid{ grid-template-columns:1fr !important; gap:32px !important; padding:20px 5% 60px !important; }
        }
        
        @media(max-width:480px){
          .contact-grid{ gap:24px !important; padding:20px 16px 50px !important; }
        }

        .contact-canvas-wrap {
          position:relative;
          height:540px;
          border:1px solid rgba(255,255,255,0.04);
          overflow:hidden;
          box-shadow:0 20px 40px rgba(0,0,0,0.5);
        }
        
        @media(max-width:860px){ 
          .contact-canvas-wrap{ height:420px !important; } 
        }
        
        @media(max-width:480px){ 
          .contact-canvas-wrap{ height:320px !important; } 
        }

        .contact-canvas-wrap::before {
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
        
        @media(max-width:480px){
          .canvas-hud-badge{ top:12px; right:12px; padding:4px 10px; font-size:6px; }
        }
        
        .canvas-hud-dot {
          width:5px; height:5px; border-radius:50%;
          animation:contactPulse 2s ease-in-out infinite;
        }

        /* Form Styles - Mobile Stable */
        .contact-form {
          background:rgba(0,0,0,0.85);
          border:1px solid rgba(255,255,255,0.04);
          padding:clamp(20px,4vw,40px);
          position:relative;
          width:100%;
          box-sizing:border-box;
        }
        
        @media(max-width:480px){
          .contact-form{ padding:24px 20px; }
        }
        
        .contact-form::before {
          content:''; position:absolute; top:0; left:0; right:0;
          height:1px;
          background:linear-gradient(90deg,transparent,#C6A84B,transparent);
          opacity:0.3;
        }

        .form-group {
          margin-bottom:20px;
          width:100%;
        }
        
        @media(max-width:480px){
          .form-group{ margin-bottom:16px; }
        }
        
        .form-group label {
          display:block;
          font-size:7.5px;
          letter-spacing:0.45em;
          text-transform:uppercase;
          color:rgba(255,255,255,0.4);
          margin-bottom:8px;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width:100%;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.08);
          padding:12px 14px;
          font-family:'Overpass Mono',monospace;
          font-size:10px;
          color:#fff;
          transition:all 0.3s;
          box-sizing:border-box;
          -webkit-appearance:none;
          appearance:none;
          border-radius:0;
        }
        
        @media(max-width:480px){
          .form-group input,
          .form-group select,
          .form-group textarea {
            padding:10px 12px;
            font-size:11px;
          }
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline:none;
          border-color:#C6A84B;
          background:rgba(198,168,75,0.05);
        }
        
        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color:rgba(255,255,255,0.2);
        }
        
        select option {
          background:#000;
          color:#fff;
        }

        .submit-btn {
          width:100%;
          background:#C6A84B;
          border:none;
          padding:14px;
          font-family:'Overpass Mono',monospace;
          font-size:8.5px;
          font-weight:600;
          letter-spacing:0.45em;
          text-transform:uppercase;
          color:#000;
          cursor:pointer;
          transition:all 0.3s;
          margin-top:8px;
          -webkit-appearance:none;
          appearance:none;
        }
        
        @media(max-width:480px){
          .submit-btn{ padding:12px; font-size:8px; }
        }
        
        .submit-btn:active {
          transform:scale(0.98);
        }
        
        .submit-btn:disabled {
          opacity:0.6;
          cursor:not-allowed;
          transform:none;
        }

        .success-message {
          background:rgba(37,211,102,0.12);
          border:1px solid rgba(37,211,102,0.3);
          padding:12px 16px;
          text-align:center;
          margin-bottom:20px;
          font-size:9px;
          letter-spacing:0.2em;
          color:#25D366;
          animation:contactFadeUp 0.3s ease;
        }
        
        @media(max-width:480px){
          .success-message{ padding:10px 12px; font-size:8px; margin-bottom:16px; }
        }

        /* Contact Cards - Mobile Optimized */
        .contact-cards {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:1px;
          background:rgba(255,255,255,0.04);
          margin-top:40px;
        }
        
        @media(max-width:860px){ 
          .contact-cards{ grid-template-columns:1fr !important; gap:1px; margin-top:32px; } 
        }

        .contact-card {
          background:rgba(0,0,0,0.92);
          padding:clamp(20px,3vw,32px);
          position:relative;
          transition:all 0.3s;
          cursor:pointer;
          width:100%;
          box-sizing:border-box;
        }
        
        @media(max-width:480px){
          .contact-card{ padding:20px; }
        }
        
        @media(hover:hover){
          .contact-card:hover {
            background:rgba(0,0,0,0.98);
            transform:translateY(-4px);
          }
        }
        
        .contact-card:active {
          transform:scale(0.99);
        }
        
        .contact-card-icon {
          font-size:28px;
          margin-bottom:12px;
        }
        
        @media(max-width:480px){
          .contact-card-icon{ font-size:24px; margin-bottom:10px; }
        }
        
        .contact-card-title {
          font-family:'DM Serif Display',serif;
          font-size:16px;
          color:#fff;
          margin-bottom:12px;
        }
        
        @media(max-width:480px){
          .contact-card-title{ font-size:15px; margin-bottom:10px; }
        }
        
        .contact-card-detail {
          font-size:8.5px;
          line-height:1.8;
          color:rgba(255,255,255,0.35);
          letter-spacing:0.03em;
        }
        
        @media(max-width:480px){
          .contact-card-detail{ font-size:8px; line-height:1.6; }
        }
        
        .contact-card-detail div {
          margin-bottom:4px;
          word-break:break-word;
        }
        
        .contact-card-accent-line {
          position:absolute;
          top:0;
          left:0;
          right:0;
          height:1px;
          background:linear-gradient(90deg,transparent,var(--accent),transparent);
          opacity:0;
          transition:opacity 0.3s;
        }
        
        @media(hover:hover){
          .contact-card:hover .contact-card-accent-line {
            opacity:0.6;
          }
        }

        /* WhatsApp Banner - Mobile Stable */
        .whatsapp-banner {
          background:linear-gradient(135deg,#1a1a2e,#0a0a1a);
          border:1px solid rgba(198,168,75,0.15);
          border-radius:8px;
          margin:0 5% 60px;
          padding:20px 28px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          flex-wrap:wrap;
          gap:16px;
          position:relative;
          z-index:4;
        }
        
        @media(max-width:700px){ 
          .whatsapp-banner{ flex-direction:column; text-align:center; margin:0 5% 40px; padding:20px; } 
        }
        
        @media(max-width:480px){ 
          .whatsapp-banner{ margin:0 16px 40px; padding:18px; } 
        }

        .whatsapp-banner-icon {
          font-size:32px;
        }
        
        @media(max-width:480px){
          .whatsapp-banner-icon{ font-size:28px; }
        }
        
        .whatsapp-banner-title {
          font-family:'DM Serif Display',serif;
          font-size:clamp(15px,2.2vw,22px);
          font-weight:400;
        }
        
        .whatsapp-banner-sub {
          font-size:7px;
          letter-spacing:0.35em;
          text-transform:uppercase;
          color:rgba(255,255,255,0.4);
          margin-top:4px;
        }
        
        .whatsapp-banner-btn {
          background:#25D366;
          color:#000;
          border:none;
          padding:10px 24px;
          font-size:8px;
          font-weight:700;
          letter-spacing:0.35em;
          text-transform:uppercase;
          text-decoration:none;
          border-radius:4px;
          display:inline-flex;
          align-items:center;
          gap:8px;
          transition:all 0.3s;
          -webkit-tap-highlight-color:transparent;
        }
        
        @media(max-width:480px){
          .whatsapp-banner-btn{ padding:10px 20px; font-size:7.5px; }
        }
        
        .whatsapp-banner-btn:active {
          transform:scale(0.97);
        }

        .contact-progress {
          position:absolute; bottom:0; left:0; right:0;
          height:1px; background:rgba(255,255,255,0.04); z-index:10;
        }
        
        /* Fix for mobile viewport stability */
        input, select, textarea, button {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Prevent zoom on input focus for iOS */
        @media(max-width:480px){
          input, select, textarea {
            font-size:16px;
          }
        }
      `}</style>

      <div className="contact-scan" />
      <div className="contact-beam" style={{ top: `${scanY}%` }} />

      {/* Header */}
      <div className="contact-header">
        <div className="contact-eyebrow">
          <div className="contact-eyebrow-bar" />
          <div className="contact-eyebrow-txt">Get In Touch</div>
        </div>
        <h2 className="contact-title">
          Let's <em>connect.</em>
        </h2>
        <div className="contact-sub">
          Have a question about our vehicles, properties, or equipment? 
          Reach out to our team — we're here to help 24/7.
        </div>
      </div>

      {/* Main Grid */}
      <div className="contact-grid">
        {/* Left - 3D Scene */}
        <div className="contact-canvas-wrap">
          <CornerTL accent="#C6A84B" />
          <CornerBR accent="#C6A84B" />
          <Reticle accent="#C6A84B" />

          <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(198,168,75,0.03)" }} />
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(198,168,75,0.03)" }} />
          </div>

          <ContactScene />

          <div className="canvas-hud-badge" style={{ color: "#C6A84B", borderColor: "rgba(198,168,75,0.15)" }}>
            <div className="canvas-hud-dot" style={{ background: "#C6A84B" }} />
            Live 3D · Let's Connect
          </div>
          <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 8, fontFamily: "'DM Serif Display',serif", fontStyle: "italic", fontSize: 11, color: "rgba(255,255,255,0.12)" }}>
            Send a message
          </div>
        </div>

        {/* Right - Contact Form */}
        <div className="contact-form">
          {submitted && (
            <div className="success-message">
              ✓ Message sent! You'll be redirected to WhatsApp.
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., John Adeyemi"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="hello@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="+234 XXX XXX XXXX"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>I'm interested in *</label>
              <select name="service" value={formData.service} onChange={handleChange} required>
                <option value="vehicles">Vehicles (Cars, SUVs, Trucks)</option>
                <option value="realestate">Real Estate (Properties)</option>
                <option value="equipment">Equipment (Construction Machinery)</option>
                <option value="leasing">Equipment Leasing</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                rows="4"
                placeholder="Tell us what you're looking for..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      {/* Contact Cards - All lead to WhatsApp on click */}
      <div className="contact-cards" style={{ maxWidth: "1380px", margin: "0 auto", padding: "0 5%" }}>
        {contactCards.map((card, idx) => (
          <div 
            key={idx}
            className="contact-card"
            style={{ "--accent": card.accent }}
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => {
              if (card.action === "tel:+2347034627308") {
                window.location.href = "tel:+2347034627308";
              } else if (card.action === WA_URL) {
                window.open(WA_URL, "_blank");
              } else if (card.title === "Visit Us") {
                window.open(WA_QUICK("visiting your office location"), "_blank");
              }
            }}
          >
            <div className="contact-card-accent-line" style={{ opacity: hoveredCard === idx ? 0.6 : 0 }} />
            <div className="contact-card-icon">{card.icon}</div>
            <div className="contact-card-title">{card.title}</div>
            <div className="contact-card-detail">
              {card.details.map((detail, i) => (
                <div key={i}>{detail}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* WhatsApp Banner CTA */}
      <div className="whatsapp-banner">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div className="whatsapp-banner-icon">💬</div>
          <div>
            <div className="whatsapp-banner-title">Prefer instant messaging?</div>
            <div className="whatsapp-banner-sub">Chat with our team directly on WhatsApp</div>
          </div>
        </div>
        <a 
          href={WA_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="whatsapp-banner-btn"
          onClick={(e) => e.stopPropagation()}
        >
          <span>📱</span> Start WhatsApp Chat
        </a>
      </div>

      <div className="contact-progress">
        <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,#C6A84B,transparent)", opacity: 0.25 }} />
      </div>
    </section>
  );
}