8import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { sfxBoom, sfxHit, sfxLock, sfxPower, sfxStrum, startMusic, stopMusic } from "./audio";
import { isFiring, moveAxis, setInjectedKeys } from "./input";
import { addHitstop, addTrauma, burst, createJuice, tickJuice } from "./juice";
import { live } from "./store";
import { genreById, type BandmateId, type GenreId, type Mission } from "./types";

type Props = {
  mission: Mission;
  presets: GenreId[];
  anthem: GenreId;
  reduced: boolean;
  paused: boolean;
  onComplete: () => void;
};

const WAVE_COUNT = 8;
const NOTE_POOL = 32;
const BIT_POOL = 64;
const LIM = 0xd6ff1a;
const CREAM = 0xf3e6c8;
const NIGHT = 0x0c0614;
const BAND_CYCLE: BandmateId[] = ["harmonica", "bass", "drums"];

type Ufo = {
  id: number;
  root: THREE.Group;
  hp: number;
  max: number;
  alive: boolean;
  boss: boolean;
  phase: number;
  x: number;
  y: number;
  z: number;
};

type Shot = {
  sprite: THREE.Sprite;
  vx: number;
  vy: number;
  vz: number;
  alive: boolean;
  life: number;
  target: number;
};

function hexColor(css: string) {
  return Number.parseInt(css.slice(1), 16);
}

function glowTexture(rgb: string) {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grd.addColorStop(0, "#fff");
  grd.addColorStop(0.18, rgb);
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeGuitarist() {
  const root = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xe8c4a0, roughness: 0.55 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0x161018, roughness: 0.7 });
  const jeans = new THREE.MeshStandardMaterial({ color: 0x24344c, roughness: 0.8 });
  const hair = new THREE.MeshStandardMaterial({ color: 0xe2c04a, roughness: 0.45 });
  const wood = new THREE.MeshStandardMaterial({
    color: 0xc49a4a,
    roughness: 0.4,
    emissive: 0x3a2208,
    emissiveIntensity: 0.2,
  });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.55, 4, 8), shirt);
  torso.position.y = 1.15;
  torso.castShadow = true;
  root.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), skin);
  head.position.y = 1.72;
  root.add(head);
  const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), hair);
  hairMesh.scale.set(1.05, 0.7, 1.1);
  hairMesh.position.set(0, 1.86, -0.02);
  root.add(hairMesh);

  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.55, 3, 6), jeans);
  const legR = legL.clone();
  legL.position.set(-0.14, 0.42, 0);
  legR.position.set(0.14, 0.42, 0);
  root.add(legL, legR);

  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 3, 6), shirt);
  armL.position.set(-0.4, 1.28, 0.05);
  armL.rotation.z = 0.45;
  root.add(armL);

  const strum = new THREE.Group();
  strum.position.set(0.34, 1.28, 0.12);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 3, 6), shirt);
  armR.rotation.z = -0.7;
  armR.position.set(0.12, -0.1, 0.05);
  strum.add(armR);

  const guitar = new THREE.Group();
  guitar.position.set(0.05, -0.05, 0.28);
  guitar.rotation.set(0.2, 0.4, -1.05);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), wood);
  body.scale.set(0.85, 1, 0.28);
  const neck = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.72, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x2a1a10 }),
  );
  neck.position.set(0, 0.52, 0);
  guitar.add(body, neck);
  strum.add(guitar);
  root.add(strum);

  const harm = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.05, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x8a8a92, metalness: 0.6, roughness: 0.3 }),
  );
  harm.position.set(0, 1.62, 0.2);
  root.add(harm);

  root.userData.strum = strum;
  root.userData.guitar = guitar;
  return root;
}

function makeSaucer(boss: boolean) {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(boss ? 1.35 : 0.72, boss ? 0.22 : 0.12, 10, 28),
    new THREE.MeshStandardMaterial({
      color: 0x1c2a33,
      emissive: LIM,
      emissiveIntensity: 0.55,
      metalness: 0.7,
      roughness: 0.28,
    }),
  );
  rim.rotation.x = Math.PI / 2;
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(boss ? 0.95 : 0.48, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0x7dffc4,
      emissive: 0x1dff88,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.55,
      roughness: 0.15,
    }),
  );
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(boss ? 1.4 : 0.76, boss ? 1.1 : 0.55, 0.16, 24),
    new THREE.MeshStandardMaterial({ color: 0x243038, metalness: 0.65, roughness: 0.35, emissive: 0x102018, emissiveIntensity: 0.4 }),
  );
  disc.position.y = -0.02;
  g.add(rim, dome, disc);

  const face = new THREE.Mesh(
    new THREE.CircleGeometry(boss ? 0.55 : 0.28, 20),
    new THREE.MeshBasicMaterial({ color: 0x88ff99 }),
  );
  face.position.set(0, 0.28, 0.42);
  g.add(face);
  g.userData.face = face;
  return g;
}

function makeStars() {
  const count = 900;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 80;
    pos[i * 3 + 1] = 6 + Math.random() * 40;
    pos[i * 3 + 2] = -8 - Math.random() * 90;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color: CREAM, size: 0.08, transparent: true, opacity: 0.85 }),
  );
}

export function World({ mission, presets, anthem, reduced, paused, onComplete }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(paused);
  const completeRef = useRef(onComplete);
  pausedRef.current = paused;
  completeRef.current = onComplete;

  useEffect(() => {
    const host = wrapRef.current;
    if (!host) return;

    const w0 = host.clientWidth || 390;
    const h0 = host.clientHeight || 700;
    const renderer = new THREE.WebGLRenderer({ antialias: !reduced, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w0, h0, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setClearColor(NIGHT, 1);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(mission === "desert" ? 0x120818 : 0x07040e, 0.028);
    scene.background = new THREE.Color(mission === "desert" ? 0x14091c : 0x07040e);

    const camera = new THREE.PerspectiveCamera(52, w0 / h0, 0.1, 140);
    camera.position.set(0, 2.05, 6.6);

    const sun = new THREE.DirectionalLight(0xb7c8ff, 1.15);
    sun.position.set(-6, 12, 4);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x3a2255, 0.55));
    scene.add(new THREE.HemisphereLight(0x554488, 0x3a2418, 0.55));
    const guitarLight = new THREE.PointLight(LIM, 0, 8, 2);
    scene.add(guitarLight);
    const moon = new THREE.PointLight(0x88aaff, 1.4, 60, 2);
    moon.position.set(8, 14, -10);
    scene.add(moon);

    const loader = new THREE.TextureLoader();
    const signTex = loader.load("/art/sign.webp");
    signTex.colorSpace = THREE.SRGBColorSpace;
    const faceIdle = loader.load("/art/boss-lock.webp");
    const facePanic = loader.load("/art/alien-scream.jpg");
    const faceScared = loader.load("/art/alien-scared.webp");
    const faceEat = loader.load("/art/alien-sour.webp");
    for (const t of [faceIdle, facePanic, faceScared, faceEat]) t.colorSpace = THREE.SRGBColorSpace;

    const world = new THREE.Group();
    scene.add(world);

    if (mission === "desert") {
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(90, 160),
        new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 1 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.z = -40;
      world.add(ground);
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(6.4, 160),
        new THREE.MeshStandardMaterial({ color: 0x161014, roughness: 0.9 }),
      );
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.02;
      road.position.z = -40;
      world.add(road);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xe8c84a });
      for (let i = 0; i < 40; i++) {
        const dash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 1.4), dashMat);
        dash.position.set(0, 0.05, 8 - i * 3.4);
        world.add(dash);
      }
      const mesaMat = new THREE.MeshStandardMaterial({ color: 0x4a2a38, roughness: 0.9 });
      for (let i = 0; i < 8; i++) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(4 + (i % 3), 2 + (i % 4), 3), mesaMat);
        m.position.set((i % 2 === 0 ? -1 : 1) * (10 + (i % 4) * 2), 1.2, -18 - i * 8);
        world.add(m);
      }
      const cactusMat = new THREE.MeshStandardMaterial({ color: 0x2f5a38, roughness: 0.7 });
      for (let i = 0; i < 12; i++) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 6), cactusMat);
        c.position.set((i % 2 === 0 ? -3.8 : 3.9) - (i % 3) * 0.3, 0.7, 4 - i * 5);
        world.add(c);
      }
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 2.8),
        new THREE.MeshBasicMaterial({ map: signTex, transparent: true }),
      );
      sign.position.set(-4.2, 1.6, -6);
      world.add(sign);
      scene.add(makeStars());
    } else {
      const hall = new THREE.Mesh(
        new THREE.BoxGeometry(22, 12, 50),
        new THREE.MeshStandardMaterial({ color: 0x120816, side: THREE.BackSide, metalness: 0.4, roughness: 0.55 }),
      );
      hall.position.z = -16;
      hall.position.y = 5;
      world.add(hall);
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(22, 50),
        new THREE.MeshStandardMaterial({ color: 0x1a1024, metalness: 0.5, roughness: 0.4, emissive: 0x0a0814, emissiveIntensity: 0.4 }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.z = -16;
      world.add(floor);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(5.5, 0.08, 8, 48),
        new THREE.MeshBasicMaterial({ color: LIM }),
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.05, -12);
      world.add(ring);
    }

    const player = makeGuitarist();
    player.position.set(0, 0, 2.1);
    player.scale.set(1.55, 1.55, 1.55);
    scene.add(player);

    const truck = new THREE.Group();
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.1, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x3a2418, roughness: 0.7, metalness: 0.2 }),
    );
    cab.position.y = 0.9;
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.45, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x2a1810 }),
    );
    bed.position.set(0, 0.55, -1.6);
    truck.add(cab, bed);
    truck.position.set(4.6, 0, 3.4);
    truck.rotation.y = -0.35;
    if (mission === "desert") scene.add(truck);

    const glowTex = glowTexture("#d6ff1a");
    const shotMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: LIM,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });
    const shots: Shot[] = [];
    for (let i = 0; i < NOTE_POOL; i++) {
      const sprite = new THREE.Sprite(shotMat.clone());
      sprite.scale.set(0.9, 0.9, 0.9);
      sprite.visible = false;
      scene.add(sprite);
      shots.push({ sprite, vx: 0, vy: 0, vz: 0, alive: false, life: 0, target: -1 });
    }

    const bits: { mesh: THREE.Mesh; vx: number; vy: number; vz: number; life: number }[] = [];
    const bitGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const bitMat = new THREE.MeshBasicMaterial({ color: LIM });
    for (let i = 0; i < BIT_POOL; i++) {
      const mesh = new THREE.Mesh(bitGeo, bitMat.clone());
      mesh.visible = false;
      scene.add(mesh);
      bits.push({ mesh, vx: 0, vy: 0, vz: 0, life: 0 });
    }

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.18, 1, 8, 1, true),
      new THREE.MeshBasicMaterial({
        color: LIM,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    beam.visible = false;
    scene.add(beam);

    const ufos: Ufo[] = [];
    let nextId = 1;
    let nextBand = 0;
    const juice = createJuice();
    let fireCool = 0;
    let waveCool = 0.6;
    let finished = false;
    let lockDing = false;
    let floatT = 0;
    let winT = -1;
    const camTarget = new THREE.Vector3();
    const look = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    const tmp2 = new THREE.Vector3();

    function popBits(x: number, y: number, z: number, color: number, n: number) {
      let spawned = 0;
      for (const b of bits) {
        if (b.life > 0) continue;
        b.mesh.visible = true;
        b.mesh.position.set(x, y, z);
        (b.mesh.material as THREE.MeshBasicMaterial).color.setHex(color);
        const a = Math.random() * Math.PI * 2;
        const p = 2 + Math.random() * 6;
        b.vx = Math.cos(a) * p;
        b.vy = 2 + Math.random() * 6;
        b.vz = Math.sin(a) * p;
        b.life = 0.45 + Math.random() * 0.4;
        spawned += 1;
        if (spawned >= n) break;
      }
    }

    function applyFace(u: Ufo, tex: THREE.Texture) {
      const face = u.root.userData.face as THREE.Mesh;
      const mat = face.material as THREE.MeshBasicMaterial;
      mat.map = tex;
      mat.color.setHex(0xffffff);
      mat.needsUpdate = true;
    }

    function spawnUfo(boss: boolean, x: number, y: number, z: number) {
      const root = makeSaucer(boss);
      root.position.set(x, y, z);
      scene.add(root);
      const u: Ufo = {
        id: nextId++,
        root,
        hp: boss ? 42 : 3,
        max: boss ? 42 : 3,
        alive: true,
        boss,
        phase: Math.random() * Math.PI * 2,
        x,
        y,
        z,
      };
      applyFace(u, boss ? faceIdle : faceScared);
      ufos.push(u);
      return u;
    }

    function spawnWave(n: number) {
      const count = mission === "mothership" ? 0 : 3 + Math.min(4, n);
      for (let i = 0; i < count; i++) {
        const x = -3.4 + (i % 5) * 1.7 + (Math.random() - 0.5) * 0.4;
        const y = 3.4 + Math.random() * 1.8;
        const z = -9 - Math.random() * 6 - n * 0.4;
        spawnUfo(false, x, y, z);
      }
      live.float = `WAVE ${n}`;
      floatT = 0.7;
    }

    if (mission === "mothership") {
      spawnUfo(true, 0, 3.6, -13);
      live.bossHp = 100;
      live.wave = 1;
      live.waves = 1;
    } else {
      live.wave = 1;
      live.waves = WAVE_COUNT;
      spawnWave(1);
    }

    startMusic(mission, anthem);

    const bloom = new UnrealBloomPass(new THREE.Vector2(w0, h0), reduced ? 0 : 0.72, 0.55, 0.18);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    const probe = {
      getYaw: () => -live.playerX,
      getSpeed: () => live.roadSpeed,
      getX: () => live.playerX,
      setKeys: (codes: string[]) => setInjectedKeys(codes),
      setSteer: (v: number) => setInjectedKeys(v > 0.2 ? ["KeyA"] : v < -0.2 ? ["KeyD"] : []),
    };
    window.__controlsTest = probe;

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const duration = mission === "desert" ? 78 : 55;
    live.duration = duration;

    function fireNote(px: number, py: number, pz: number, color: number, targetId: number) {
      const s = shots.find((n) => !n.alive);
      if (!s) return;
      s.alive = true;
      s.life = 1.6;
      s.target = targetId;
      s.sprite.visible = true;
      s.sprite.position.set(px, py, pz);
      (s.sprite.material as THREE.SpriteMaterial).color.setHex(color);
      s.vx = (Math.random() - 0.5) * 1.4;
      s.vy = 2.2;
      s.vz = -16;
      live.shots += 1;
    }

    function killUfo(u: Ufo, locked: boolean) {
      u.alive = false;
      u.root.visible = false;
      live.ufos += 1;
      sfxBoom();
      addTrauma(juice, locked ? 0.72 : 0.45);
      addHitstop(juice, locked ? 0.07 : 0.03);
      juice.flash = locked ? 0.5 : 0.28;
      popBits(u.x, u.y, u.z, locked ? LIM : CREAM, locked ? 28 : 16);
      burst(juice, 0, 0, "#d6ff1a", 12, 4);
      if (Math.random() < 0.45 || locked) {
        const mate = BAND_CYCLE[nextBand % BAND_CYCLE.length];
        nextBand += 1;
        if (!live.bandmates.includes(mate)) {
          live.bandmates = [...live.bandmates, mate];
          live.float = mate.toUpperCase();
          floatT = 1.2;
          sfxPower();
        }
      }
    }

    function finish() {
      if (finished) return;
      finished = true;
      stopMusic();
      completeRef.current();
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const cssW = host.clientWidth;
      const cssH = host.clientHeight;
      if (cssW && cssH && (renderer.domElement.width !== Math.floor(cssW * renderer.getPixelRatio()) || renderer.domElement.height !== Math.floor(cssH * renderer.getPixelRatio()))) {
        renderer.setSize(cssW, cssH, false);
        camera.aspect = cssW / cssH;
        camera.updateProjectionMatrix();
        composer.setSize(cssW, cssH);
        bloom.setSize(cssW, cssH);
      }

      if (pausedRef.current) {
        composer.render();
        return;
      }

      elapsed += juice.hitstop > 0 ? 0 : dt;
      live.songTime = elapsed;
      tickJuice(juice, dt, reduced);

      if (juice.hitstop <= 0) {
        const axis = moveAxis();
        const fire = isFiring();
        live.firing = fire;
        const limit = 3.6;
        player.position.x += axis * 8.5 * dt;
        player.position.x = Math.max(-limit, Math.min(limit, player.position.x));
        live.playerX = player.position.x;
        live.roadSpeed = 14;
        player.rotation.y = axis * -0.25;
        player.position.y = Math.sin(elapsed * 6) * 0.03;
        const strum = player.userData.strum as THREE.Group;
        strum.rotation.x = fire ? Math.sin(elapsed * 28) * 0.35 : Math.sin(elapsed * 2) * 0.05;
        guitarLight.position.set(player.position.x + 0.45, 2.1, player.position.z + 0.3);
        guitarLight.intensity = fire ? 4.2 : 0.55;

        if (mission === "desert") {
          world.position.z += 10 * dt;
          if (world.position.z > 3.4) world.position.z = 0;
        }

        const living = ufos.filter((u) => u.alive);
        let best: Ufo | null = null;
        let bestD = 99;
        for (const u of living) {
          u.phase += dt;
          if (u.boss) {
            u.x = Math.sin(elapsed * 0.55) * 2.8;
            u.y = 3.4 + Math.sin(elapsed * 1.3) * 0.35;
            u.z = -12.5;
          } else {
            u.x += Math.sin(elapsed * 0.8 + u.phase) * dt * 0.6;
            u.y += Math.sin(elapsed * 1.6 + u.phase) * dt * 0.4;
            u.z += dt * 1.6;
            if (u.z > 4) u.z = -22;
          }
          u.root.position.set(u.x, u.y, u.z);
          u.root.rotation.y = elapsed * 0.4;
          const dx = u.x - player.position.x;
          const d = Math.abs(dx) + Math.abs(u.z + 8) * 0.08;
          if (d < bestD) {
            bestD = d;
            best = u;
          }
        }

        if (best && Math.abs(best.x - player.position.x) < 1.8) {
          live.lockPct = Math.min(100, live.lockPct + dt * (fire ? 55 : 22));
        } else {
          live.lockPct = Math.max(0, live.lockPct - dt * 28);
        }
        live.locked = live.lockPct >= 100;
        if (live.locked && !lockDing) {
          sfxLock();
          live.float = "TARGET LOCK";
          floatT = 0.9;
          lockDing = true;
        }
        if (!live.locked) lockDing = false;

        if (mission === "mothership" && best?.boss) {
          if (live.bossHp <= 0) live.reaction = "collapse";
          else if (live.locked) live.reaction = "panic";
          else if (live.bandmates.includes("harmonica") && live.combo > 12) live.reaction = "dance";
          else if (anthem === "love" || anthem === "country") live.reaction = live.combo > 8 ? "eat" : "idle";
          else live.reaction = "idle";
          const tex =
            live.reaction === "panic" || live.reaction === "collapse"
              ? facePanic
              : live.reaction === "eat"
                ? faceEat
                : live.reaction === "dance"
                  ? faceScared
                  : faceIdle;
          applyFace(best, tex);
          live.bossHp = Math.max(0, (best.hp / best.max) * 100);
        }

        fireCool -= dt;
        if (fire && fireCool <= 0) {
          fireCool = live.bandmates.includes("drums") ? 0.09 : 0.14;
          const g = genreById(presets[Math.floor(elapsed * 2) % presets.length] ?? anthem);
          const extra = live.bandmates.length;
          sfxStrum();
          fireNote(player.position.x + 0.55, 2.05, player.position.z + 0.35, hexColor(g.color), best?.id ?? -1);
          if (extra > 0) fireNote(player.position.x - 0.2, 2.2, player.position.z + 0.35, LIM, best?.id ?? -1);
        }

        for (const s of shots) {
          if (!s.alive) continue;
          s.life -= dt;
          const tgt = ufos.find((u) => u.id === s.target && u.alive);
          if (tgt) {
            tmp.set(tgt.x, tgt.y, tgt.z).sub(s.sprite.position);
            const dist = Math.max(0.001, tmp.length());
            tmp.multiplyScalar(1 / dist);
            const spd = live.locked ? 36 : 26;
            s.vx = tmp.x * spd;
            s.vy = tmp.y * spd;
            s.vz = tmp.z * spd;
          }
          s.sprite.position.x += s.vx * dt;
          s.sprite.position.y += s.vy * dt;
          s.sprite.position.z += s.vz * dt;
          let hit = false;
          for (const u of living) {
            const d = s.sprite.position.distanceTo(tmp2.set(u.x, u.y, u.z));
            if (d < (u.boss ? 2.4 : 1.85)) {
              hit = true;
              const dmg = live.locked ? 2.2 : 1;
              u.hp -= dmg;
              live.combo += 1;
              live.multiplier = Math.min(8, 1 + Math.floor(live.combo / 8));
              const pts = Math.round((live.locked ? 220 : 90) * live.multiplier);
              live.score += pts;
              if (live.locked) live.perfects += 1;
              else live.goods += 1;
              live.float = live.locked ? "LOCKED" : "HIT";
              floatT = 0.45;
              sfxHit("perfect");
              popBits(u.x, u.y, u.z, LIM, 6);
              addTrauma(juice, 0.12);
              if (u.hp <= 0) killUfo(u, live.locked);
              if (u.boss) live.bossHp = Math.max(0, (u.hp / u.max) * 100);
              break;
            }
          }
          if (hit || s.life <= 0 || s.sprite.position.z < -40) {
            if (!hit && s.life <= 0 && living.length > 0) live.misses += 1;
            s.alive = false;
            s.sprite.visible = false;
          }
        }

        if (best && fire) {
          beam.visible = true;
          const from = tmp.set(player.position.x + 0.55, 2.0, player.position.z + 0.3);
          const to = tmp2.set(best.x, best.y, best.z);
          const dist = from.distanceTo(to);
          beam.position.copy(from).lerp(to, 0.5);
          beam.scale.set(1, dist, 1);
          beam.lookAt(to);
          beam.rotateX(Math.PI / 2);
          (beam.material as THREE.MeshBasicMaterial).opacity = live.locked ? 0.85 : 0.4;
        } else {
          beam.visible = false;
        }

        if (winT >= 0) {
          winT -= dt;
          if (winT <= 0) finish();
        } else if (mission === "desert") {
          const remain = ufos.filter((u) => u.alive);
          if (remain.length === 0) {
            waveCool -= dt;
            if (waveCool <= 0) {
              if (live.wave >= WAVE_COUNT) {
                live.float = "THEY'RE PULLING YOU IN";
                floatT = 1.4;
                winT = 1.5;
              } else {
                live.wave += 1;
                spawnWave(live.wave);
                waveCool = 0.8;
              }
            }
          } else waveCool = 0.8;
        } else if (live.bossHp <= 0) {
          live.reaction = "collapse";
          live.float = "BOSS DOWN";
          floatT = 1.4;
          winT = 1.6;
        }

        if (elapsed >= duration && winT < 0) {
          winT = 0.4;
        }
      }

      floatT = Math.max(0, floatT - dt);
      if (floatT <= 0 && live.float && live.float !== "TARGET LOCK") live.float = "";

      for (const b of bits) {
        if (b.life <= 0) continue;
        b.life -= dt;
        b.vy -= 9 * dt;
        b.mesh.position.x += b.vx * dt;
        b.mesh.position.y += b.vy * dt;
        b.mesh.position.z += b.vz * dt;
        if (b.life <= 0) b.mesh.visible = false;
      }

      const shake = reduced ? 0 : juice.trauma * juice.trauma;
      camTarget.set(player.position.x * 0.45, 2.05 + shake * Math.sin(now * 0.04), 6.6);
      camera.position.x += (camTarget.x - camera.position.x) * (1 - Math.exp(-6 * dt));
      camera.position.y += (camTarget.y - camera.position.y) * (1 - Math.exp(-6 * dt));
      look.set(player.position.x * 0.35, 1.7, -3.2);
      camera.lookAt(look);

      composer.render();
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      stopMusic();
      setInjectedKeys([]);
      if (window.__controlsTest === probe) delete window.__controlsTest;
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      glowTex.dispose();
      signTex.dispose();
      faceIdle.dispose();
      facePanic.dispose();
      faceScared.dispose();
      faceEat.dispose();
    };
  }, [mission, presets, anthem, reduced]);

  return <div ref={wrapRef} className="absolute inset-0 h-full w-full" />;
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getX: () => number;
      setKeys?: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
  }
}
