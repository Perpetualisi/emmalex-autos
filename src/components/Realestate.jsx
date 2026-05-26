import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/* ══════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════ */
const WA_NUMBER = "2347034627308";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;
const WA_MSG = (p) =>
  `${WA_BASE}?text=${encodeURIComponent(`Hello! I'm interested in ${p.title} at ${p.address}. Please send more details.`)}`;
const WA_OTHER = `${WA_BASE}?text=${encodeURIComponent(`Hello! I'd like to explore your full luxury property portfolio. Please share your listings.`)}`;

/* ══════════════════════════════════════════════
   PROPERTIES DATA (PRICES REMOVED)
══════════════════════════════════════════════ */
const PROPERTIES = [
  {
    id: 1, title: "Burj Khalifa Sky Penthouse", address: "Downtown Dubai",
    category: "Penthouse", tag: "ULTRA LUX",
    specs: ["7,200 sq.ft", "5 Beds", "6 Baths", "Panoramic"],
    bodyColor: 0x1a1a2e, accentColor: 0xffcc44, accentHex: "#FFCC44",
    style: "ultramodern", sceneType: "city_night",
    description: "The pinnacle of luxury living at the 148th floor with unparalleled views of the Dubai skyline and Arabian Gulf.",
    amenities: ["Helipad Access", "Private Elevator", "Infinity Pool", "Smart Home"],
  },
  {
    id: 2, title: "Palm Jumeirah Signature Villa", address: "Frond G, Palm Jumeirah",
    category: "Luxury Villa", tag: "BEACHFRONT",
    specs: ["9,500 sq.ft", "6 Beds", "8 Baths", "Private Beach"],
    bodyColor: 0xf5e6d3, accentColor: 0x44ccff, accentHex: "#44CCFF",
    style: "mediterranean", sceneType: "beach_paradise",
    description: "Oceanfront masterpiece with infinity pool, private beach, and breathtaking sunset views over the Arabian Gulf.",
    amenities: ["Boat Dock", "Beach Club", "Wine Cellar", "Cinema Room"],
  },
  {
    id: 3, title: "Emirates Hills Mansion", address: "Emirates Hills, Dubai",
    category: "Luxury Mansion", tag: "GOLF COURSE",
    specs: ["15,000 sq.ft", "7 Beds", "9 Baths", "Golf View"],
    bodyColor: 0xd4b896, accentColor: 0xffaa66, accentHex: "#FFAA66",
    style: "mediterranean", sceneType: "desert_evening",
    description: "Architectural masterpiece overlooking the world-class Montgomerie Golf Course. The address of billionaires.",
    amenities: ["Golf Membership", "Tennis Court", "Spa", "Guest Pavilion"],
  },
  {
    id: 4, title: "Dubai Marina Infinity Tower", address: "Dubai Marina",
    category: "Modern Apartment", tag: "WATERFRONT",
    specs: ["2,400 sq.ft", "3 Beds", "4 Baths", "Marina View"],
    bodyColor: 0x2c3e50, accentColor: 0x66ccff, accentHex: "#66CCFF",
    style: "contemporary", sceneType: "marina",
    description: "Sleek modern living with panoramic marina and sea views. Resort-style amenities in the heart of the city.",
    amenities: ["Sky Lounge", "Concierge", "Gym & Spa", "Valet Parking"],
  },
  {
    id: 5, title: "Al Barari Nature Retreat", address: "Al Barari, Dubai",
    category: "Eco Luxury Villa", tag: "ECO LUXURY",
    specs: ["10,500 sq.ft", "6 Beds", "7 Baths", "Botanical"],
    bodyColor: 0xd4c4a8, accentColor: 0x66ff88, accentHex: "#66FF88",
    style: "tropical", sceneType: "forest",
    description: "Surrounded by 60% lush greenery, this sanctuary offers unparalleled privacy, natural beauty and serenity.",
    amenities: ["Botanical Garden", "Organic Farm", "Meditation Deck", "Biophilic Design"],
  },
];

/* ══════════════════════════════════════════════
   MATERIAL HELPERS (BRIGHTER VERSIONS)
══════════════════════════════════════════════ */
const M = {
  std:    (c, r=0.4, m=0.1) => new THREE.MeshStandardMaterial({ color:c, roughness:r, metalness:m }),
  metal:  (c, r=0.08, m=0.96) => new THREE.MeshStandardMaterial({ color:c, roughness:r, metalness:m }),
  glass:  (op=0.75, c=0xcceeff) => new THREE.MeshStandardMaterial({ color:c, roughness:0.03, metalness:0.95, transparent:true, opacity:op }),
  water:  (c=0x3399bb) => new THREE.MeshStandardMaterial({ color:c, roughness:0.05, metalness:0.9, transparent:true, opacity:0.92 }),
  emissv: (c, i=1.2) => new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:i }),
  gold:   () => new THREE.MeshStandardMaterial({ color:0xffdd77, roughness:0.12, metalness:0.98, emissive:0x442200, emissiveIntensity:0.15 }),
  bright: (c, i=0.6) => new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:i, roughness:0.2 }),
};

/* ══════════════════════════════════════════════
   SCENE ENVIRONMENT BUILDERS (BRIGHTER)
══════════════════════════════════════════════ */
function mkParticles(scene, n, spread, yRange, color, size, opacity, additive=false) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i*3]   = (Math.random()-0.5)*spread;
    pos[i*3+1] = Math.random()*yRange - 1;
    pos[i*3+2] = (Math.random()-0.5)*spread*0.75;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color, size, transparent:true, opacity,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
}

function buildCityNight(scene, ac) {
  scene.background = new THREE.Color(0x0a0a2a);
  scene.fog = new THREE.FogExp2(0x0a0a2a, 0.003);
  scene.add(new THREE.AmbientLight(0x335588, 0.8));
  const key = new THREE.PointLight(0xaaddff, 1.8, 50); key.position.set(0,5,7); scene.add(key);
  const n1  = new THREE.PointLight(ac, 1.2, 28); n1.position.set(-3,2,5); scene.add(n1);
  const n2  = new THREE.PointLight(ac, 0.9, 24); n2.position.set(4,1.2,4); scene.add(n2);
  const fill = new THREE.PointLight(0x88aaff, 0.7); fill.position.set(1,3,2); scene.add(fill);
  mkParticles(scene, 800, 35, 12, 0xffdd99, 0.018, 0.6, true);
  mkParticles(scene, 800, 90, 35, 0xffffff, 0.028, 0.7);
  return { n1, n2, update(t) { n1.intensity = 1.0+Math.sin(t*1.2)*0.15; n2.intensity = 0.75+Math.sin(t*1.8+1)*0.12; } };
}

function buildBeachScene(scene, ac) {
  scene.background = new THREE.Color(0x0a7a9a);
  scene.fog = new THREE.FogExp2(0x0a7a9a, 0.004);
  scene.add(new THREE.AmbientLight(0x88ccff, 0.9));
  const sun = new THREE.PointLight(0xffcc88, 2.5, 65); sun.position.set(6,10,-10); scene.add(sun);
  const fill = new THREE.PointLight(0x88ddff, 0.9, 35); fill.position.set(2,3,4); scene.add(fill);
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(32,32,50,50), M.water(0x2a8aaa));
  ocean.rotation.x=-Math.PI/2; ocean.position.y=-1.1; scene.add(ocean);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(32,32), M.std(0xeeddbb,0.85,0.05));
  sand.rotation.x=-Math.PI/2; sand.position.y=-1.15; scene.add(sand);
  // More palm trees
  for (let i=0;i<8;i++) {
    const a=(i/8)*Math.PI*2+0.4; const r=5.0+Math.random()*1.5;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,2.4,8),M.std(0x9b7340,0.5));
    trunk.position.set(Math.cos(a)*r,0,Math.sin(a)*r); trunk.rotation.z=(Math.random()-0.5)*0.3; scene.add(trunk);
    const fronds=new THREE.Mesh(new THREE.ConeGeometry(1.1,0.6,8),M.std(0x3a9a3a,0.7));
    fronds.position.set(Math.cos(a)*r+trunk.rotation.z*0.5,1.3,Math.sin(a)*r); scene.add(fronds);
  }
  mkParticles(scene, 300, 14, 7, 0xffeebb, 0.06, 0.35, true);
  return { sun, ocean, update(t) { sun.intensity=2.2+Math.sin(t*0.4)*0.25; const p=ocean.geometry.attributes.position.array; for(let i=0;i<p.length/3;i++) p[i*3+1]=Math.sin(t*0.9+i*0.1)*0.06; ocean.geometry.attributes.position.needsUpdate=true; } };
}

function buildDesertScene(scene) {
  scene.background = new THREE.Color(0x2a1508);
  scene.fog = new THREE.FogExp2(0x2a1508, 0.003);
  scene.add(new THREE.AmbientLight(0x442200, 0.7));
  const sun=new THREE.PointLight(0xffaa66,2.2,60); sun.position.set(7,7,-12); scene.add(sun);
  const fill=new THREE.PointLight(0xffcc88,0.8,40); fill.position.set(-2,3,5); scene.add(fill);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(35,35),M.std(0xccaa77,0.9));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-1.1; scene.add(gnd);
  for(let i=0;i<8;i++) {
    const d=new THREE.Mesh(new THREE.SphereGeometry(1.8+Math.random()*2.5,20,10),M.std(0xddbb88,0.88));
    d.scale.y=0.2; d.position.set((Math.random()-0.5)*14,-1.0,-5-Math.random()*8); scene.add(d);
  }
  mkParticles(scene,800,100,30,0xffeedd,0.035,0.75);
  return { sun, update(t){ sun.intensity=2.0+Math.sin(t*0.6)*0.2; } };
}

function buildMarinaScene(scene) {
  scene.background = new THREE.Color(0x08142a);
  scene.fog = new THREE.FogExp2(0x08142a, 0.003);
  scene.add(new THREE.AmbientLight(0x2266aa,0.7));
  const wg=new THREE.PointLight(0x44aaff,1.5,40); wg.position.set(0,0,3); scene.add(wg);
  const fill=new THREE.PointLight(0x88ccff,0.9); fill.position.set(2,2,4); scene.add(fill);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(35,35),M.water(0x0a2a5a));
  water.rotation.x=-Math.PI/2; water.position.y=-1.1; scene.add(water);
  const dock=new THREE.Mesh(new THREE.BoxGeometry(14,0.1,1.5),M.std(0x7a5a3a,0.5));
  dock.position.set(0,-1.05,-2.5); scene.add(dock);
  for(let i=-5;i<=5;i+=1.8) {
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.0,6),M.metal(0xaaaaaa));
    pole.position.set(i,-0.6,-3); scene.add(pole);
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.1,10,10),M.emissv(0xffcc66,1.2));
    bulb.position.set(i,-0.15,-3); scene.add(bulb);
    const l=new THREE.PointLight(0xffcc66,0.7,6); l.position.set(i,-0.12,-3); scene.add(l);
  }
  for(let i=0;i<3;i++) {
    const hull=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.3,0.6),M.std(0xeeeeee));
    hull.position.set(-3.5+i*3.5,-1.0,-4); scene.add(hull);
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,1.8,6),M.metal(0xdddddd));
    mast.position.set(-3.5+i*3.5,-0.1,-4); scene.add(mast);
  }
  mkParticles(scene,800,100,32,0xaaccff,0.028,0.7);
  return { wg, water, update(t){ wg.intensity=1.2+Math.sin(t*0.8)*0.2; } };
}

function buildForestScene(scene, ac) {
  scene.background = new THREE.Color(0x081a08);
  scene.fog = new THREE.FogExp2(0x081a08, 0.005);
  scene.add(new THREE.AmbientLight(0x226622,0.7));
  const beam=new THREE.DirectionalLight(0xccffaa,1.3); beam.position.set(4,10,5); scene.add(beam);
  const glow=new THREE.PointLight(0x88ff88,0.9,30); glow.position.set(-2,3,4); scene.add(glow);
  const sunbeams=new THREE.PointLight(0xffcc88,0.8); sunbeams.position.set(3,6,2); scene.add(sunbeams);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(35,35),M.std(0x2a5a2a,0.9));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-1.1; scene.add(gnd);
  for(let i=0;i<16;i++) {
    const a=(i/16)*Math.PI*2; const r=5.0+Math.random()*3; const h=3.0+Math.random()*2.5;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.15,h,8),M.std(0x6a4a2a,0.6));
    trunk.position.set(Math.cos(a)*r,h/2-1.1,Math.sin(a)*r); scene.add(trunk);
    const foliage=new THREE.Mesh(new THREE.ConeGeometry(1.0+Math.random()*0.5,1.8,8),M.std(0x3a7a3a,0.7));
    foliage.position.set(Math.cos(a)*r,h-0.6,Math.sin(a)*r); scene.add(foliage);
  }
  const ff=mkParticles(scene,250,16,5,0xaaffaa,0.028,0.7,true);
  return { beam, glow, ff, update(t){ ff.material.opacity=0.5+Math.sin(t*3.5)*0.3; } };
}

/* ══════════════════════════════════════════════
   ARCHITECTURAL MODELS (ENHANCED)
══════════════════════════════════════════════ */
function buildUltramodern(ac) {
  const g=new THREE.Group();
  const glass=M.glass(0.85,0xccddff); const steel=M.metal(0xc8d8e8,0.05,0.96); const gld=M.metal(ac,0.06,0.98);
  [[3.2,0.55,3.0,0.2],[2.8,0.8,2.6,0.8],[2.4,0.7,2.2,1.4],[2.0,0.55,1.8,1.9]].forEach(([w,h,d,y])=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),steel); m.position.y=y; m.castShadow=true; g.add(m);
  });
  for(let fl=0;fl<4;fl++) {
    const yB=0.5+fl*0.72;
    for(let x=-1.2;x<=1.2;x+=0.8) {
      const p=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.05),glass); p.position.set(x,yB,1.52); g.add(p);
    }
  }
  const td=new THREE.Mesh(new THREE.BoxGeometry(2.8,0.1,2.4),M.std(0xe8e4dc,0.2)); td.position.y=2.15; g.add(td);
  const gr=new THREE.Mesh(new THREE.BoxGeometry(2.9,0.4,0.05),M.glass(0.4,0xaaddff)); gr.position.set(0,2.35,1.2); g.add(gr);
  const pb=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.14,1.0),M.std(0xe8e4dc,0.2)); pb.position.set(0.7,2.2,-0.65); g.add(pb);
  const pw=new THREE.Mesh(new THREE.BoxGeometry(0.95,0.06,0.85),M.water(0x44aaff)); pw.position.set(0.7,2.28,-0.65); g.add(pw);
  for(let y=0.5;y<2.1;y+=0.72) {
    const s=new THREE.Mesh(new THREE.BoxGeometry(3.25,0.05,0.05),M.emissv(ac,0.9)); s.position.set(0,y,1.5); g.add(s);
  }
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.025,0.7,6),gld); ant.position.set(0,2.5,0); g.add(ant);
  const globe=new THREE.Mesh(new THREE.SphereGeometry(0.09,16,16),M.emissv(ac,1.5)); globe.position.set(0,2.55,0); g.add(globe);
  return g;
}

function buildMediterranean(bodyC, ac) {
  const g=new THREE.Group();
  const wall=M.std(bodyC); const roof=M.std(0xcc8855,0.68); const trim=M.metal(0xf0ece0,0.12,0.35);
  const glass=M.glass(0.8,0xccddff); const wd=M.std(0x8a5a3a,0.45);
  const mb=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.9,3.2),wall); mb.position.y=0.35; mb.castShadow=true; g.add(mb);
  const sf=new THREE.Mesh(new THREE.BoxGeometry(3.0,0.8,2.8),wall); sf.position.y=1.0; sf.castShadow=true; g.add(sf);
  const rb=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.6,0.45,8),roof); rb.position.y=1.45; g.add(rb);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(0.45,16,16),trim); dome.position.y=1.85; g.add(dome);
  [[-1.3,0.5,1.62],[-0.5,0.5,1.62],[0.5,0.5,1.62],[1.3,0.5,1.62],[-1.0,1.05,1.62],[0,1.05,1.62],[1.0,1.05,1.62]].forEach(([x,y,z])=>{
    const w=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.48,0.06),glass); w.position.set(x,y,z+0.04); g.add(w);
  });
  const door=new THREE.Mesh(new THREE.BoxGeometry(0.95,1.2,0.12),wd); door.position.set(0,0.6,1.68); g.add(door);
  const df=new THREE.Mesh(new THREE.BoxGeometry(1.05,1.32,0.1),trim); df.position.set(0,0.6,1.75); g.add(df);
  for(const x of [-0.7,0.7]) {
    const col=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,0.95,12),trim); col.position.set(x,0.35,1.72); g.add(col);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.07,0.22),trim); cap.position.set(x,0.85,1.72); g.add(cap);
  }
  const terr=new THREE.Mesh(new THREE.BoxGeometry(4.4,0.12,1.4),M.std(0xddd4b8,0.25)); terr.position.set(0,-0.05,2.2); g.add(terr);
  return g;
}

function buildContemporary(bodyC, ac) {
  const g=new THREE.Group();
  const glass=M.glass(0.85,0xcceeff); const frame=M.metal(0xc8d4e0,0.06,0.94); const accent=M.metal(ac,0.05,0.97);
  const core=new THREE.Mesh(new THREE.BoxGeometry(2.8,3.0,2.8),frame); core.position.y=1.4; core.castShadow=true; g.add(core);
  for(let fl=0;fl<5;fl++) {
    const yB=0.35+fl*0.68;
    for(let x=-1.1;x<=1.1;x+=0.75) {
      const p=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.66,0.07),glass); p.position.set(x,yB,1.44); g.add(p);
    }
    for(const z of [-1.0,1.0]) {
      const sp=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.6,0.6),glass); sp.position.set(1.44,yB,z); g.add(sp);
    }
  }
  const cf=new THREE.Mesh(new THREE.BoxGeometry(3.5,0.12,3.5),accent); cf.position.y=0.07; g.add(cf);
  const crown=new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.5,0.4,16),accent); crown.position.y=2.95; g.add(crown);
  const beacon=new THREE.Mesh(new THREE.SphereGeometry(0.1,12,12),M.emissv(ac,1.8)); beacon.position.set(0,3.35,0); g.add(beacon);
  for(let fl=1;fl<5;fl++) for(const side of [-1,1]) {
    const bal=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.07,0.4),frame); bal.position.set(side*1.0,0.32+fl*0.68,1.44); g.add(bal);
  }
  return g;
}

function buildTropical(bodyC, ac) {
  const g=new THREE.Group();
  const wd=M.std(0xc8885a,0.5); const thatch=M.std(0xb89050,0.85); const glass=M.glass(0.82,0xccffcc); const wall=M.std(bodyC);
  const plat=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.7,0.5,14),wd); plat.position.y=0.1; plat.castShadow=true; g.add(plat);
  for(let i=0;i<8;i++) { const a=(i/8)*Math.PI*2; const st=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.09,0.6,6),wd); st.position.set(Math.cos(a)*2.1,-0.22,Math.sin(a)*2.1); g.add(st); }
  const walls=new THREE.Mesh(new THREE.CylinderGeometry(1.95,2.15,1.05,16),wall); walls.position.y=0.85; walls.castShadow=true; g.add(walls);
  const r1=new THREE.Mesh(new THREE.ConeGeometry(2.6,0.8,14),thatch); r1.position.y=1.45; r1.castShadow=true; g.add(r1);
  const r2=new THREE.Mesh(new THREE.ConeGeometry(1.8,0.6,14),thatch); r2.position.y=1.95; g.add(r2);
  const fin=new THREE.Mesh(new THREE.SphereGeometry(0.12,10,10),M.gold()); fin.position.y=2.25; g.add(fin);
  for(let i=0;i<12;i++) { const a=(i/12)*Math.PI*2; const wp=new THREE.Mesh(new THREE.BoxGeometry(0.75,0.78,0.05),glass); wp.position.set(Math.cos(a)*1.85,0.82,Math.sin(a)*1.85); wp.rotation.y=-a; g.add(wp); }
  const deck=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.12,4.2),wd); deck.position.y=-0.12; g.add(deck);
  const pw=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.08,0.8),M.water(0x3aaa7a)); pw.position.set(1.5,-0.02,0.6); g.add(pw);
  return g;
}

/* ══════════════════════════════════════════════
   WEATHER SYSTEM
══════════════════════════════════════════════ */
class Weather {
  constructor(scene) { this.scene=scene; this.pts=null; this.animR=false; this.animS=false; }
  set(type) {
    this.clear();
    if(type==="rain")  { this._mk(1800,0.028,0xaaccff,0.4); this.animR=true; this.scene.fog=new THREE.FogExp2(0x446688,0.018); }
    else if(type==="snow") { this._mk(900,0.05,0xeef8ff,0.7); this.animS=true; this.scene.fog=new THREE.FogExp2(0xbbddee,0.01); }
    else if(type==="storm") { this._mk(2200,0.02,0x88aacc,0.5); this.animR=true; this.scene.fog=new THREE.FogExp2(0x335566,0.025); }
    else if(type==="fog") { this.scene.fog=new THREE.FogExp2(0x99aabb,0.022); }
    else this.scene.fog=null;
  }
  _mk(n,size,color,opacity) {
    const geo=new THREE.BufferGeometry(); const pos=new Float32Array(n*3);
    for(let i=0;i<n;i++) { pos[i*3]=(Math.random()-0.5)*28; pos[i*3+1]=Math.random()*12-1; pos[i*3+2]=(Math.random()-0.5)*24; }
    geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
    this.pts=new THREE.Points(geo,new THREE.PointsMaterial({color,size,transparent:true,opacity}));
    this.scene.add(this.pts);
  }
  clear() { if(this.pts) this.scene.remove(this.pts); this.pts=null; this.animR=false; this.animS=false; }
  update() {
    if(!this.pts) return;
    const p=this.pts.geometry.attributes.position.array;
    for(let i=0;i<p.length/3;i++) {
      if(this.animR) { p[i*3+1]-=0.09; if(p[i*3+1]<-1) p[i*3+1]=11; }
      if(this.animS) { p[i*3+1]-=0.025; p[i*3]+=(Math.random()-0.5)*0.016; if(p[i*3+1]<-1) p[i*3+1]=11; }
    }
    this.pts.geometry.attributes.position.needsUpdate=true;
  }
}

/* ══════════════════════════════════════════════
   SINGLE RENDERER
══════════════════════════════════════════════ */
function buildScene(property) {
  const scene = new THREE.Scene();
  const ac = property.accentColor;

  let env;
  switch(property.sceneType) {
    case "city_night":    env = buildCityNight(scene, ac); break;
    case "beach_paradise":env = buildBeachScene(scene, ac); break;
    case "desert_evening":env = buildDesertScene(scene); break;
    case "marina":        env = buildMarinaScene(scene); break;
    case "forest":        env = buildForestScene(scene, ac); break;
    default:              env = buildCityNight(scene, ac);
  }

  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(28,24), M.metal(0x0a0e18,0.06,0.92));
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-1.08; gnd.receiveShadow=true; scene.add(gnd);
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(24,20,60,60), new THREE.MeshBasicMaterial({color:ac,wireframe:true,transparent:true,opacity:0.03}));
  grid.rotation.x=-Math.PI/2; grid.position.y=-1.06; scene.add(grid);

  let model;
  switch(property.style) {
    case "ultramodern":  model = buildUltramodern(ac); break;
    case "mediterranean":model = buildMediterranean(property.bodyColor, ac); break;
    case "contemporary": model = buildContemporary(property.bodyColor, ac); break;
    case "tropical":     model = buildTropical(property.bodyColor, ac); break;
    default:             model = buildMediterranean(property.bodyColor, ac);
  }
  model.traverse(c=>{ if(c.isMesh){c.castShadow=true;c.receiveShadow=true;} });
  scene.add(model);

  const ghost = model.clone();
  ghost.traverse(c=>{ if(c.isMesh) c.material=new THREE.MeshBasicMaterial({color:ac,wireframe:true,transparent:true,opacity:0.022}); });
  scene.add(ghost);

  const ringMat = new THREE.MeshBasicMaterial({color:ac,transparent:true,opacity:0.12,side:THREE.DoubleSide});
  const r1=new THREE.Mesh(new THREE.TorusGeometry(2.6,0.015,36,200),ringMat); r1.rotation.x=0.7; r1.rotation.z=0.3; scene.add(r1);
  const r2=new THREE.Mesh(new THREE.TorusGeometry(3.5,0.01,36,200),ringMat); r2.rotation.x=1.3; r2.rotation.z=-0.5; scene.add(r2);

  const weather = new Weather(scene);

  return { scene, env, r1, r2, ghost, weather };
}

/* ══════════════════════════════════════════════
   3D VIEWER COMPONENT
══════════════════════════════════════════════ */
function Scene3D({ property }) {
  const mountRef  = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);
  const propRef   = useRef(property);
  const [wx, setWx] = useState("clear");

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let W = el.clientWidth;
    let H = el.clientHeight;
    if (W === 0 || H === 0) { W = 600; H = 420; }

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    el.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(40, W/H, 0.1, 130);
    camera.position.set(0, 2.2, 9);

    const sceneData = buildScene(propRef.current);

    let rotY=0, rotX=0.18, dist=9, isDrag=false, lastX=0, lastY=0, autoRot=true;
    const TARGET = new THREE.Vector3(0, 0.9, 0);

    const onDown  = e => { isDrag=true; autoRot=false; const c=e.touches?.[0]||e; lastX=c.clientX; lastY=c.clientY; };
    const onMove  = e => { if(!isDrag) return; const c=e.touches?.[0]||e; rotY+=(c.clientX-lastX)*0.007; rotX=Math.max(-0.45,Math.min(0.85,rotX+(c.clientY-lastY)*0.005)); lastX=c.clientX; lastY=c.clientY; };
    const onUp    = () => { isDrag=false; setTimeout(()=>autoRot=true, 2500); };
    const onWheel = e => { dist=Math.max(4,Math.min(14,dist+e.deltaY*0.01)); };
    el.addEventListener("mousedown", onDown); el.addEventListener("mousemove", onMove); el.addEventListener("mouseup", onUp);
    el.addEventListener("touchstart", onDown, {passive:true}); el.addEventListener("touchmove", onMove, {passive:true}); el.addEventListener("touchend", onUp);
    el.addEventListener("wheel", onWheel, {passive:true});

    let lastTs = 0, t = 0;
    const animate = ts => {
      rafRef.current = requestAnimationFrame(animate);
      const dt = Math.min(0.05,(ts-lastTs)/1000); lastTs=ts; t+=dt;
      if(autoRot) rotY+=0.005;
      camera.position.x = Math.sin(rotY)*Math.cos(rotX)*dist;
      camera.position.y = Math.sin(rotX)*dist + 0.9;
      camera.position.z = Math.cos(rotY)*Math.cos(rotX)*dist;
      camera.lookAt(TARGET);
      const sd = stateRef.current?.sceneData || sceneData;
      sd.weather.update();
      sd.env?.update?.(t);
      sd.ghost.rotation.y = t*0.025;
      sd.r1.rotation.y += 0.005; sd.r2.rotation.y -= 0.004;
      renderer.render(sd.scene, camera);
    };

    stateRef.current = { renderer, camera, sceneData };
    animate(0);

    const ro = new ResizeObserver(() => {
      const w=el.clientWidth, h=el.clientHeight;
      if(w>0 && h>0) { renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); }
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      el.removeEventListener("mousedown",onDown); el.removeEventListener("mousemove",onMove); el.removeEventListener("mouseup",onUp);
      el.removeEventListener("touchstart",onDown); el.removeEventListener("touchmove",onMove); el.removeEventListener("touchend",onUp);
      el.removeEventListener("wheel",onWheel);
      renderer.dispose();
      if(el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      stateRef.current = null;
    };
  }, []);

  useEffect(() => {
    propRef.current = property;
    if(!stateRef.current) return;
    const newSceneData = buildScene(property);
    newSceneData.weather.set("clear");
    setWx("clear");
    stateRef.current.sceneData = newSceneData;
  }, [property.id]);

  const changeWeather = v => {
    setWx(v);
    stateRef.current?.sceneData?.weather.set(v);
  };

  return (
    <>
      <div ref={mountRef} style={{position:"absolute",inset:0,cursor:"grab"}} />
      <div className="wx-ctrl">
        <select value={wx} onChange={e=>changeWeather(e.target.value)} className="wx-select" style={{"--ac":property.accentHex}}>
          <option value="clear">☀ Clear</option>
          <option value="rain">🌧 Rain</option>
          <option value="snow">❄ Snow</option>
          <option value="storm">⛈ Storm</option>
          <option value="fog">🌫 Fog</option>
        </select>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   AMENITY ICONS
══════════════════════════════════════════════ */
const AI = {"Helipad Access":"🚁","Private Elevator":"🛗","Infinity Pool":"🏊","Smart Home":"🤖","Boat Dock":"⛵","Beach Club":"🏖","Wine Cellar":"🍷","Cinema Room":"🎬","Golf Membership":"⛳","Tennis Court":"🎾","Spa":"💆","Guest Pavilion":"🏡","Sky Lounge":"🌆","Concierge":"👔","Gym & Spa":"💪","Valet Parking":"🚗","Botanical Garden":"🌿","Organic Farm":"🌱","Meditation Deck":"🧘","Biophilic Design":"🍃"};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function RealEstate() {
  const [active, setActive] = useState(PROPERTIES[0]);
  const [fading, setFading] = useState(false);
  const [tab, setTab]       = useState("list");
  const [scanY, setScanY]   = useState(30);

  const pick = useCallback((p) => {
    if(p.id===active.id){ if(window.innerWidth<=900) setTab("viewer"); return; }
    setFading(true);
    setTimeout(()=>{ setActive(p); setFading(false); }, 350);
    if(window.innerWidth<=900) setTab("viewer");
  }, [active.id]);

  useEffect(()=>{
    let y=30, r;
    const tick=()=>{ y=(y+0.04)%100; setScanY(y); r=requestAnimationFrame(tick); };
    r=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(r);
  },[]);

  const acHex = active.accentHex;

  return (
    <section className="re-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .re-root{background:#000;position:relative;overflow:hidden;font-family:'Space Mono',monospace;color:#fff;min-height:100vh;}
        .re-root *{box-sizing:border-box;}
        .re-root::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);
          background-size:64px 64px;}
        .re-root::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
          background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(255,215,0,0.08) 0%,transparent 70%);}

        /* HEADER */
        .hdr{max-width:1440px;margin:0 auto;padding:clamp(80px,10vw,110px) 5% 0;position:relative;z-index:5;}
        .hdr-top{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;}
        .hdr-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
        .hdr-bar{width:24px;height:2px;background:#FFCC44;}
        .hdr-eb{font-size:8px;font-weight:700;letter-spacing:.7em;text-transform:uppercase;color:#FFCC44;}
        .hdr-title{font-family:'Cormorant Garamond',serif;font-size:clamp(34px,5.5vw,68px);font-weight:300;letter-spacing:-.02em;line-height:1.05;}
        .hdr-title em{font-style:italic;color:rgba(255,255,255,.22);}
        .hdr-stats{text-align:right;}
        .hdr-num{font-family:'Cormorant Garamond',serif;font-size:clamp(44px,7vw,82px);font-weight:300;color:#FFCC44;line-height:1;letter-spacing:-.03em;}
        .hdr-num-lbl{font-size:7px;font-weight:700;letter-spacing:.55em;text-transform:uppercase;color:rgba(255,255,255,.2);margin-top:5px;}
        .hdr-rule{width:56px;height:2px;background:linear-gradient(90deg,#FFCC44,transparent);margin-top:20px;border-radius:2px;}

        /* MOBILE TABS */
        .mob-tabs{display:none;max-width:1440px;margin:20px auto 0;padding:0 5%;gap:1px;position:relative;z-index:5;}
        .mob-tab{flex:1;font-size:8px;font-weight:700;letter-spacing:.45em;text-transform:uppercase;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.3);padding:13px;cursor:pointer;text-align:center;transition:all .3s;font-family:'Space Mono',monospace;}
        .mob-tab.on{background:rgba(255,204,68,.12);border-color:rgba(255,204,68,.5);color:#FFCC44;}
        @media(max-width:900px){.mob-tabs{display:flex;}}

        /* LAYOUT */
        .re-layout{max-width:1440px;margin:28px auto 0;padding:0 5%;display:grid;grid-template-columns:400px 1fr;gap:0;position:relative;z-index:5;}
        @media(max-width:1160px){.re-layout{grid-template-columns:360px 1fr;}}
        @media(max-width:900px){.re-layout{grid-template-columns:1fr;padding:0;}}

        /* PROPERTY LIST */
        .plist{border:1px solid rgba(255,255,255,.06);max-height:78vh;overflow-y:auto;background:#000;scrollbar-width:thin;scrollbar-color:rgba(255,204,68,.3) transparent;position:relative;}
        .plist::-webkit-scrollbar{width:2px;}.plist::-webkit-scrollbar-thumb{background:rgba(255,204,68,.35);}
        .plist::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(255,204,68,.4),transparent);z-index:5;pointer-events:none;}
        @media(max-width:900px){.plist{border:none;border-top:1px solid rgba(255,255,255,.06);max-height:none;overflow-y:visible;}.plist.hide{display:none;}}

        .pcard{padding:16px 20px;cursor:pointer;display:grid;grid-template-columns:28px 1fr;align-items:center;gap:14px;border-left:2.5px solid transparent;border-bottom:1px solid rgba(255,255,255,.04);transition:all .22s;position:relative;animation:slideUp .5s ease both;}
        .pcard:last-child{border-bottom:none;}
        .pcard:hover{background:rgba(255,255,255,.025);border-left-color:rgba(255,204,68,.5);}
        .pcard.active{background:rgba(255,204,68,.08);border-left-color:#FFCC44;}
        .pcard-idx{font-family:'Cormorant Garamond',serif;font-size:12px;color:rgba(255,255,255,.1);text-align:right;line-height:1;}
        .pcard.active .pcard-idx{color:rgba(255,204,68,.6);}
        .pcard-name{font-family:'Cormorant Garamond',serif;font-size:clamp(15px,2.5vw,18px);font-weight:400;color:#fff;line-height:1.2;}
        .pcard-addr{font-size:7px;font-weight:700;letter-spacing:.48em;text-transform:uppercase;color:rgba(255,255,255,.28);margin-top:3px;}
        .pcard-cat{font-size:6px;letter-spacing:.38em;text-transform:uppercase;color:rgba(255,255,255,.16);margin-top:2px;}
        .pcard-tag{font-size:5.5px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;padding:3px 7px;border:1px solid;white-space:nowrap;text-align:center;margin-top:4px;}
        .pcard-glow{position:absolute;inset:0;pointer-events:none;opacity:0;background:linear-gradient(90deg,var(--ac) 0%,transparent 30%);transition:opacity .3s;}
        .pcard:hover .pcard-glow,.pcard.active .pcard-glow{opacity:.05;}

        /* VIEWER */
        .viewer{position:relative;border:1px solid rgba(255,255,255,.06);border-left:none;display:flex;flex-direction:column;min-height:72vh;background:#000;overflow:hidden;}
        @media(max-width:900px){.viewer{border:none;border-top:1px solid rgba(255,255,255,.06);min-height:0;}.viewer.hide{display:none;}}

        /* CANVAS AREA */
        .cv{position:relative;flex:1;min-height:440px;height:440px;}
        @media(max-width:700px){.cv{min-height:300px;height:300px;}}
        @media(max-width:480px){.cv{min-height:260px;height:260px;}}

        .cv-bg-glow{position:absolute;inset:0;z-index:1;pointer-events:none;transition:background 1.5s;}
        .cv-scanline{position:absolute;left:0;right:0;height:70px;background:linear-gradient(to bottom,transparent,var(--ac,#FFCC44)10,var(--ac,#FFCC44)14,transparent);pointer-events:none;z-index:6;transition:top .05s;}
        .cv-3d{position:absolute;inset:0;z-index:5;}
        .cv-fade-b{position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(transparent,#000);z-index:7;pointer-events:none;}
        .cv-fade-l{position:absolute;top:0;left:0;bottom:0;width:60px;background:linear-gradient(90deg,#000,transparent);z-index:7;pointer-events:none;}
        @media(max-width:900px){.cv-fade-l{display:none;}}

        /* HUD */
        .hud-tl{position:absolute;top:14px;left:14px;z-index:20;display:flex;align-items:center;gap:8px;font-size:7px;letter-spacing:.48em;text-transform:uppercase;background:rgba(0,0,0,.88);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.07);padding:7px 13px;border-radius:3px;}
        .hud-dot{width:5px;height:5px;border-radius:50%;animation:blink 2s ease-in-out infinite;}
        @keyframes blink{0%,100%{opacity:.4}50%{opacity:1}}
        .hud-tr{position:absolute;top:14px;right:14px;z-index:20;}
        .hud-btn{background:rgba(0,0,0,.85);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.5);font-size:7px;font-family:'Space Mono',monospace;letter-spacing:.3em;text-transform:uppercase;padding:7px 11px;cursor:pointer;border-radius:3px;transition:all .25s;text-decoration:none;display:inline-block;}
        .hud-btn:hover{color:var(--ac);}
        .hud-bl{position:absolute;bottom:18px;left:16px;z-index:20;font-size:6.5px;letter-spacing:.35em;text-transform:uppercase;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);padding:6px 12px;border-radius:3px;color:rgba(255,255,255,.35);}
        @media(max-width:700px){.hud-bl{display:none;}}
        .hud-br{position:absolute;bottom:18px;right:16px;z-index:20;text-align:right;pointer-events:none;}
        .hud-br-sub{font-size:7px;letter-spacing:.5em;text-transform:uppercase;color:rgba(255,255,255,.2);margin-bottom:4px;}
        .hud-br-name{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(13px,2vw,19px);line-height:1.2;}

        /* WEATHER CONTROL */
        .wx-ctrl{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:30;}
        .wx-select{background:rgba(0,0,0,.88);color:var(--ac,#FFCC44);border:1px solid;border-color:rgba(255,204,68,.5);padding:7px 14px;cursor:pointer;font-size:10px;font-family:'Space Mono',monospace;border-radius:4px;backdrop-filter:blur(8px);outline:none;}
        @media(max-width:700px){.wx-ctrl{bottom:10px;}.wx-select{font-size:9px;padding:6px 10px;}}

        /* CORNER ORNAMENTS */
        .corner{position:absolute;opacity:.4;pointer-events:none;z-index:12;}
        .corner-tl{top:0;left:0;}.corner-br{bottom:0;right:0;}
        .reticle{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:.04;pointer-events:none;z-index:8;animation:rspin 30s linear infinite;}
        @keyframes rspin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}

        /* DETAIL */
        .detail{padding:22px 26px 26px;border-top:1px solid rgba(255,255,255,.06);background:#000;position:relative;z-index:10;transition:opacity .35s;}
        .detail::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,204,68,.6),transparent);}
        .det-top{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:16px;}
        .det-badges{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px;}
        .det-cat{font-size:8px;font-weight:700;letter-spacing:.55em;text-transform:uppercase;}
        .det-tag{font-size:5.5px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;padding:3px 9px;border:1px solid;}
        .det-title{font-family:'Cormorant Garamond',serif;font-size:clamp(22px,4vw,38px);font-weight:300;letter-spacing:-.01em;line-height:1.05;}
        .det-addr{font-size:9px;color:rgba(255,255,255,.35);margin-top:6px;}
        .det-desc{font-size:7px;color:rgba(255,255,255,.3);margin-top:8px;max-width:360px;line-height:1.6;}

        .specs-grid{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid rgba(255,255,255,.07);margin-bottom:14px;background:rgba(255,255,255,.01);}
        @media(max-width:480px){.specs-grid{grid-template-columns:repeat(2,1fr);}}
        .spec-item{text-align:center;padding:13px 8px;border-right:1px solid rgba(255,255,255,.055);}
        .spec-item:last-child{border-right:none;}
        @media(max-width:480px){.spec-item:nth-child(2){border-right:none;}.spec-item:nth-child(3),.spec-item:nth-child(4){border-top:1px solid rgba(255,255,255,.055);}}
        .spec-val{font-family:'Cormorant Garamond',serif;font-size:clamp(14px,2.5vw,20px);font-weight:400;line-height:1;}
        .spec-lbl{font-size:6px;font-weight:700;letter-spacing:.5em;text-transform:uppercase;color:rgba(255,255,255,.25);margin-top:5px;}

        .amenities{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;}
        .amenity{display:flex;align-items:center;gap:5px;font-size:7px;letter-spacing:.25em;text-transform:uppercase;background:rgba(255,255,255,.038);border:1px solid rgba(255,255,255,.07);padding:5px 10px;border-radius:2px;color:rgba(255,255,255,.4);white-space:nowrap;}

        .cta-row{display:flex;gap:10px;flex-wrap:wrap;}
        @media(max-width:600px){.cta-row{flex-direction:column;}}
        .btn-main{font-family:'Space Mono',monospace;font-size:8px;font-weight:700;letter-spacing:.4em;text-transform:uppercase;color:#000;background:linear-gradient(135deg,#FFCC44,#FFE488 50%,#FFCC44);background-size:200% 100%;border:none;padding:14px 24px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:9px;transition:all .4s;border-radius:2px;flex:1;justify-content:center;}
        .btn-main:hover{background-position:100% 0;transform:translateY(-2px);box-shadow:0 10px 32px rgba(255,204,68,.5);}
        .btn-ghost{font-family:'Space Mono',monospace;font-size:8px;font-weight:600;letter-spacing:.35em;text-transform:uppercase;color:rgba(255,255,255,.38);background:transparent;border:1.2px solid rgba(255,255,255,.1);padding:14px 22px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:9px;transition:all .3s;border-radius:2px;flex:1;justify-content:center;}
        .btn-ghost:hover{border-color:#25D366;color:#25D366;transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,211,102,.25);}
        @media(max-width:600px){.btn-main,.btn-ghost{padding:13px;font-size:7.5px;}}

        /* CTA BANNER */
        .cta-banner{max-width:1440px;margin:32px auto 0;padding:0 5%;position:relative;z-index:5;}
        .cta-inner{background:linear-gradient(135deg,#0d0d1a,#050510);border:1px solid rgba(255,204,68,.2);border-radius:6px;padding:20px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;}
        @media(max-width:600px){.cta-inner{flex-direction:column;text-align:center;padding:18px;}}
        .cta-text-title{font-family:'Cormorant Garamond',serif;font-size:clamp(15px,3vw,20px);}
        .cta-text-sub{font-size:7px;letter-spacing:.35em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-top:4px;}
        .btn-wa-green{background:#25D366;color:#000;border:none;padding:12px 26px;font-size:8px;font-weight:700;letter-spacing:.35em;text-transform:uppercase;text-decoration:none;border-radius:4px;display:inline-flex;align-items:center;gap:9px;transition:all .3s;font-family:'Space Mono',monospace;white-space:nowrap;}
        .btn-wa-green:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,211,102,.4);}

        /* MARQUEE */
        .marquee-wrap{border-top:1px solid rgba(255,255,255,.04);overflow:hidden;padding:16px 0;position:relative;z-index:5;margin-top:44px;}
        .marquee-inner{display:flex;gap:54px;animation:scroll 36s linear infinite;width:max-content;}
        .marquee-item{font-size:7.5px;font-weight:700;letter-spacing:.5em;text-transform:uppercase;color:rgba(255,204,68,.3);white-space:nowrap;}
        @keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .bottom-rule{height:1px;background:linear-gradient(90deg,transparent,rgba(255,204,68,.25),transparent);}
        @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* HEADER */}
      <div className="hdr">
        <div className="hdr-top">
          <div>
            <div className="hdr-eyebrow"><div className="hdr-bar"/><div className="hdr-eb">EMMALEX REALTY · PREMIER PROPERTIES</div></div>
            <h2 className="hdr-title">Dubai's Finest<br/><em>Estates.</em></h2>
          </div>
          <div className="hdr-stats">
            <div className="hdr-num">50+</div>
            <div className="hdr-num-lbl">Luxury Listings</div>
          </div>
        </div>
        <div className="hdr-rule"/>
      </div>

      {/* MOBILE TABS */}
      <div className="mob-tabs">
        <button className={`mob-tab${tab==="list"?" on":""}`} onClick={()=>setTab("list")}>Collection</button>
        <button className={`mob-tab${tab==="viewer"?" on":""}`} onClick={()=>setTab("viewer")}>3D Preview</button>
      </div>

      <div className="re-layout">
        {/* PROPERTY LIST */}
        <div className={`plist${tab==="viewer"?" hide":""}`}>
          {PROPERTIES.map((p,i)=>(
            <div key={p.id} className={`pcard${active.id===p.id?" active":""}`}
              style={{"--ac":p.accentHex,animationDelay:`${i*0.06}s`}} onClick={()=>pick(p)}>
              <div className="pcard-glow"/>
              <div className="pcard-idx">{String(i+1).padStart(2,"0")}</div>
              <div>
                <div className="pcard-name">{p.title}</div>
                <div className="pcard-addr">{p.address}</div>
                <div className="pcard-cat">{p.category}</div>
                {p.tag&&<div className="pcard-tag" style={{color:p.accentHex,borderColor:p.accentHex+"44"}}>{p.tag}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* 3D VIEWER */}
        <div className={`viewer${tab==="list"?" hide":""}`}>
          <div className="cv">
            <div className="cv-bg-glow" style={{background:`radial-gradient(ellipse at 55% 45%,${acHex}25 0%,transparent 70%)`}}/>
            <div className="cv-scanline" style={{top:`${scanY}%`,"--ac":acHex}}/>

            {/* SVG ornaments */}
            <svg className="corner corner-tl" width="42" height="42" viewBox="0 0 42 42" fill="none">
              <path d="M0 42V0h42" stroke={acHex} strokeWidth=".9" fill="none"/>
              <circle cx="0" cy="0" r="2.5" fill={acHex} opacity=".9"/>
            </svg>
            <svg className="corner corner-br" width="42" height="42" viewBox="0 0 42 42" fill="none">
              <path d="M42 0v42H0" stroke={acHex} strokeWidth=".9" fill="none"/>
              <circle cx="42" cy="42" r="2.5" fill={acHex} opacity=".9"/>
            </svg>
            <svg className="reticle" width="52" height="52" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="27" stroke={acHex} strokeWidth=".7" strokeDasharray="5 8"/>
              {[0,90,180,270].map(a=><line key={a} x1={30+Math.cos(a*Math.PI/180)*20} y1={30+Math.sin(a*Math.PI/180)*20} x2={30+Math.cos(a*Math.PI/180)*28} y2={30+Math.sin(a*Math.PI/180)*28} stroke={acHex} strokeWidth=".9"/>)}
            </svg>

            {/* Single 3D canvas */}
            <div className="cv-3d">
              <Scene3D property={active}/>
            </div>

            <div className="cv-fade-b"/>
            <div className="cv-fade-l"/>

            <div className="hud-tl" style={{color:acHex,borderColor:acHex+"22"}}>
              <div className="hud-dot" style={{background:acHex}}/>
              Live 3D · {active.sceneType.replace("_"," ")}
            </div>
            <div className="hud-tr">
              <a href={WA_MSG(active)} target="_blank" rel="noopener noreferrer" className="hud-btn" style={{"--ac":acHex}}>Inquire</a>
            </div>
            <div className="hud-bl">🖱 Drag · Scroll to zoom · 🌦 Weather</div>
            <div className="hud-br">
              <div className="hud-br-sub">{active.address.split(",")[0]}</div>
              <div className="hud-br-name" style={{color:acHex+"cc"}}>{active.title}</div>
            </div>
          </div>

          {/* DETAIL PANEL */}
          <div className="detail" style={{opacity:fading?0:1}}>
            <div className="det-top">
              <div>
                <div className="det-badges">
                  <div className="det-cat" style={{color:acHex}}>{active.category}</div>
                  {active.tag&&<div className="det-tag" style={{color:acHex,borderColor:acHex+"44"}}>{active.tag}</div>}
                </div>
                <div className="det-title">{active.title}</div>
                <div className="det-addr">{active.address}</div>
                <div className="det-desc">{active.description}</div>
              </div>
            </div>

            <div className="specs-grid">
              {active.specs.map((s,i)=>(
                <div key={i} className="spec-item">
                  <div className="spec-val" style={{color:acHex}}>{s}</div>
                  <div className="spec-lbl">{["Area","Bedrooms","Bathrooms","Feature"][i]||"Detail"}</div>
                </div>
              ))}
            </div>

            <div className="amenities">
              {active.amenities.map(a=>(
                <div key={a} className="amenity"><span>{AI[a]||"✦"}</span>{a}</div>
              ))}
            </div>

            <div className="cta-row">
              <a href={WA_MSG(active)} target="_blank" rel="noopener noreferrer" className="btn-main">
                <span>💬</span> Inquire on WhatsApp
              </a>
              <a href={WA_OTHER} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <span>🏠</span> View All Properties
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="cta-banner">
        <div className="cta-inner">
          <div style={{display:"flex",alignItems:"center",gap:"16px",flexWrap:"wrap"}}>
            <span style={{fontSize:"30px"}}>🏗️</span>
            <div>
              <div className="cta-text-title">Looking for something else?</div>
              <div className="cta-text-sub">Explore our complete portfolio · 50+ luxury properties</div>
            </div>
          </div>
          <a href={WA_OTHER} target="_blank" rel="noopener noreferrer" className="btn-wa-green">
            <span>📱</span> Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-inner">
          {[...PROPERTIES,...PROPERTIES].map((p,i)=>(
            <span key={i} className="marquee-item">{p.title} &nbsp;·</span>
          ))}
        </div>
      </div>
      <div className="bottom-rule"/>
    </section>
  );
}