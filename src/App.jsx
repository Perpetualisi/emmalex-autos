import { useEffect, useState, useCallback } from "react";
import About from "./components/About";
import Cars from "./components/Cars";
import Contact from "./components/Contact";
import Equipment from "./components/Equipment";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import RealEstate from "./components/Realestate";  // ← Changed to capital R

/* ═══════════════════════════════════════════════════════════
   SCROLL PROGRESS INDICATOR
═══════════════════════════════════════════════════════════ */
const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = (scrolled / maxHeight) * 100;
      setProgress(percent);
    };
    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "2px",
      background: "rgba(255,255,255,0.05)",
      zIndex: 1000,
    }}>
      <div style={{
        width: `${progress}%`,
        height: "100%",
        background: "linear-gradient(90deg, #C6A84B, #E8C87A, #C6A84B)",
        backgroundSize: "200% auto",
        transition: "width 0.1s ease",
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
   CURSOR GLOW EFFECT
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
    
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    if (!isMobile) {
      window.addEventListener("mousemove", updatePosition);
      document.body.addEventListener("mouseleave", handleMouseLeave);
      document.body.addEventListener("mouseenter", handleMouseEnter);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", updatePosition);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
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
        background: "radial-gradient(circle, rgba(198,168,75,0.08) 0%, rgba(198,168,75,0.03) 40%, transparent 70%)",
        borderRadius: "50%",
        transition: "transform 0.05s ease",
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
        opacity: 0.5,
        transition: "transform 0.05s ease",
      }} />
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   SCROLL TO TOP BUTTON
═══════════════════════════════════════════════════════════ */
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", toggleVisibility);
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
   LOADING SCREEN
═══════════════════════════════════════════════════════════ */
const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
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
      animation: "fadeOut 0.8s ease forwards 1.2s",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "2px solid rgba(198,168,75,0.2)",
          borderTopColor: "#C6A84B",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          marginBottom: "20px",
        }} />
        <div style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "14px",
          letterSpacing: "0.3em",
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
   SECTION OBSERVER (for active nav highlighting)
═══════════════════════════════════════════════════════════ */
const useSectionObserver = (sections) => {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observers = sections.map((sectionId) => {
      const element = document.getElementById(sectionId);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(sectionId);
          }
        },
        { threshold: 0.3, rootMargin: "-80px 0px -80px 0px" }
      );
      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [sections]);

  return activeSection;
};

/* ═══════════════════════════════════════════════════════════
   MAIN APP COMPONENT
═══════════════════════════════════════════════════════════ */
function App() {
  const sections = ["home", "about", "cars", "realestate", "equipment", "contact"];
  const activeSection = useSectionObserver(sections);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        console.log("Quick navigation - Command palette would open");
      }
      
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
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection, sections]);

  return (
    <>
      <LoadingScreen />
      <ScrollProgress />
      <CursorGlow />
      
      <Navbar activeSection={activeSection} />
      
      <main>
        <section id="home">
          <Hero />
        </section>
        
        <section id="about">
          <About />
        </section>
        
        <section id="cars">
          <Cars />
        </section>
        
        <section id="realestate">
          <RealEstate />
        </section>
        
        <section id="equipment">
          <Equipment />
        </section>
        
        <section id="contact">
          <Contact />
        </section>
      </main>
      
      <Footer />
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
          background: rgba(255, 255, 255, 0.03);
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
        
        section {
          opacity: 0;
          animation: fadeIn 0.6s ease forwards;
        }
        
        section:nth-child(1) { animation-delay: 0.1s; }
        section:nth-child(2) { animation-delay: 0.2s; }
        section:nth-child(3) { animation-delay: 0.3s; }
        section:nth-child(4) { animation-delay: 0.4s; }
        section:nth-child(5) { animation-delay: 0.5s; }
        section:nth-child(6) { animation-delay: 0.6s; }
      `}</style>
    </>
  );
}

export default App;