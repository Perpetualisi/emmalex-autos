import { useState, useEffect, useRef } from "react";

const navLinks = [
  { label: "Home",      href: "#home" },
  { label: "About Us",  href: "#about" },
  { label: "Cars",      href: "#cars" },
  { label: "Real Estate", href: "#realestate" },
  { label: "Equipment", href: "#equipment" },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [active,    setActive]    = useState("Home");
  const [time,      setTime]      = useState(() => new Date());
  const scanRef = useRef(null);

  /* scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* live clock — matches hero LiveClock */
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  /* scan beam animation on the nav bar */
  useEffect(() => {
    let x = -40;
    let raf;
    const tick = () => {
      x = x > 110 ? -40 : x + 0.18;
      if (scanRef.current) scanRef.current.style.left = `${x}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pad = n => String(n).padStart(2, "0");
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Overpass+Mono:wght@300;400;600&display=swap');

        /* ── ROOT ── */
        .nav-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          transition: all 0.5s cubic-bezier(0.4,0,0.2,1);
          font-family: 'Overpass Mono', monospace;
          overflow: hidden;
        }

        /* shimmer chrome top border — same animation as hero's ring glow */
        .nav-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            #666 15%,
            #bbb 30%,
            #e0e0e0 50%,
            #bbb 70%,
            #666 85%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: navShimmer 3.5s linear infinite;
          z-index: 10;
        }

        @keyframes navShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* scan beam travelling across the nav */
        .nav-scan {
          position: absolute;
          top: 0; bottom: 0;
          width: 80px;
          background: linear-gradient(90deg, transparent, rgba(198,168,75,0.06), transparent);
          pointer-events: none;
          z-index: 5;
          transition: none;
        }

        /* grid micro-lines inside nav */
        .nav-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 55px 55px;
          pointer-events: none;
          z-index: 1;
        }

        /* ── SCROLLED vs TOP states ── */
        .nav-root.at-top {
          background: linear-gradient(180deg,
            rgba(10,12,18,0.96) 0%,
            rgba(14,16,24,0.92) 100%
          );
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .nav-root.scrolled {
          background: linear-gradient(180deg,
            rgba(6,8,14,0.98) 0%,
            rgba(10,12,20,0.97) 100%
          );
          backdrop-filter: blur(28px);
          border-bottom: 1px solid rgba(198,168,75,0.12);
          box-shadow: 0 4px 40px rgba(0,0,0,0.55),
                      0 1px 0 rgba(198,168,75,0.08) inset;
        }

        /* ── INNER WRAPPER ── */
        .nav-inner {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 28px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 6;
        }

        /* ── LOGO ── */
        .logo-wrap {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          gap: 1px;
          flex-shrink: 0;
        }

        .logo-top {
          display: flex;
          align-items: baseline;
          gap: 0;
        }

        .logo-em {
          font-family: 'DM Serif Display', serif;
          font-weight: 400;
          font-style: italic;
          font-size: 24px;
          letter-spacing: 0.02em;
          color: #ffffff;
          line-height: 1;
        }

        .logo-lex {
          font-family: 'DM Serif Display', serif;
          font-weight: 400;
          font-style: normal;
          font-size: 24px;
          letter-spacing: 0.02em;
          color: rgba(255,255,255,0.38);
          line-height: 1;
        }

        .logo-autos {
          font-family: 'Overpass Mono', monospace;
          font-size: 7px;
          font-weight: 600;
          letter-spacing: 0.55em;
          text-transform: uppercase;
          color: #C6A84B;
          margin-top: 1px;
        }

        .logo-badge {
          font-family: 'Overpass Mono', monospace;
          font-size: 6px;
          font-weight: 300;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-top: 1px;
        }

        /* ── DESKTOP NAV LINKS ── */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .nav-link {
          font-family: 'Overpass Mono', monospace;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.32);
          text-decoration: none;
          position: relative;
          padding-bottom: 3px;
          transition: color 0.3s ease;
          white-space: nowrap;
        }

        /* animated underline */
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1px;
          background: #C6A84B;
          transition: width 0.35s cubic-bezier(0.16,1,0.3,1);
        }

        .nav-link:hover { color: rgba(255,255,255,0.85); }
        .nav-link:hover::after { width: 100%; }

        .nav-link.active {
          color: #C6A84B;
        }
        .nav-link.active::after { width: 100%; background: #C6A84B; }

        /* ── DIVIDER ORNAMENT ── */
        .ornament {
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.35;
          flex-shrink: 0;
        }
        .ornament-line {
          width: 24px; height: 1px;
          background: linear-gradient(90deg, transparent, #C6A84B);
        }
        .ornament-line.r {
          background: linear-gradient(90deg, #C6A84B, transparent);
        }
        .ornament-diamond {
          width: 4px; height: 4px;
          background: #C6A84B;
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        /* ── HUD CLOCK (right of links) ── */
        .nav-clock {
          font-family: 'Overpass Mono', monospace;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: #C6A84B;
          opacity: 0.6;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── CONTACT BUTTON ── */
        .contact-btn {
          font-family: 'Overpass Mono', monospace;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: #000;
          background: #C6A84B;
          border: none;
          padding: 10px 22px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.3s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .contact-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #e8c87a;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s ease;
        }

        .contact-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(198,168,75,0.35);
        }
        .contact-btn:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        .contact-btn span {
          position: relative;
          z-index: 1;
        }

        /* ── HAMBURGER ── */
        .ham-btn {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 8px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          z-index: 10;
          transition: border-color 0.3s;
        }
        .ham-btn:hover { border-color: rgba(198,168,75,0.4); }

        .ham-btn span {
          display: block;
          height: 1px;
          background: rgba(255,255,255,0.7);
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .ham-btn span:nth-child(1) { width: 22px; }
        .ham-btn span:nth-child(2) { width: 14px; background: #C6A84B; }
        .ham-btn span:nth-child(3) { width: 22px; }

        .ham-btn.open span:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); width: 22px; }
        .ham-btn.open span:nth-child(2) { opacity: 0; width: 0; }
        .ham-btn.open span:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); width: 22px; }

        /* ── MOBILE MENU ── */
        .mobile-menu {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease;
          position: relative;
          z-index: 5;
        }

        .mobile-menu.open {
          max-height: 520px;
          opacity: 1;
        }

        .mobile-menu-inner {
          border-top: 1px solid rgba(198,168,75,0.12);
          background: rgba(6,8,14,0.98);
          backdrop-filter: blur(28px);
          padding: 8px 28px 28px;
        }

        .mobile-shimmer {
          height: 1px;
          background: linear-gradient(90deg, transparent, #C6A84B, transparent);
          margin-bottom: 12px;
          opacity: 0.4;
        }

        .mobile-link {
          font-family: 'Overpass Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.38);
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: color 0.25s;
        }

        .mobile-link:hover,
        .mobile-link.active { color: #C6A84B; }

        .mobile-arrow {
          font-size: 12px;
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.25s;
          color: #C6A84B;
        }

        .mobile-link:hover .mobile-arrow,
        .mobile-link.active .mobile-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .mobile-contact {
          display: block;
          text-align: center;
          margin-top: 20px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1023px) {
          .nav-links { display: none !important; }
          .nav-clock { display: none !important; }
          .contact-btn.desktop { display: none !important; }
          .ham-btn { display: flex !important; }
        }

        @media (min-width: 1024px) {
          .ham-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }

        /* ── ACTIVE INDICATOR DOT ── */
        .active-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #C6A84B;
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .nav-link.active .active-dot { opacity: 1; }

        /* ── HUD corner bracket ── */
        .nav-hud-bracket {
          position: absolute;
          width: 8px; height: 8px;
          opacity: 0.3;
          pointer-events: none;
          z-index: 8;
        }
        .nav-hud-bracket.tl { top: 4px; left: 4px; border-top: 1px solid #C6A84B; border-left: 1px solid #C6A84B; }
        .nav-hud-bracket.tr { top: 4px; right: 4px; border-top: 1px solid #C6A84B; border-right: 1px solid #C6A84B; }
        .nav-hud-bracket.bl { bottom: 4px; left: 4px; border-bottom: 1px solid #C6A84B; border-left: 1px solid #C6A84B; }
        .nav-hud-bracket.br { bottom: 4px; right: 4px; border-bottom: 1px solid #C6A84B; border-right: 1px solid #C6A84B; }
      `}</style>

      {/* ══ NAV ROOT ══ */}
      <nav className={`nav-root ${scrolled ? "scrolled" : "at-top"}`}>

        {/* HUD corner brackets */}
        <div className="nav-hud-bracket tl" />
        <div className="nav-hud-bracket tr" />
        <div className="nav-hud-bracket bl" />
        <div className="nav-hud-bracket br" />

        {/* scan beam */}
        <div className="nav-scan" ref={scanRef} />

        {/* ── MAIN ROW ── */}
        <div className="nav-inner">

          {/* LOGO */}
          <a href="#home" className="logo-wrap" onClick={() => setActive("Home")}>
            <div className="logo-top">
              <span className="logo-em">Emma</span>
              <span className="logo-lex">lex</span>
            </div>
            <div className="logo-autos">Autos &amp; Logistics</div>
            <div className="logo-badge">Lagos · Abuja · Port Harcourt</div>
          </a>

          {/* DESKTOP NAV */}
          <div className="nav-links" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 32 }}>

            {/* left ornament */}
            <div className="ornament">
              <div className="ornament-line" />
              <div className="ornament-diamond" />
              <div className="ornament-line r" />
            </div>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`nav-link ${active === link.label ? "active" : ""}`}
                onClick={() => setActive(link.label)}
              >
                {link.label}
                <span className="active-dot" />
              </a>
            ))}

            {/* right ornament */}
            <div className="ornament">
              <div className="ornament-line" />
              <div className="ornament-diamond" />
              <div className="ornament-line r" />
            </div>
          </div>

          {/* RIGHT: clock + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexShrink: 0 }}>
            <div className="nav-clock">{timeStr}</div>

            <a href="#contact" className="contact-btn desktop" onClick={() => setActive("Contact")}>
              <span>Contact Us</span>
            </a>

            {/* HAMBURGER */}
            <button
              className={`ham-btn ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* ══ MOBILE MENU ══ */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <div className="mobile-menu-inner">
            <div className="mobile-shimmer" />

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`mobile-link ${active === link.label ? "active" : ""}`}
                onClick={() => { setActive(link.label); setMenuOpen(false); }}
              >
                {link.label}
                <span className="mobile-arrow">›</span>
              </a>
            ))}

            <a
              href="#contact"
              className="contact-btn mobile-contact"
              onClick={() => { setActive("Contact"); setMenuOpen(false); }}
            >
              <span>Contact Us</span>
            </a>

            {/* clock in mobile menu */}
            <div style={{
              marginTop: 16,
              fontFamily: "'Overpass Mono', monospace",
              fontSize: 8,
              letterSpacing: "0.4em",
              color: "rgba(198,168,75,0.5)",
              textAlign: "center",
            }}>
              {timeStr}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}