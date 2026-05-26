import { useEffect, useState, useCallback, lazy, Suspense } from "react";

/* ═══════════════════════════════════════════════════════════
   LAZY LOAD COMPONENTS FOR FASTER INITIAL LOAD
═══════════════════════════════════════════════════════════ */
const About = lazy(() => import("./components/About"));
const Cars = lazy(() => import("./components/Cars"));
const Contact = lazy(() => import("./components/Contact"));
const Equipment = lazy(() => import("./components/Equipment"));
const Footer = lazy(() => import("./components/Footer"));
const Hero = lazy(() => import("./components/Hero"));
const Navbar = lazy(() => import("./components/Navbar"));
const RealEstate = lazy(() => import("./components/Realestate"));

/* ═══════════════════════════════════════════════════════════
   LOADING FALLBACK COMPONENT
═══════════════════════════════════════════════════════════ */
const SectionLoader = () => (
  <div style={{
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
  }}>
    <div style={{
      width: "40px",
      height: "40px",
      border: "2px solid rgba(198,168,75,0.2)",
      borderTopColor: "#C6A84B",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   SCROLL PROGRESS INDICATOR - OPTIMIZED
═══════════════════════════════════════════════════════════ */
const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const updateProgress = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
          const percent = (scrolled / maxHeight) * 100;
          setProgress(percent);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "2px",
      background: "rgba(255,255,255,0.03)",
      zIndex: 1000,
    }}>
      <div style={{
        width: `${progress}%`,
        height: "100%",
        background: "linear-gradient(90deg, #C6A84B, #E8C87A, #C6A84B)",
        backgroundSize: "200% auto",
        transition: "width 0.1s ease-out",
        animation: "shimmer 1.5s linear infinite",
      }} />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   CURSOR GLOW EFFECT - WITH PERFORMANCE OPTIMIZATION
═══════════════════════════════════════════════════════════ */
const CursorGlow = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    let rafId = null;
    const updatePosition = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        if (!isVisible) setIsVisible(true);
        rafId = null;
      });
    };
    
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    if (!isMobile) {
      window.addEventListener("mousemove", updatePosition, { passive: true });
      document.body.addEventListener("mouseleave", handleMouseLeave);
      document.body.addEventListener("mouseenter", handleMouseEnter);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", updatePosition);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile, isVisible]);

  if (isMobile || !isVisible) return null;

  return (
    <>
      <div style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9998,
        left: position.x - 150,
        top: position.y - 150,
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(198,168,75,0.06) 0%, rgba(198,168,75,0.02) 40%, transparent 70%)",
        borderRadius: "50%",
        willChange: "transform",
      }} />
      <div style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9999,
        left: position.x - 3,
        top: position.y - 3,
        width: "6px",
        height: "6px",
        background: "#C6A84B",
        borderRadius: "50%",
        opacity: 0.6,
        willChange: "transform",
      }} />
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   SCROLL TO TOP BUTTON - WITH SMOOTH ANIMATION
═══════════════════════════════════════════════════════════ */
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const toggleVisibility = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsVisible(window.scrollY > 500);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{
        position: "fixed",
        bottom: "32px",
        right: "32px",
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "rgba(0,0,0,0.85)",
        border: "1px solid rgba(198,168,75,0.3)",
        backdropFilter: "blur(12px)",
        cursor: "pointer",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: 0,
        animation: "fadeInUp 0.4s ease forwards",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(198,168,75,0.15)";
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "#C6A84B";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(0,0,0,0.85)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(198,168,75,0.3)";
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6A84B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════
   LOADING SCREEN - WITH MINIMAL DELAY
═══════════════════════════════════════════════════════════ */
const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Shorter loading time for better UX
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "#000",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "fadeOut 0.6s ease forwards 0.8s",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "2px solid rgba(198,168,75,0.2)",
          borderTopColor: "#C6A84B",
          borderRightColor: "#E8C87A",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
          marginBottom: "20px",
        }} />
        <div style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "12px",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "#C6A84B",
        }}>
          Emmalex
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SECTION OBSERVER - OPTIMIZED FOR PERFORMANCE
═══════════════════════════════════════════════════════════ */
const useSectionObserver = (sections) => {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const observers = [];
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("id");
          setActiveSection(sectionId);
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.3,
      rootMargin: "-80px 0px -80px 0px",
    });
    
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
        observers.push(element);
      }
    });

    return () => {
      observers.forEach((element) => observer.unobserve(element));
    };
  }, [sections]);

  return activeSection;
};

/* ═══════════════════════════════════════════════════════════
   PREMIUM FEATURE: BREATHING BACKGROUND EFFECT
═══════════════════════════════════════════════════════════ */
const BackgroundAmbient = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none",
      zIndex: 0,
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: `${mousePosition.y * 100}%`,
        left: `${mousePosition.x * 100}%`,
        width: "800px",
        height: "800px",
        background: "radial-gradient(circle, rgba(198,168,75,0.04) 0%, transparent 60%)",
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        transition: "top 0.3s ease-out, left 0.3s ease-out",
        willChange: "top, left",
      }} />
      <div style={{
        position: "absolute",
        top: "20%",
        left: "-10%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(100,150,255,0.02) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 20s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "-5%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(255,100,100,0.02) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 25s ease-in-out infinite reverse",
      }} />
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(50px, 30px); }
        }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PREMIUM FEATURE: KEYBOARD SHORTCUTS HINT
═══════════════════════════════════════════════════════════ */
const KeyboardHints = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    const hideTimer = setTimeout(() => setVisible(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "100px",
      right: "32px",
      zIndex: 99,
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(198,168,75,0.2)",
      borderRadius: "8px",
      padding: "10px 16px",
      fontSize: "9px",
      fontFamily: "'Overpass Mono', monospace",
      color: "rgba(255,255,255,0.5)",
      letterSpacing: "0.3em",
      animation: "slideInRight 0.3s ease, fadeOut 0.3s ease 4.7s forwards",
    }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span>⌘K</span>
        <span style={{ width: "1px", height: "10px", background: "rgba(255,255,255,0.2)" }} />
        <span>↑↓ Navigate</span>
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN APP COMPONENT
═══════════════════════════════════════════════════════════ */
function App() {
  const sections = ["home", "about", "cars", "realestate", "equipment", "contact"];
  const activeSection = useSectionObserver(sections);

  // Smooth scroll handler
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;
      
      const hash = target.getAttribute("href");
      if (hash === "#" || hash === "") return;
      
      const element = document.querySelector(hash);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", hash);
      }
    };
    
    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  // Keyboard navigation with cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command/Ctrl + K for quick navigation
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const sectionsList = sections.map(s => s.toUpperCase());
        const currentIndex = sections.indexOf(activeSection);
        const nextSection = sections[(currentIndex + 1) % sections.length];
        const element = document.getElementById(nextSection);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      
      // Arrow keys for section navigation
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const currentIndex = sections.indexOf(activeSection);
        if (currentIndex !== -1) {
          const nextIndex = e.key === "ArrowDown" 
            ? Math.min(currentIndex + 1, sections.length - 1)
            : Math.max(currentIndex - 1, 0);
          if (nextIndex !== currentIndex) {
            const nextSection = document.getElementById(sections[nextIndex]);
            if (nextSection) {
              e.preventDefault();
              nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        }
      }
      
      // Escape key - scroll to top
      if (e.key === "Escape") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      
      // Home key - scroll to top
      if (e.key === "Home") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection, sections]);

  // Preload critical assets
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        // Preload critical fonts and assets
        const links = [
          "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap",
        ];
        links.forEach(href => {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "style";
          link.href = href;
          document.head.appendChild(link);
        });
      });
    }
  }, []);

  return (
    <>
      <LoadingScreen />
      <BackgroundAmbient />
      <ScrollProgress />
      <CursorGlow />
      <KeyboardHints />
      
      <Suspense fallback={<SectionLoader />}>
        <Navbar activeSection={activeSection} />
      </Suspense>
      
      <main style={{ position: "relative", zIndex: 1 }}>
        <section id="home">
          <Suspense fallback={<SectionLoader />}>
            <Hero />
          </Suspense>
        </section>
        
        <section id="about">
          <Suspense fallback={<SectionLoader />}>
            <About />
          </Suspense>
        </section>
        
        <section id="cars">
          <Suspense fallback={<SectionLoader />}>
            <Cars />
          </Suspense>
        </section>
        
        <section id="realestate">
          <Suspense fallback={<SectionLoader />}>
            <RealEstate />
          </Suspense>
        </section>
        
        <section id="equipment">
          <Suspense fallback={<SectionLoader />}>
            <Equipment />
          </Suspense>
        </section>
        
        <section id="contact">
          <Suspense fallback={<SectionLoader />}>
            <Contact />
          </Suspense>
        </section>
      </main>
      
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      
      <ScrollToTop />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Overpass+Mono:wght@300;400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        html {
          scroll-behavior: smooth;
          scroll-padding-top: 80px;
        }
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: #000;
          overflow-x: hidden;
        }
        
        section {
          position: relative;
          scroll-margin-top: 80px;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(198, 168, 75, 0.4);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(198, 168, 75, 0.6);
        }
        
        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        :focus-visible {
          outline: 2px solid #C6A84B;
          outline-offset: 2px;
        }
        
        ::selection {
          background: rgba(198, 168, 75, 0.25);
          color: #C6A84B;
        }
        
        /* Progressive section loading */
        section {
          opacity: 0;
          animation: fadeIn 0.5s ease forwards;
        }
        
        section:nth-child(1) { animation-delay: 0.05s; }
        section:nth-child(2) { animation-delay: 0.1s; }
        section:nth-child(3) { animation-delay: 0.15s; }
        section:nth-child(4) { animation-delay: 0.2s; }
        section:nth-child(5) { animation-delay: 0.25s; }
        section:nth-child(6) { animation-delay: 0.3s; }
        
        /* Performance optimizations */
        img, video, canvas {
          content-visibility: auto;
        }
        
        @media (max-width: 768px) {
          section {
            scroll-margin-top: 60px;
          }
        }
      `}</style>
    </>
  );
}

export default App;