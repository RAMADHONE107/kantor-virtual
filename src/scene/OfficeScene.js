import * as THREE from 'three';
import { products } from '../data/products.js';

export function createOfficeScene(container, callbacks = {}) {
  const { onTimeUpdate, onStatusUpdate, onMeetingChange, onProductSelect } = callbacks;

  class RNG {
    constructor(s = 42) { this.s = s; }
    n() { this.s = (this.s * 16807) % 2147483647; return (this.s - 1) / 2147483646; }
    r(a, b) { return a + this.n() * (b - a); }
    i(a, b) { return Math.floor(this.r(a, b + 1)); }
    pick(a) { return a[this.i(0, a.length - 1)]; }
  }
  const rng = new RNG(2026);

  // 4 tim, masing-masing 4 orang, 4 meja, 2 komputer per meja
  const TEAMS = [
    {
      name: 'Tim Alpha',
      center: { x: -10, z: -4 },
      members: [
        { name: 'RAKA', role: 'Riset Produk', color: 0x0deef3, hex: '#0DEEF3', hair: 0x1a1a2e, shirt: 0x0a3d5c, pants: 0x0a1628 },
        { name: 'SINTA', role: 'Produksi Konten', color: 0xe040fb, hex: '#E040FB', hair: 0x4a148c, shirt: 0x6a1b9a, pants: 0x1a1a2e },
        { name: 'DIMAS', role: 'Desain & Visual', color: 0x00e676, hex: '#00E676', hair: 0x222222, shirt: 0x1b5e20, pants: 0x263238 },
        { name: 'NAYA', role: 'Growth & Analitik', color: 0xf5a623, hex: '#F5A623', hair: 0x8b4513, shirt: 0x8b6914, pants: 0x3e2723 },
      ],
    },
    {
      name: 'Tim Beta',
      center: { x: 10, z: -4 },
      members: [
        { name: 'BIMA', role: 'Riset Pasar', color: 0x448aff, hex: '#448AFF', hair: 0x2b2b2b, shirt: 0x153e75, pants: 0x1b2430 },
        { name: 'LINA', role: 'Copy & Script', color: 0xff6ec7, hex: '#FF6EC7', hair: 0x5a2a82, shirt: 0x7b2cbf, pants: 0x2a1b3d },
        { name: 'REZA', role: 'Desain Konten', color: 0x7cffb2, hex: '#7CFFB2', hair: 0x1f2937, shirt: 0x166534, pants: 0x22303c },
        { name: 'TARI', role: 'Ads & Sosmed', color: 0xffb74d, hex: '#FFB74D', hair: 0x7a4a21, shirt: 0x9a3412, pants: 0x3b2f2f },
      ],
    },
    {
      name: 'Tim Gamma',
      center: { x: -10, z: 10 },
      members: [
        { name: 'ANDI', role: 'Riset Kompetitor', color: 0x26c6da, hex: '#26C6DA', hair: 0x263238, shirt: 0x006064, pants: 0x102027 },
        { name: 'MAYA', role: 'Video & Live', color: 0xba68c8, hex: '#BA68C8', hair: 0x4a148c, shirt: 0x6a1b9a, pants: 0x311b92 },
        { name: 'GALIH', role: 'Brand Visual', color: 0x66bb6a, hex: '#66BB6A', hair: 0x1b1b1b, shirt: 0x2e7d32, pants: 0x263238 },
        { name: 'RANI', role: 'Komunitas & CRM', color: 0xff8a65, hex: '#FF8A65', hair: 0x6d4c41, shirt: 0xb71c1c, pants: 0x3e2723 },
      ],
    },
    {
      name: 'Tim Delta',
      center: { x: 10, z: 10 },
      members: [
        { name: 'FARIS', role: 'Riset Funnel', color: 0x29b6f6, hex: '#29B6F6', hair: 0x1a237e, shirt: 0x0277bd, pants: 0x102a43 },
        { name: 'KEI', role: 'Konten Edukasi', color: 0xf06292, hex: '#F06292', hair: 0x4a148c, shirt: 0xad1457, pants: 0x2d1b2e },
        { name: 'YOGA', role: 'Motion & Asset', color: 0x9ccc65, hex: '#9CCC65', hair: 0x2e3b2f, shirt: 0x558b2f, pants: 0x263238 },
        { name: 'VINA', role: 'Sales & Closing', color: 0xffca28, hex: '#FFCA28', hair: 0x8d6e63, shirt: 0xf57f17, pants: 0x4e342e },
      ],
    },
  ];

  const deskOffsets = [
    { x: -2.2, z: -1.4 },
    { x: 2.2, z: -1.4 },
    { x: -2.2, z: 2.0 },
    { x: 2.2, z: 2.0 },
  ];

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1624);
  scene.fog = new THREE.Fog(0x0b1624, 45, 95);

  const camera = new THREE.PerspectiveCamera(32, container.clientWidth / container.clientHeight, 0.1, 200);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  // Orbit
  let isDrag = false, prev = { x: 0, y: 0 };
  let sph = { theta: Math.PI / 4.3, phi: Math.PI / 3.2, radius: 42 };
  const tgt = new THREE.Vector3(0, 1.6, 3.0);
  let autoRot = true, autoTmr;
  function updCam() {
    const p = Math.max(0.28, Math.min(Math.PI / 2.2, sph.phi));
    sph.phi = p;
    camera.position.set(
      sph.radius * Math.sin(p) * Math.sin(sph.theta) + tgt.x,
      sph.radius * Math.cos(p) + tgt.y,
      sph.radius * Math.sin(p) * Math.cos(sph.theta) + tgt.z
    );
    camera.lookAt(tgt);
  }
  updCam();
  const onDown = (e) => { isDrag = true; prev = { x: e.clientX, y: e.clientY }; autoRot = false; clearTimeout(autoTmr); };
  const onUp = () => { isDrag = false; autoTmr = setTimeout(() => (autoRot = true), 6000); };
  const onMove = (e) => {
    if (!isDrag) return;
    sph.theta -= (e.clientX - prev.x) * 0.005;
    sph.phi += (e.clientY - prev.y) * 0.005;
    prev = { x: e.clientX, y: e.clientY };
    updCam();
  };
  const onWheel = (e) => { sph.radius = Math.max(18, Math.min(70, sph.radius + e.deltaY * 0.03)); updCam(); };
  renderer.domElement.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.58);
  scene.add(ambient);
  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x4b5563, 0.35));
  const sun = new THREE.DirectionalLight(0xfff6e8, 1.15);
  sun.position.set(10, 18, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -35; sun.shadow.camera.right = 35; sun.shadow.camera.top = 35; sun.shadow.camera.bottom = -35;
  sun.shadow.bias = -0.001;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xbfd7ff, 0.35);
  fill.position.set(-12, 10, -8);
  scene.add(fill);

  const office = new THREE.Group();
  scene.add(office);
  const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0.05, ...o });
  const MB = (c) => new THREE.MeshBasicMaterial({ color: c });
  const ML = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });

  // Floor & carpet (expanded for 4 teams)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(44, 0.2, 34), M(0x8b95a3, { roughness: 0.95 }));
  floor.position.y = -0.1; floor.receiveShadow = true; office.add(floor);
  const carpet = new THREE.Mesh(new THREE.BoxGeometry(38, 0.06, 28), M(0x475569, { roughness: 1 }));
  carpet.position.set(0, 0.03, 3); carpet.receiveShadow = true; office.add(carpet);

  // U-shaped walls (back, left, right)
  const wallMat = M(0xe7e2d8, { roughness: 0.9 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(44, 4.5, 0.25), wallMat);
  backWall.position.set(0, 2.25, -14); backWall.receiveShadow = true; backWall.castShadow = true; office.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.5, 28.25), wallMat);
  leftWall.position.set(-22, 2.25, 0.125); leftWall.receiveShadow = true; office.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.5, 28.25), wallMat);
  rightWall.position.set(22, 2.25, 0.125); rightWall.receiveShadow = true; office.add(rightWall);
  // trim
  const trimMat = M(0xcbd5e1, { roughness: 0.8 });
  const backTrim = new THREE.Mesh(new THREE.BoxGeometry(43.5, 0.25, 0.12), trimMat); backTrim.position.set(0, 0.15, -13.85); office.add(backTrim);
  const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 27.8), trimMat); leftTrim.position.set(-21.85, 0.15, 0.125); office.add(leftTrim);
  const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 27.8), trimMat); rightTrim.position.set(21.85, 0.15, 0.125); office.add(rightTrim);

  // Windows on back wall
  [-8, 8].forEach((wx) => {
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.0, 0.12), M(0x94a3b8));
    winFrame.position.set(wx, 2.5, -13.85); office.add(winFrame);
    const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.6), new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.35, roughness: 0.05 }));
    winGlass.position.set(wx, 2.5, -13.78); office.add(winGlass);
  });

  // Helpers to build items/facilities
  function addPlant(px, pz, s = 1) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * s, 0.22 * s, 0.35 * s, 12), M(0xeceff1));
    pot.position.set(px, 0.175 * s, pz); pot.castShadow = true; office.add(pot);
    for (let i = 0; i < 3; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry((0.18 + rng.r(0, 0.08)) * s, 10, 10), M(rng.n() > 0.5 ? 0x4caf50 : 0x2e7d32));
      leaf.position.set(px + rng.r(-0.08, 0.08) * s, 0.45 * s + i * 0.18 * s, pz + rng.r(-0.08, 0.08) * s);
      leaf.castShadow = true; office.add(leaf);
    }
  }
  function addBookshelf(x, z, ry = 0) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 0.42), M(0xdde4ec));
    body.position.y = 1.0; g.add(body);
    for (let r = 0; r < 3; r++) {
      for (let b = 0; b < 5; b++) {
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.34, 0.24), ML([0x448aff, 0xff5252, 0xf5a623, 0x7c4dff, 0x00e676][b]));
        book.position.set(-0.52 + b * 0.26, 0.42 + r * 0.6, 0.02);
        g.add(book);
      }
    }
    g.position.set(x, 0, z); g.rotation.y = ry; office.add(g);
  }
  function addWhiteboard(x, z, ry = 0) {
    const g = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 0.05), M(0xf8fafc));
    board.position.y = 1.8; g.add(board);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.1, 0.03), M(0x94a3b8));
    frame.position.set(0, 1.8, 0.03); g.add(frame);
    const standL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.05), M(0x94a3b8)); standL.position.set(-0.6, 0.6, 0.15);
    const standR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.05), M(0x94a3b8)); standR.position.set(0.6, 0.6, 0.15);
    g.add(standL, standR);
    g.position.set(x, 0, z); g.rotation.y = ry; office.add(g);
  }
  function addPrinter(x, z) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.6), M(0xe5e7eb)); base.position.set(x, 0.25, z); office.add(base);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.2, 0.55), M(0xf3f4f6)); top.position.set(x, 0.6, z); office.add(top);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.2), M(0x334155)); slot.position.set(x, 0.52, z - 0.31); office.add(slot);
  }
  function addCoffee(x, z) {
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.6), M(0xdde4ec)); table.position.set(x, 0.7, z); office.add(table);
    [[-0.4, -0.22],[0.4,-0.22],[-0.4,0.22],[0.4,0.22]].forEach(([lx,lz])=>{const l=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.7,0.05),M(0xaab8c5)); l.position.set(x+lx,0.35,z+lz); office.add(l);});
    const machine = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.22), M(0x374151)); machine.position.set(x - 0.15, 0.89, z); office.add(machine);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.04,0.08,10), M(0xffffff)); cup.position.set(x + 0.18, 0.77, z + 0.05); office.add(cup);
  }
  function addSofa(x, z, ry = 0) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.7), M(0x64748b)); base.position.y = 0.35; g.add(base);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.15), M(0x5b6b80)); back.position.set(0, 0.65, 0.28); g.add(back);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.7), M(0x5b6b80)); armL.position.set(-0.825, 0.52, 0); g.add(armL);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 0.7), M(0x5b6b80)); armR.position.set(0.825, 0.52, 0); g.add(armR);
    g.position.set(x, 0, z); g.rotation.y = ry; office.add(g);
  }
  function addFilingCabinet(x, z) {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.5), M(0xd1d5db)); cab.position.set(x, 0.5, z); office.add(cab);
    [0.25, -0.05].forEach((y)=>{const d=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.02,0.02),M(0x94a3b8)); d.position.set(x,0.5+y,z-0.26); office.add(d);});
  }

  // Shared central facilities
  addSofa(0, 3.2, 0);
  addCoffee(0, 1.8);
  addPlant(0, -12.8, 1.3); addPlant(-20.5, -12.8, 1.1); addPlant(20.5, -12.8, 1.1);
  addPlant(-20.5, 12.8, 1.1); addPlant(20.5, 12.8, 1.1);

  // Character builder
  function buildChar(agent, standing = false) {
    const g = new THREE.Group();
    const skin = 0xdeb887;
    if (standing) {
      const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), ML(agent.pants));
      leftLeg.position.set(-0.08, 0.2, 0); g.add(leftLeg); leftLeg.userData.isLeg = true; leftLeg.userData.phase = 0;
      const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), ML(agent.pants));
      rightLeg.position.set(0.08, 0.2, 0); g.add(rightLeg); rightLeg.userData.isLeg = true; rightLeg.userData.phase = Math.PI;
      [-1, 1].forEach((s) => { const sh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.16), ML(0x222222)); sh.position.set(s * 0.08, 0.025, 0); g.add(sh); });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.16), ML(agent.shirt));
      torso.position.set(0, 0.58, 0); torso.castShadow = true; g.add(torso);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), ML(skin));
      head.position.set(0, 0.86, 0); head.castShadow = true; g.add(head);
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.22), ML(agent.hair));
      hair.position.set(0, 0.96, -0.01); g.add(hair);
      [-1, 1].forEach((s) => { const eye = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), MB(0xffffff)); eye.position.set(s * 0.05, 0.88, 0.11); g.add(eye); });
      [-1, 1].forEach((s) => { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), ML(agent.shirt)); arm.position.set(s * 0.2, 0.5, 0); g.add(arm); });
    } else {
      // sitting, facing -Z (toward desk/monitor)
      [-1, 1].forEach((s) => { const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.1, 0.22), ML(agent.pants)); thigh.position.set(s * 0.09, 0.42, -0.05); g.add(thigh); });
      [-1, 1].forEach((s) => { const shin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), ML(agent.pants)); shin.position.set(s * 0.09, 0.24, -0.15); g.add(shin); });
      [-1, 1].forEach((s) => { const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.14), ML(0x222222)); shoe.position.set(s * 0.09, 0.1, -0.15); g.add(shoe); });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.16), ML(agent.shirt));
      torso.position.set(0, 0.62, 0); torso.castShadow = true; g.add(torso);
      [-1, 1].forEach((s) => { const ua = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.08), ML(agent.shirt)); ua.position.set(s * 0.2, 0.6, -0.04); g.add(ua); const fa = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.2), ML(skin)); fa.position.set(s * 0.2, 0.52, -0.18); g.add(fa); });
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), ML(skin));
      head.position.set(0, 0.9, 0); head.castShadow = true; g.add(head);
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.22), ML(agent.hair));
      hair.position.set(0, 1.0, 0.01); g.add(hair);
      const hairB = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.04), ML(agent.hair));
      hairB.position.set(0, 0.94, 0.11); g.add(hairB);
      [-1, 1].forEach((s) => { const eye = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), MB(0xffffff)); eye.position.set(s * 0.05, 0.92, -0.11); g.add(eye); const pup = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), MB(0x1a1a2e)); pup.position.set(s * 0.05, 0.91, -0.115); g.add(pup); });
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), MB(agent.color));
      badge.position.set(0.16, 0.68, -0.06); g.add(badge);
    }
    return g;
  }

  const screenData = [];
  const agentData = [];
  const clickableMonitors = [];
  let selectedScreen = null;

  function drawProductScreen(s) {
    const { ctx: c, canvas: cv, product } = s;
    const w = cv.width, h = cv.height;
    c.fillStyle = '#07111d'; c.fillRect(0, 0, w, h);
    const accent = (product && product.screen && product.screen.color) || '#0DEEF3';
    const grad = c.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, '#0b1d33');
    c.globalAlpha = 0.22;
    c.fillStyle = grad;
    c.fillRect(6, 6, w - 12, h - 12);
    c.globalAlpha = 1;
    c.fillStyle = accent;
    c.fillRect(8, 8, w - 16, 6);
    if (s.selected) {
      c.strokeStyle = '#ffffff';
      c.lineWidth = 2;
      c.strokeRect(2, 2, w - 4, h - 4);
    } else {
      c.strokeStyle = accent;
      c.globalAlpha = 0.35;
      c.lineWidth = 1;
      c.strokeRect(4, 4, w - 8, h - 8);
      c.globalAlpha = 1;
    }
    s.tex.needsUpdate = true;
  }

  // Build 4 teams: each with 4 desks, 8 monitors, 4 people, and facilities
  TEAMS.forEach((team, ti) => {
    const cx = team.center.x, cz = team.center.z;

    // Team facilities
    addBookshelf(cx - 4.8, cz - 3.2, Math.PI / 2);
    addWhiteboard(cx + 4.8, cz - 3.0, -Math.PI / 2);
    addPrinter(cx + 4.6, cz + 3.2);
    addFilingCabinet(cx - 4.6, cz + 3.2);
    addPlant(cx - 4.6, cz - 0.2, 0.9);
    addPlant(cx + 4.6, cz + 0.2, 0.9);
    // small team meeting table
    const tTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.07, 0.9), M(0xdde4ec));
    tTable.position.set(cx, 0.72, cz + 4.2); tTable.castShadow = true; office.add(tTable);
    [[-0.75,-0.35],[0.75,-0.35],[-0.75,0.35],[0.75,0.35]].forEach(([lx,lz])=>{const leg=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.72,0.05),M(0xaab8c5)); leg.position.set(cx+lx,0.36,cz+4.2+lz); office.add(leg);});

    team.members.forEach((agent, idx) => {
      const dp = deskOffsets[idx];
      const ax = cx + dp.x, az = cz + dp.z;

      // Desk
      [[-0.9, -0.35], [0.9, -0.35], [-0.9, 0.35], [0.9, 0.35]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.72, 0.07), ML(0xaab8c5));
        leg.position.set(ax + lx, 0.36, az + lz); leg.castShadow = true; office.add(leg);
      });
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.9), ML(0xe8ecf0));
      top.position.set(ax, 0.75, az); top.castShadow = true; top.receiveShadow = true; office.add(top);

      // Two monitors per desk
      const monitorOffsets = [-0.45, 0.45];
      monitorOffsets.forEach((ox, mi) => {
        const globalIdx = ti * 8 + idx * 2 + mi;
        const fallback = { screen: { color: agent.hex || '#0DEEF3' } };
        const product = products[globalIdx] || products[(idx * 2 + mi) % products.length] || fallback;
        const mx = ax + ox;
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.1), ML(0xaab8c5));
        base.position.set(mx, 0.79, az - 0.22); office.add(base);
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.03), ML(0xaab8c5));
        stand.position.set(mx, 0.9, az - 0.22); office.add(stand);
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.48, 0.03), ML(0x222833));
        body.position.set(mx, 1.24, az - 0.27); body.castShadow = true; office.add(body);
        const cv = document.createElement('canvas'); cv.width = 160; cv.height = 100;
        const ctx = cv.getContext('2d');
        const tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearFilter;
        const face = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.42), new THREE.MeshBasicMaterial({ map: tex }));
        face.position.set(mx, 1.24, az - 0.25); office.add(face);
        const sdata = { canvas: cv, ctx, tex, product, selected: false, face, body };
        screenData.push(sdata);
        clickableMonitors.push({ mesh: body, face, product, sdata });
        drawProductScreen(sdata);
      });

      // Keyboard & mouse
      const kb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.14), ML(0x333333));
      kb.position.set(ax, 0.79, az + 0.08); office.add(kb);
      const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.09), ML(0x333333));
      mouse.position.set(ax + 0.38, 0.79, az + 0.08); office.add(mouse);

      // Chair
      const chairZ = az + 0.62;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42), ML(0x37474f));
      seat.position.set(ax, 0.44, chairZ); office.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.05), ML(0x37474f));
      back.position.set(ax, 0.67, chairZ + 0.2); office.add(back);
      [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.03), ML(0x90a4ae));
        leg.position.set(ax + lx, 0.21, chairZ + lz); office.add(leg);
      });

      // Desk glow
      const glow = new THREE.PointLight(agent.color, 0.16, 2.4, 2);
      glow.position.set(ax, 0.3, az); office.add(glow);

      // Sitting + walker
      const sitting = buildChar(agent, false);
      sitting.position.set(ax, 0, chairZ);
      office.add(sitting);
      const walker = buildChar(agent, true);
      walker.visible = false;
      office.add(walker);

      agentData.push({
        agent, sitting, walker, label: null, glow,
        home: { x: ax, z: chairZ },
        teamCenter: { x: cx, z: cz },
        state: 'sitting',
        timer: 4 + rng.r(0, 10),
        walkTarget: null,
        walkPause: 0,
      });
    });
  });

  // Simple walking behavior across the larger office
  const walkDestinations = [
    { x: 0, z: 3.0 }, { x: -8, z: 3.0 }, { x: 8, z: 3.0 },
    { x: 0, z: -8 }, { x: -12, z: -2 }, { x: 12, z: -2 },
    { x: -10, z: 12 }, { x: 10, z: 12 }, { x: 0, z: 12 },
  ];
  function updateWalkers(delta) {
    agentData.forEach((ad) => {
      if (ad.state === 'sitting') {
        ad.timer -= delta;
        if (ad.timer <= 0) {
          ad.state = 'walking_out';
          ad.sitting.visible = false;
          ad.walker.visible = true;
          ad.walker.position.set(ad.home.x, 0, ad.home.z);
          const local = rng.n() < 0.55 && ad.teamCenter;
          const base = local ? ad.teamCenter : rng.pick(walkDestinations);
          ad.walkTarget = { x: base.x + rng.r(-2.2, 2.2), z: base.z + rng.r(-2.0, 2.0) };
          ad.walkPause = 0;
        }
      } else if (ad.state === 'walking_out' || ad.state === 'walking_back') {
        const target = ad.state === 'walking_out' ? ad.walkTarget : ad.home;
        const dx = target.x - ad.walker.position.x;
        const dz = target.z - ad.walker.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.2) {
          if (ad.state === 'walking_out') {
            ad.walkPause += delta;
            if (ad.walkPause > 1.6 + rng.r(0, 2.2)) ad.state = 'walking_back';
          } else {
            ad.state = 'sitting';
            ad.walker.visible = false;
            ad.sitting.visible = true;
            ad.timer = 5 + rng.r(0, 12);
            ad.walker.children.forEach((c) => { if (c.userData && c.userData.isLeg) c.position.z = 0; });
          }
        } else {
          const speed = 1.6 * delta;
          const nx = dx / dist, nz = dz / dist;
          ad.walker.position.x += nx * speed;
          ad.walker.position.z += nz * speed;
          ad.walker.rotation.y = Math.atan2(nx, nz);
          const t = performance.now() * 0.01;
          ad.walker.children.forEach((c) => { if (c.userData && c.userData.isLeg) c.position.z = Math.sin(t + c.userData.phase) * 0.08; });
        }
      }
    });
  }

  // Raycast click for monitor products
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function setSelected(sdata) {
    if (selectedScreen === sdata) return;
    if (selectedScreen) { selectedScreen.selected = false; drawProductScreen(selectedScreen); }
    selectedScreen = sdata || null;
    if (selectedScreen) { selectedScreen.selected = true; drawProductScreen(selectedScreen); }
  }
  function onClick(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickableMonitors.map(m => m.mesh));
    if (hits.length) {
      const mesh = hits[0].object;
      const found = clickableMonitors.find(m => m.mesh === mesh);
      if (found) {
        setSelected(found.sdata);
        if (onProductSelect) onProductSelect(found.product);
        return;
      }
    }
    // no hit -> clear selection callback? keep selection unless explicitly cleared by UI; do nothing
  }
  renderer.domElement.addEventListener('click', onClick);

  // Time/cyberpunk API
  let timeOfDay = 600;
  let cyberpunkMode = false;
  function getStatus(m) {
    if (m < 480) return 'Tim Bersiap · Kantor Pagi';
    if (m < 720) return 'Fokus Kerja · Semua Tim Online';
    if (m < 840) return 'Produksi Konten & Review';
    if (m < 1080) return 'Distribusi & Optimasi Affiliate';
    return 'Wrap-up · Rekap Performa';
  }
  function updateTime(min) {
    timeOfDay = min;
    if (onTimeUpdate) onTimeUpdate(min);
    if (onStatusUpdate) onStatusUpdate(getStatus(min));
  }
  updateTime(600);

  function toggleCyberpunk() {
    cyberpunkMode = !cyberpunkMode;
    if (cyberpunkMode) {
      ambient.intensity = 0.18;
      sun.intensity = 0.12;
      renderer.toneMappingExposure = 0.7;
      scene.fog.color.set(0x020611); scene.background.set(0x020611);
      agentData.forEach(a => { a.glow.intensity = 0.7; a.glow.distance = 4; });
    } else {
      ambient.intensity = 0.58;
      sun.intensity = 1.15;
      renderer.toneMappingExposure = 1.1;
      scene.fog.color.set(0x0b1624); scene.background.set(0x0b1624);
      agentData.forEach(a => { a.glow.intensity = 0.18; a.glow.distance = 2.5; });
    }
  }

  const clock = new THREE.Clock();
  let raf;
  function animate() {
    raf = requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();
    if (autoRot) { sph.theta += 0.0012; updCam(); }
    updateWalkers(delta);
    renderer.render(scene, camera);
  }
  animate();

  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', onResize);

  return {
    setTime: (minutes) => updateTime(minutes),
    toggleCyberpunk: () => toggleCyberpunk(),
    isCyberpunk: () => cyberpunkMode,
    destroy: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    },
  };
}
