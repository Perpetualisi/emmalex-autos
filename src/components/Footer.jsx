import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS - UPDATED CONTACT INFO
═══════════════════════════════════════════════════════════ */
const CURRENT_YEAR = new Date().getFullYear();
const WA_NUMBER = "2347034627308";
const WA_URL = `https://wa.me/${WA_NUMBER}`;
const CONTACT_EMAIL = "ehiawaguanemmanuel@gmail.com";
const CONTACT_PHONE = "+234 703 462 7308";
const LOCATION = "Port Harcourt, Nigeria";

const FOOTER_LINKS = {
  company: [
    { name: "About Us", href: "#about" },
    { name: "Our Services", href: "#services" },
  ],
  services: [
    { name: "Vehicles", href: "#cars" },
    { name: "Real Estate", href: "#realestate" },
    { name: "Equipment", href: "#equipment" },
    { name: "Leasing", href: "#leasing" },
  ],
  support: [
    { name: "Contact Us", href: "#contact" },
  ],
};

const SOCIAL_LINKS = [
  { name: "Instagram", icon: "📷", url: "https://instagram.com", color: "#E4405F" },
  { name: "Facebook", icon: "📘", url: "https://facebook.com", color: "#1877F2" },
  { name: "Twitter", icon: "🐦", url: "https://twitter.com", color: "#1DA1F2" },
  { name: "LinkedIn", icon: "🔗", url: "https://linkedin.com", color: "#0A66C2" },
];

/* ═══════════════════════════════════════════════════════════
   3D SCENE COMPONENT - Premium Floating Orbs (Optimized)
═══════════════════════════════════════════════════════════ */
function Footer3DScene() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const frameRef = useRef(null);
  const particlesRef = useRef(null);
  const orbsRef = useRef([]);
  const timeRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const mount = mountRef.current;
    if (!mount) return;

    // Renderer setup with lower pixel ratio on mobile
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // Lighting system - simplified for mobile
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    
    const keyLight = new THREE.DirectionalLight(0xfff8e0, 1.5);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);
    
    const fillLight = new THREE.PointLight(0x88aaff, 0.5);
    fillLight.position.set(-2, 1, 3);
    scene.add(fillLight);
    
    const goldLight = new THREE.PointLight(0xc6a84b, 0.7);
    goldLight.position.set(1, 2, 2);
    scene.add(goldLight);
    
    const rimLight = new THREE.PointLight(0xffaa66, 0.4);
    rimLight.position.set(0, 1, -4);
    scene.add(rimLight);

    // Create floating orbs (fewer on mobile)
    const orbCount = isMobile ? 8 : 12;
    const orbColors = [0xc6a84b, 0x5599ff, 0xf5c518, 0xff6688, 0x44cc88];
    const orbs = [];
    
    for (let i = 0; i < orbCount; i++) {
      const size = 0.08 + Math.random() * 0.1;
      const material = new THREE.MeshStandardMaterial({
        color: orbColors[Math.floor(Math.random() * orbColors.length)],
        metalness: 0.85,
        roughness: 0.15,
        emissive: 0x442200,
        emissiveIntensity: 0.12,
      });
      
      const orb = new THREE.Mesh(new THREE.SphereGeometry(size, 24, 24), material);
      orb.userData = {
        speedX: (Math.random() - 0.5) * 0.006,
        speedY: (Math.random() - 0.5) * 0.006,
        speedZ: (Math.random() - 0.5) * 0.003,
        radiusX: 1.5 + Math.random() * 2,
        radiusY: 1 + Math.random() * 1.5,
        radiusZ: 1 + Math.random() * 2,
        angleX: Math.random() * Math.PI * 2,
        angleY: Math.random() * Math.PI * 2,
        angleZ: Math.random() * Math.PI * 2,
      };
      scene.add(orb);
      orbs.push(orb);
    }
    orbsRef.current = orbs;

    // Particle system - fewer particles on mobile
    const particleCount = isMobile ? 300 : 500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc6a84b,
      size: 0.007,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Decorative wireframe rings - fewer on mobile
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xc6a84b, transparent: true, opacity: 0.1, wireframe: true });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.02, 28, 80), ringMaterial);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);
    
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.015, 28, 100), ringMaterial);
    ring2.rotation.z = Math.PI / 3;
    ring2.rotation.x = Math.PI / 4;
    scene.add(ring2);
    
    if (!isMobile) {
      const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.01, 28, 120), ringMaterial);
      ring3.rotation.x = Math.PI / 3;
      ring3.rotation.z = Math.PI / 6;
      scene.add(ring3);
    }

    // Mouse interaction (desktop only)
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    
    if (!isMobile) {
      const onMouseMove = (e) => {
        const rect = mount.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      mount.addEventListener("mousemove", onMouseMove);
      
      return () => mount.removeEventListener("mousemove", onMouseMove);
    }

    // Animation loop
    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.016;
      timeRef.current = time;
      
      // Smooth camera rotation based on mouse (desktop only)
      if (!isMobile) {
        targetRotationX += (mouseY * 0.3 - targetRotationX) * 0.05;
        targetRotationY += (mouseX * 0.5 - targetRotationY) * 0.05;
        camera.position.x += (targetRotationY * 1.5 - camera.position.x) * 0.05;
        camera.position.y += (targetRotationX * 1.2 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
      }
      
      // Animate orbs
      orbs.forEach((orb, idx) => {
        const data = orb.userData;
        data.angleX += data.speedX;
        data.angleY += data.speedY;
        data.angleZ += data.speedZ;
        
        orb.position.x = Math.sin(data.angleX) * data.radiusX;
        orb.position.y = Math.cos(data.angleY) * data.radiusY;
        orb.position.z = Math.sin(data.angleZ) * data.radiusZ;
        
        const scale = 1 + Math.sin(time * 2 + idx) * 0.12;
        orb.scale.set(scale, scale, scale);
      });
      
      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.015;
        particlesRef.current.rotation.x = Math.sin(time * 0.08) * 0.08;
      }
      
      // Animate rings
      ring1.rotation.z += 0.002;
      ring2.rotation.x += 0.001;
      ring2.rotation.y += 0.001;
      if (ring2) ring2.rotation.x += 0.001;
      if (ring1) ring1.rotation.z += 0.002;
      
      // Pulsing lights
      goldLight.intensity = 0.6 + Math.sin(time * 1.5) * 0.15;
      rimLight.intensity = 0.35 + Math.cos(time * 1.2) * 0.1;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
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
  }, [isMobile]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />;
}

/* ═══════════════════════════════════════════════════════════
   SVG DECORATIONS
═══════════════════════════════════════════════════════════ */
const CornerTL = ({ accent }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ position: "absolute", top: 0, left: 0, opacity: 0.3, pointerEvents: "none", zIndex: 10 }}>
    <path d="M0 32 L0 0 L32 0" stroke={accent} strokeWidth="0.7" fill="none"/>
    <circle cx="0" cy="0" r="2" fill={accent} opacity="0.7"/>
  </svg>
);

const CornerBR = ({ accent }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.3, pointerEvents: "none", zIndex: 10 }}>
    <path d="M32 0 L32 32 L0 32" stroke={accent} strokeWidth="0.7" fill="none"/>
    <circle cx="32" cy="32" r="2" fill={accent} opacity="0.7"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   NEWSLETTER SIGNUP (Mobile Responsive)
═══════════════════════════════════════════════════════════ */
function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      const waMsg = `Hello Emmalex! I'm interested in your newsletter and updates. My email is ${email}`;
      window.open(`${WA_URL}?text=${encodeURIComponent(waMsg)}`, "_blank");
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };
  
  return (
    <div style={{ marginTop: "24px" }}>
      <h4 style={{
        fontFamily: "'Overpass Mono', monospace",
        fontSize: "clamp(7px, 3vw, 8px)",
        fontWeight: 600,
        letterSpacing: "0.4em",
        textTransform: "uppercase",
        color: "#C6A84B",
        marginBottom: "12px",
      }}>
        Newsletter
      </h4>
      <p style={{
        fontSize: "clamp(9px, 3vw, 10px)",
        color: "rgba(255,255,255,0.3)",
        marginBottom: "12px",
        lineHeight: 1.6,
      }}>
        Subscribe for exclusive offers and updates.
      </p>
      
      {subscribed ? (
        <div style={{
          background: "rgba(37,211,102,0.12)",
          border: "1px solid rgba(37,211,102,0.3)",
          padding: "10px",
          textAlign: "center",
          fontSize: "clamp(8px, 3vw, 9px)",
          color: "#25D366",
        }}>
          ✓ WhatsApp opened! Send your email to subscribe.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "10px 12px",
              fontFamily: "'Overpass Mono', monospace",
              fontSize: "clamp(10px, 3.5vw, 11px)",
              color: "#fff",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => e.target.style.borderColor = "#C6A84B"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
          <button
            type="submit"
            style={{
              background: "#C6A84B",
              border: "none",
              padding: "10px",
              fontFamily: "'Overpass Mono', monospace",
              fontSize: "clamp(7px, 3vw, 8px)",
              fontWeight: 600,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#000",
              cursor: "pointer",
              transition: "all 0.3s",
              width: "100%",
            }}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN FOOTER COMPONENT (Mobile Responsive)
═══════════════════════════════════════════════════════════ */
export default function Footer() {
  const [scanY, setScanY] = useState(20);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    let y = 20, raf;
    const tick = () => { y = (y + 0.05) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <footer style={{
      background: "#000",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
      borderTop: "1px solid rgba(255,255,255,0.04)",
    }}>
      {/* Animated scan line */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.006) 50%, transparent 100%)",
        backgroundSize: "100% 200px",
        animation: "footerScanMove 9s linear infinite",
      }} />
      
      {/* Scanning beam */}
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: `${scanY}%`,
        height: "50px",
        background: "linear-gradient(to bottom, transparent, rgba(198,168,75,0.03), transparent)",
        pointerEvents: "none",
        zIndex: 2,
      }} />
      
      <style>{`
        @keyframes footerScanMove {
          from { background-position: 0 -200px; }
          to { background-position: 0 100%; }
        }
        
        .footer-link-hover {
          position: relative;
          display: inline-block;
        }
        
        .footer-link-hover::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #C6A84B;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .footer-link-hover:hover::after {
          width: 100%;
        }
        
        .social-icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .footer-grid {
            gap: 32px !important;
          }
        }
        
        @media (max-width: 480px) {
          .footer-link-hover::after {
            display: none;
          }
        }
      `}</style>
      
      {/* 3D Background Canvas */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity: 0.3,
      }}>
        <Footer3DScene />
      </div>
      
      {/* Main Footer Content */}
      <div style={{
        position: "relative",
        zIndex: 5,
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "clamp(40px, 8vw, 70px) 5% 30px",
      }}>
        
        {/* Top Section - Logo + Description */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr 1fr",
          gap: "clamp(30px, 5vw, 50px)",
          marginBottom: "clamp(30px, 6vw, 50px)",
        }} className="footer-grid">
          
          {/* Brand Column */}
          <div style={{ textAlign: isMobile ? "center" : "left" }}>
            <div style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(28px, 6vw, 36px)",
              color: "#C6A84B",
              letterSpacing: "-0.01em",
              marginBottom: "12px",
            }}>
              Emmalex<span style={{ color: "#fff", fontWeight: 300 }}>.</span>
            </div>
            <p style={{
              fontSize: "clamp(9px, 3vw, 10px)",
              color: "rgba(255,255,255,0.3)",
              lineHeight: 1.7,
              marginBottom: "20px",
              maxWidth: isMobile ? "100%" : "280px",
              marginLeft: isMobile ? "auto" : 0,
              marginRight: isMobile ? "auto" : 0,
            }}>
              Premium vehicles, prime real estate, and heavy equipment leasing — serving Nigeria with excellence since 2022.
            </p>
            
            {/* Trust Badges */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
              {["✓ Verified", "✓ Trusted", "✓ Licensed"].map((badge) => (
                <div key={badge} style={{
                  fontFamily: "'Overpass Mono', monospace",
                  fontSize: "clamp(5px, 2.5vw, 6.5px)",
                  fontWeight: 600,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "rgba(198,168,75,0.5)",
                  border: "1px solid rgba(198,168,75,0.12)",
                  padding: "4px 8px",
                }}>
                  {badge}
                </div>
              ))}
            </div>
          </div>
          
          {/* Company Links */}
          <div style={{ textAlign: isMobile ? "center" : "left" }}>
            <h4 style={{
              fontFamily: "'Overpass Mono', monospace",
              fontSize: "clamp(7px, 3vw, 8px)",
              fontWeight: 600,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#C6A84B",
              marginBottom: "16px",
            }}>
              Company
            </h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name} style={{ marginBottom: "10px" }}>
                  <a
                    href={link.href}
                    className="footer-link-hover"
                    style={{
                      fontSize: "clamp(9px, 3vw, 10px)",
                      color: "rgba(255,255,255,0.4)",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services Links */}
          <div style={{ textAlign: isMobile ? "center" : "left" }}>
            <h4 style={{
              fontFamily: "'Overpass Mono', monospace",
              fontSize: "clamp(7px, 3vw, 8px)",
              fontWeight: 600,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#C6A84B",
              marginBottom: "16px",
            }}>
              Services
            </h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.name} style={{ marginBottom: "10px" }}>
                  <a
                    href={link.href}
                    className="footer-link-hover"
                    style={{
                      fontSize: "clamp(9px, 3vw, 10px)",
                      color: "rgba(255,255,255,0.4)",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support + Newsletter */}
          <div style={{ textAlign: isMobile ? "center" : "left" }}>
            <h4 style={{
              fontFamily: "'Overpass Mono', monospace",
              fontSize: "clamp(7px, 3vw, 8px)",
              fontWeight: 600,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#C6A84B",
              marginBottom: "16px",
            }}>
              Support
            </h4>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: "20px" }}>
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.name} style={{ marginBottom: "10px" }}>
                  <a
                    href={link.href}
                    className="footer-link-hover"
                    style={{
                      fontSize: "clamp(9px, 3vw, 10px)",
                      color: "rgba(255,255,255,0.4)",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            
            <NewsletterSignup />
          </div>
        </div>
        
        {/* Middle Section - Contact Info + Social */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          padding: "30px 0",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          marginBottom: "30px",
        }}>
          {/* Contact Info */}
          <div style={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row", 
            flexWrap: "wrap", 
            gap: isMobile ? "16px" : "30px",
            alignItems: isMobile ? "center" : "flex-start",
            width: isMobile ? "100%" : "auto",
          }}>
            <div style={{ textAlign: isMobile ? "center" : "left" }}>
              <span style={{
                fontFamily: "'Overpass Mono', monospace",
                fontSize: "clamp(6px, 2.5vw, 7px)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                display: "block",
                marginBottom: "6px",
              }}>
                Phone / WhatsApp
              </span>
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} style={{
                fontSize: "clamp(10px, 3.5vw, 11px)",
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
              }}>
                {CONTACT_PHONE}
              </a>
            </div>
            
            <div style={{ textAlign: isMobile ? "center" : "left" }}>
              <span style={{
                fontFamily: "'Overpass Mono', monospace",
                fontSize: "clamp(6px, 2.5vw, 7px)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                display: "block",
                marginBottom: "6px",
              }}>
                Email
              </span>
              <a href={`mailto:${CONTACT_EMAIL}`} style={{
                fontSize: "clamp(10px, 3.5vw, 11px)",
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                wordBreak: "break-all",
              }}>
                {CONTACT_EMAIL}
              </a>
            </div>
            
            <div style={{ textAlign: isMobile ? "center" : "left" }}>
              <span style={{
                fontFamily: "'Overpass Mono', monospace",
                fontSize: "clamp(6px, 2.5vw, 7px)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                display: "block",
                marginBottom: "6px",
              }}>
                Location
              </span>
              <span style={{ fontSize: "clamp(10px, 3.5vw, 11px)", color: "rgba(255,255,255,0.5)" }}>
                {LOCATION}
              </span>
            </div>
          </div>
          
          {/* WhatsApp CTA */}
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "rgba(37,211,102,0.1)",
              border: "1px solid rgba(37,211,102,0.3)",
              padding: "10px 20px",
              fontSize: "clamp(7px, 2.5vw, 8px)",
              fontWeight: 600,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#25D366",
              textDecoration: "none",
              transition: "all 0.3s",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <span style={{ fontSize: "clamp(12px, 4vw, 14px)" }}>💬</span>
            Chat on WhatsApp
          </a>
        </div>
        
        {/* Bottom Section - Social + Copyright */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column-reverse" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}>
          {/* Social Links */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "clamp(32px, 8vw, 36px)",
                  height: "clamp(32px, 8vw, 36px)",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "50%",
                  fontSize: "clamp(14px, 4vw, 16px)",
                  textDecoration: "none",
                  transition: "all 0.3s",
                  color: hoveredSocial === social.name ? social.color : "rgba(255,255,255,0.35)",
                }}
                onMouseEnter={() => setHoveredSocial(social.name)}
                onMouseLeave={() => setHoveredSocial(null)}
              >
                {social.icon}
              </a>
            ))}
          </div>
          
          {/* Copyright */}
          <div style={{
            fontSize: "clamp(6px, 2.5vw, 8px)",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            textAlign: "center",
          }}>
            © {CURRENT_YEAR} Emmalex Autos & Logistics. PH, Nigeria.
          </div>
          
          {/* Back to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "clamp(32px, 8vw, 36px)",
              height: "clamp(32px, 8vw, 36px)",
              background: "rgba(198,168,75,0.1)",
              border: "1px solid rgba(198,168,75,0.2)",
              borderRadius: "50%",
              cursor: "pointer",
              transition: "all 0.3s",
              fontSize: "clamp(12px, 4vw, 14px)",
            }}
          >
            ↑
          </button>
        </div>
      </div>
      
      {/* Corner decorations */}
      <CornerTL accent="#C6A84B" />
      <CornerBR accent="#C6A84B" />
      
      {/* Bottom progress line */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(198,168,75,0.25), transparent)",
      }} />
    </footer>
  );
}