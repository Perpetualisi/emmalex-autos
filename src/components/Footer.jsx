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
   3D SCENE COMPONENT - Premium Floating Orbs
═══════════════════════════════════════════════════════════ */
function Footer3DScene() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const frameRef = useRef(null);
  const particlesRef = useRef(null);
  const orbsRef = useRef([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    
    // Main directional light
    const keyLight = new THREE.DirectionalLight(0xfff8e0, 1.8);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = false;
    scene.add(keyLight);
    
    // Fill light
    const fillLight = new THREE.PointLight(0x88aaff, 0.6);
    fillLight.position.set(-2, 1, 3);
    scene.add(fillLight);
    
    // Gold accent light
    const goldLight = new THREE.PointLight(0xc6a84b, 0.8);
    goldLight.position.set(1, 2, 2);
    scene.add(goldLight);
    
    // Back rim light
    const rimLight = new THREE.PointLight(0xffaa66, 0.5);
    rimLight.position.set(0, 1, -4);
    scene.add(rimLight);

    // Create floating orbs
    const orbColors = [0xc6a84b, 0x5599ff, 0xf5c518, 0xff6688, 0x44cc88];
    const orbs = [];
    
    for (let i = 0; i < 12; i++) {
      const size = 0.08 + Math.random() * 0.12;
      const material = new THREE.MeshStandardMaterial({
        color: orbColors[Math.floor(Math.random() * orbColors.length)],
        metalness: 0.85,
        roughness: 0.15,
        emissive: 0x442200,
        emissiveIntensity: 0.15,
      });
      
      const orb = new THREE.Mesh(new THREE.SphereGeometry(size, 32, 32), material);
      orb.userData = {
        speedX: (Math.random() - 0.5) * 0.008,
        speedY: (Math.random() - 0.5) * 0.008,
        speedZ: (Math.random() - 0.5) * 0.004,
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

    // Particle system (dust motes)
    const particleCount = 600;
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
      size: 0.008,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Decorative wireframe rings
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xc6a84b, transparent: true, opacity: 0.12, wireframe: true });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.02, 32, 100), ringMaterial);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);
    
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.015, 32, 120), ringMaterial);
    ring2.rotation.z = Math.PI / 3;
    ring2.rotation.x = Math.PI / 4;
    scene.add(ring2);
    
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.01, 32, 140), ringMaterial);
    ring3.rotation.x = Math.PI / 3;
    ring3.rotation.z = Math.PI / 6;
    scene.add(ring3);

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    
    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    mount.addEventListener("mousemove", onMouseMove);

    // Animation loop
    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.016;
      timeRef.current = time;
      
      // Smooth camera rotation based on mouse
      targetRotationX += (mouseY * 0.3 - targetRotationX) * 0.05;
      targetRotationY += (mouseX * 0.5 - targetRotationY) * 0.05;
      camera.position.x += (targetRotationY * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (targetRotationX * 1.2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
      
      // Animate orbs
      orbs.forEach((orb, idx) => {
        const data = orb.userData;
        data.angleX += data.speedX;
        data.angleY += data.speedY;
        data.angleZ += data.speedZ;
        
        orb.position.x = Math.sin(data.angleX) * data.radiusX;
        orb.position.y = Math.cos(data.angleY) * data.radiusY;
        orb.position.z = Math.sin(data.angleZ) * data.radiusZ;
        
        // Pulsing scale
        const scale = 1 + Math.sin(time * 2 + idx) * 0.15;
        orb.scale.set(scale, scale, scale);
      });
      
      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.02;
        particlesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
      }
      
      // Animate rings
      ring1.rotation.z += 0.002;
      ring2.rotation.x += 0.0015;
      ring2.rotation.y += 0.001;
      ring3.rotation.x -= 0.001;
      ring3.rotation.z += 0.002;
      
      // Pulsing lights
      goldLight.intensity = 0.7 + Math.sin(time * 1.5) * 0.2;
      rimLight.intensity = 0.4 + Math.cos(time * 1.2) * 0.15;
      
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

/* ═══════════════════════════════════════════════════════════
   SVG DECORATIONS
═══════════════════════════════════════════════════════════ */
const CornerTL = ({ accent }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ position: "absolute", top: 0, left: 0, opacity: 0.35, pointerEvents: "none", zIndex: 10 }}>
    <path d="M0 40 L0 0 L40 0" stroke={accent} strokeWidth="0.8" fill="none"/>
    <circle cx="0" cy="0" r="2.5" fill={accent} opacity="0.8"/>
  </svg>
);

const CornerBR = ({ accent }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.35, pointerEvents: "none", zIndex: 10 }}>
    <path d="M40 0 L40 40 L0 40" stroke={accent} strokeWidth="0.8" fill="none"/>
    <circle cx="40" cy="40" r="2.5" fill={accent} opacity="0.8"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   NEWSLETTER SIGNUP
═══════════════════════════════════════════════════════════ */
function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Open WhatsApp with newsletter inquiry
      const waMsg = `Hello Emmalex! I'm interested in your newsletter and updates. My email is ${email}`;
      window.open(`${WA_URL}?text=${encodeURIComponent(waMsg)}`, "_blank");
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };
  
  return (
    <div style={{ marginTop: "var(--space-xl)" }}>
      <h4 style={{
        fontFamily: "var(--font-mono)",
        fontSize: "8px",
        fontWeight: 600,
        letterSpacing: "0.45em",
        textTransform: "uppercase",
        color: "var(--brand-gold)",
        marginBottom: "var(--space-md)",
      }}>
        Newsletter
      </h4>
      <p style={{
        fontSize: "10px",
        color: "var(--text-tertiary)",
        marginBottom: "var(--space-md)",
        lineHeight: 1.6,
      }}>
        Subscribe for exclusive offers and updates.
      </p>
      
      {subscribed ? (
        <div style={{
          background: "rgba(37,211,102,0.15)",
          border: "1px solid rgba(37,211,102,0.3)",
          padding: "12px",
          textAlign: "center",
          fontSize: "9px",
          color: "#25D366",
        }}>
          ✓ WhatsApp opened! Send your email to subscribe.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "12px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "#fff",
              outline: "none",
              transition: "all 0.3s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#C6A84B"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
          <button
            type="submit"
            style={{
              background: "var(--brand-gold)",
              border: "none",
              padding: "0 18px",
              fontFamily: "var(--font-mono)",
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#000",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN FOOTER COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Footer() {
  const [scanY, setScanY] = useState(20);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  
  useEffect(() => {
    let y = 20, raf;
    const tick = () => { y = (y + 0.05) % 100; setScanY(y); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <footer style={{
      background: "#000",
      position: "relative",
      overflow: "hidden",
      fontFamily: "var(--font-sans)",
      borderTop: "1px solid rgba(255,255,255,0.04)",
    }}>
      {/* Animated scan line */}
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.008) 50%, transparent 100%)",
        backgroundSize: "100% 220px",
        animation: "footerScanMove 9s linear infinite",
      }} />
      
      {/* Scanning beam */}
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: `${scanY}%`,
        height: "60px",
        background: "linear-gradient(to bottom, transparent, rgba(198,168,75,0.04), transparent)",
        pointerEvents: "none",
        zIndex: 2,
      }} />
      
      <style>{`
        @keyframes footerScanMove {
          from { background-position: 0 -200px; }
          to { background-position: 0 100%; }
        }
        
        @keyframes footerFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
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
          background: var(--brand-gold);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .footer-link-hover:hover::after {
          width: 100%;
        }
        
        .social-icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        
        .social-icon:hover {
          transform: translateY(-3px);
        }
      `}</style>
      
      {/* 3D Background Canvas */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity: 0.35,
      }}>
        <Footer3DScene />
      </div>
      
      {/* Main Footer Content */}
      <div style={{
        position: "relative",
        zIndex: 5,
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "clamp(48px, 8vw, 80px) 5% 40px",
      }}>
        
        {/* Top Section - Logo + Description */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: "clamp(32px, 5vw, 60px)",
          marginBottom: "clamp(40px, 6vw, 60px)",
        }} className="footer-grid">
          
          {/* Brand Column */}
          <div>
            <div style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "var(--brand-gold)",
              letterSpacing: "-0.01em",
              marginBottom: "var(--space-md)",
            }}>
              Emmalex<span style={{ color: "#fff", fontWeight: 300 }}>.</span>
            </div>
            <p style={{
              fontSize: "10px",
              color: "var(--text-tertiary)",
              lineHeight: 1.8,
              marginBottom: "var(--space-lg)",
              maxWidth: "280px",
            }}>
              Premium vehicles, prime real estate, and heavy equipment leasing — serving Nigeria with excellence since 2022.
            </p>
            
            {/* Trust Badges */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["✓ Verified", "✓ Trusted", "✓ Licensed"].map((badge) => (
                <div key={badge} style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "6.5px",
                  fontWeight: 600,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(198,168,75,0.6)",
                  border: "1px solid rgba(198,168,75,0.15)",
                  padding: "4px 8px",
                }}>
                  {badge}
                </div>
              ))}
            </div>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 style={{
              fontFamily: "var(--font-mono)",
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "var(--brand-gold)",
              marginBottom: "var(--space-lg)",
            }}>
              Company
            </h4>
            <ul style={{ listStyle: "none" }}>
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name} style={{ marginBottom: "var(--space-sm)" }}>
                  <a
                    href={link.href}
                    className="footer-link-hover"
                    style={{
                      fontSize: "10px",
                      color: "var(--text-tertiary)",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#C6A84B"}
                    onMouseLeave={(e) => e.currentTarget.style.color = ""}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services Links */}
          <div>
            <h4 style={{
              fontFamily: "var(--font-mono)",
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "var(--brand-gold)",
              marginBottom: "var(--space-lg)",
            }}>
              Services
            </h4>
            <ul style={{ listStyle: "none" }}>
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.name} style={{ marginBottom: "var(--space-sm)" }}>
                  <a
                    href={link.href}
                    className="footer-link-hover"
                    style={{
                      fontSize: "10px",
                      color: "var(--text-tertiary)",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#C6A84B"}
                    onMouseLeave={(e) => e.currentTarget.style.color = ""}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support + Newsletter */}
          <div>
            <h4 style={{
              fontFamily: "var(--font-mono)",
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "var(--brand-gold)",
              marginBottom: "var(--space-lg)",
            }}>
              Support
            </h4>
            <ul style={{ listStyle: "none", marginBottom: "var(--space-xl)" }}>
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.name} style={{ marginBottom: "var(--space-sm)" }}>
                  <a
                    href={link.href}
                    className="footer-link-hover"
                    style={{
                      fontSize: "10px",
                      color: "var(--text-tertiary)",
                      textDecoration: "none",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#C6A84B"}
                    onMouseLeave={(e) => e.currentTarget.style.color = ""}
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
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-lg)",
          padding: "var(--space-xl) 0",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          marginBottom: "var(--space-xl)",
        }}>
          {/* Contact Info - UPDATED */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xl)" }}>
            <div>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "7px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "var(--space-sm)",
              }}>
                Phone / WhatsApp
              </span>
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.3s",
              }} onMouseEnter={(e) => e.currentTarget.style.color = "#C6A84B"} onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                {CONTACT_PHONE}
              </a>
            </div>
            
            <div>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "7px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "var(--space-sm)",
              }}>
                Email
              </span>
              <a href={`mailto:${CONTACT_EMAIL}`} style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.3s",
              }} onMouseEnter={(e) => e.currentTarget.style.color = "#C6A84B"} onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                {CONTACT_EMAIL}
              </a>
            </div>
            
            <div>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "7px",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "var(--space-sm)",
              }}>
                Location
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
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
              gap: "8px",
              background: "rgba(37,211,102,0.1)",
              border: "1px solid rgba(37,211,102,0.3)",
              padding: "10px 20px",
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#25D366",
              textDecoration: "none",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(37,211,102,0.2)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(37,211,102,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: "14px" }}>💬</span>
            Chat on WhatsApp
          </a>
        </div>
        
        {/* Bottom Section - Social + Copyright */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-md)",
        }}>
          {/* Social Links */}
          <div style={{ display: "flex", gap: "var(--space-md)" }}>
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
                  width: "36px",
                  height: "36px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "50%",
                  fontSize: "16px",
                  textDecoration: "none",
                  transition: "all 0.3s",
                  color: hoveredSocial === social.name ? social.color : "rgba(255,255,255,0.4)",
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
            fontSize: "8px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            textAlign: "center",
          }}>
            © {CURRENT_YEAR} Emmalex Autos & Logistics. Port Harcourt, Nigeria.
          </div>
          
          {/* Back to Top Button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              background: "rgba(198,168,75,0.1)",
              border: "1px solid rgba(198,168,75,0.2)",
              borderRadius: "50%",
              cursor: "pointer",
              transition: "all 0.3s",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(198,168,75,0.2)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(198,168,75,0.1)";
              e.currentTarget.style.transform = "translateY(0)";
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
        background: "linear-gradient(90deg, transparent, rgba(198,168,75,0.3), transparent)",
      }} />
    </footer>
  );
}