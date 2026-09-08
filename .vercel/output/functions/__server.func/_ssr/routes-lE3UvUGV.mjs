import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Radio, c as Disc3, i as RotateCcw, n as Volume2, o as Play, s as Pause, t as VolumeX } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { A as Sprite, C as PlaneGeometry, D as SRGBColorSpace, E as PointsMaterial, F as Vector3, M as TextureLoader, N as TorusGeometry, O as Scene, P as Vector2, S as PerspectiveCamera, T as Points, _ as Group, a as WebGLRenderer, b as MeshBasicMaterial, c as BufferAttribute, d as CapsuleGeometry, f as CircleGeometry, g as FogExp2, h as DirectionalLight, i as EffectComposer, j as SpriteMaterial, k as SphereGeometry, l as BufferGeometry, m as CylinderGeometry, n as RenderPass, o as AmbientLight, p as Color, r as OutputPass, s as BoxGeometry, t as UnrealBloomPass, u as CanvasTexture, v as HemisphereLight, w as PointLight, x as MeshStandardMaterial, y as Mesh } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-lE3UvUGV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GENRES = [
	{
		id: "rock",
		name: "Rock & Roll",
		short: "ROCK",
		bpm: 132,
		color: "#FF6A3D"
	},
	{
		id: "classical",
		name: "Classical",
		short: "CLASS",
		bpm: 108,
		color: "#F3E6C8"
	},
	{
		id: "love",
		name: "Love Songs",
		short: "LOVE",
		bpm: 96,
		color: "#E8A0B8"
	},
	{
		id: "country",
		name: "Country",
		short: "CTRY",
		bpm: 118,
		color: "#D6FF1A"
	},
	{
		id: "blues",
		name: "Blues",
		short: "BLUES",
		bpm: 92,
		color: "#6AA7C4"
	},
	{
		id: "rap",
		name: "Rap",
		short: "RAP",
		bpm: 96,
		color: "#C4A574"
	},
	{
		id: "metal",
		name: "Heavy Metal",
		short: "METAL",
		bpm: 148,
		color: "#C9C4D6"
	}
];
function genreById(id) {
	return GENRES.find((g) => g.id === id);
}
var DEFAULT_PRESETS = [
	"country",
	"rock",
	"blues",
	"metal",
	"love"
];
var DEFAULT_ANTHEM = "country";
var kit = null;
var muted = false;
var musicTimer = 0;
var step = 0;
var nextNote = 0;
var playing = false;
var bpm = 118;
var anthem = "country";
var mission = "idle";
var noiseBuf = null;
function ensure() {
	if (kit) return kit;
	const ctx = new AudioContext({ latencyHint: "interactive" });
	const master = ctx.createGain();
	const music = ctx.createGain();
	const sfx = ctx.createGain();
	music.gain.value = .22;
	sfx.gain.value = .55;
	master.gain.value = muted ? 0 : 1;
	music.connect(master);
	sfx.connect(master);
	master.connect(ctx.destination);
	const n = ctx.createBuffer(1, ctx.sampleRate * .2, ctx.sampleRate);
	const d = n.getChannelData(0);
	for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
	noiseBuf = n;
	kit = {
		ctx,
		master,
		music,
		sfx
	};
	return kit;
}
function unlockAudio() {
	const { ctx } = ensure();
	if (ctx.state === "suspended") ctx.resume();
}
function setMutedAudio(next) {
	muted = next;
	if (!kit) return;
	kit.master.gain.setTargetAtTime(next ? 0 : 1, kit.ctx.currentTime, .02);
}
function resumeAudio() {
	if (!kit) return;
	if (kit.ctx.state === "suspended") kit.ctx.resume();
}
function envGain(ctx, when, peak, dur) {
	const g = ctx.createGain();
	g.gain.setValueAtTime(1e-4, when);
	g.gain.exponentialRampToValueAtTime(peak, when + .008);
	g.gain.exponentialRampToValueAtTime(1e-4, when + dur);
	return g;
}
function tone(bus, when, freq, dur, type, peak) {
	if (!kit) return;
	const { ctx } = kit;
	const o = ctx.createOscillator();
	const g = envGain(ctx, when, peak, dur);
	o.type = type;
	o.frequency.setValueAtTime(freq, when);
	o.connect(g).connect(bus);
	o.start(when);
	o.stop(when + dur + .03);
}
function hat(when, open) {
	if (!kit || !noiseBuf) return;
	const { ctx, music } = kit;
	const src = ctx.createBufferSource();
	src.buffer = noiseBuf;
	const f = ctx.createBiquadFilter();
	f.type = "highpass";
	f.frequency.value = open ? 6e3 : 9e3;
	const g = envGain(ctx, when, open ? .08 : .05, open ? .12 : .04);
	src.connect(f).connect(g).connect(music);
	src.start(when);
	src.stop(when + .14);
}
function kick(when) {
	if (!kit) return;
	const { ctx, music } = kit;
	const o = ctx.createOscillator();
	const g = envGain(ctx, when, .55, .16);
	o.type = "sine";
	o.frequency.setValueAtTime(140, when);
	o.frequency.exponentialRampToValueAtTime(42, when + .12);
	o.connect(g).connect(music);
	o.start(when);
	o.stop(when + .18);
}
var SCALES = {
	rock: [
		0,
		0,
		7,
		12,
		7,
		5,
		7,
		12
	],
	classical: [
		0,
		4,
		7,
		12,
		16,
		12,
		7,
		4
	],
	love: [
		0,
		3,
		7,
		10,
		7,
		3,
		0,
		7
	],
	country: [
		0,
		2,
		4,
		7,
		9,
		7,
		4,
		2
	],
	blues: [
		0,
		3,
		5,
		6,
		7,
		10,
		7,
		3
	],
	rap: [
		0,
		0,
		7,
		0,
		5,
		0,
		7,
		10
	],
	metal: [
		0,
		0,
		1,
		0,
		7,
		0,
		6,
		12
	]
};
function midi(base, semitone) {
	return base * Math.pow(2, semitone / 12);
}
function scheduleStep(when) {
	if (!kit) return;
	const { music } = kit;
	const scale = SCALES[anthem];
	const degree = scale[step % scale.length];
	const bar = Math.floor(step / 16);
	const inBar = step % 16;
	const intense = mission === "mothership";
	if (inBar % 4 === 0) kick(when);
	if (anthem === "rap" && (inBar === 4 || inBar === 12)) kick(when + .001);
	if (inBar % 2 === 1) hat(when, inBar % 8 === 7);
	if (intense && inBar % 4 === 2) hat(when, false);
	const root = anthem === "classical" ? 196 : anthem === "metal" ? 110 : 146.8;
	if (inBar % 2 === 0) tone(music, when, midi(root / 2, degree), .18, "triangle", .12);
	if (inBar % (anthem === "love" || anthem === "blues" ? 2 : 1) === 0) {
		const oct = intense && bar % 2 === 1 ? 12 : 0;
		const wave = anthem === "classical" ? "sine" : anthem === "metal" ? "sawtooth" : "square";
		tone(music, when, midi(root, degree + oct), .14, wave, intense ? .11 : .08);
	}
	step++;
}
function tickMusic() {
	if (!playing || !kit) return;
	const { ctx } = kit;
	const horizon = ctx.currentTime + .12;
	const stepDur = 60 / bpm / 4;
	while (nextNote < horizon) {
		scheduleStep(nextNote);
		nextNote += stepDur;
	}
}
function startMusic(kind, nextAnthem) {
	unlockAudio();
	const { ctx } = ensure();
	anthem = nextAnthem;
	mission = kind;
	const g = genreById(nextAnthem);
	bpm = kind === "mothership" ? Math.round(g.bpm * 1.08) : kind === "desert" ? Math.round(g.bpm * .92) : 104;
	step = 0;
	nextNote = ctx.currentTime + .05;
	playing = true;
	if (musicTimer) window.clearInterval(musicTimer);
	tickMusic();
	musicTimer = window.setInterval(tickMusic, 25);
}
function stopMusic() {
	playing = false;
	mission = "idle";
	if (musicTimer) {
		window.clearInterval(musicTimer);
		musicTimer = 0;
	}
}
function sfxHit(quality) {
	unlockAudio();
	const { ctx, sfx } = ensure();
	const when = ctx.currentTime;
	if (quality === "miss") {
		tone(sfx, when, 90, .16, "sawtooth", .12);
		return;
	}
	const f = quality === "perfect" ? 880 : 660;
	tone(sfx, when, f, .07, "square", .16);
	tone(sfx, when, f * 1.5, .05, "triangle", .08);
}
function sfxBoom() {
	unlockAudio();
	const { ctx, sfx } = ensure();
	const when = ctx.currentTime;
	tone(sfx, when, 70, .28, "sine", .4);
	tone(sfx, when, 180, .12, "sawtooth", .12);
}
function sfxPower() {
	unlockAudio();
	const { ctx, sfx } = ensure();
	const when = ctx.currentTime;
	tone(sfx, when, 523, .1, "square", .14);
	tone(sfx, when + .07, 784, .12, "square", .12);
}
function sfxClick() {
	unlockAudio();
	const { ctx, sfx } = ensure();
	tone(sfx, ctx.currentTime, 420, .04, "square", .1);
}
function sfxWhoosh() {
	unlockAudio();
	const { ctx, sfx } = ensure();
	const when = ctx.currentTime;
	tone(sfx, when, 220, .4, "sine", .18);
	tone(sfx, when, 60, .5, "triangle", .22);
}
function sfxRadioOn() {
	unlockAudio();
	const { ctx, sfx } = ensure();
	const when = ctx.currentTime;
	tone(sfx, when, 180, .08, "square", .08);
	tone(sfx, when + .06, 240, .08, "square", .08);
}
function sfxStrum() {
	unlockAudio();
	const { ctx, sfx } = ensure();
	const when = ctx.currentTime;
	tone(sfx, when, 196, .11, "sawtooth", .07);
	tone(sfx, when, 247, .09, "square", .05);
	tone(sfx, when, 294, .13, "triangle", .06);
}
function sfxLock() {
	unlockAudio();
	const { ctx, sfx } = ensure();
	const when = ctx.currentTime;
	tone(sfx, when, 740, .08, "sine", .1);
	tone(sfx, when + .05, 980, .1, "sine", .08);
}
var MOVE_LEFT = /* @__PURE__ */ new Set(["KeyA", "ArrowLeft"]);
var MOVE_RIGHT = /* @__PURE__ */ new Set(["KeyD", "ArrowRight"]);
var FIRE = /* @__PURE__ */ new Set([
	"KeyW",
	"ArrowUp",
	"Space"
]);
var pads = {
	left: false,
	right: false,
	up: false,
	axisX: 0,
	pauseJust: false,
	muteJust: false
};
var injected = null;
var attached = false;
function setInjectedKeys(codes) {
	injected = new Set(codes);
}
function setAxisX(v) {
	pads.axisX = Math.max(-1, Math.min(1, v));
}
function setFire(on) {
	if (on) unlockAudio();
	pads.up = on;
}
function moveAxis() {
	let x = pads.axisX;
	const src = injected ?? null;
	const left = src ? [...MOVE_LEFT].some((c) => src.has(c)) : pads.left;
	const right = src ? [...MOVE_RIGHT].some((c) => src.has(c)) : pads.right;
	if (left) x -= 1;
	if (right) x += 1;
	if (x > 1) x = 1;
	if (x < -1) x = -1;
	return x;
}
function isFiring() {
	if (injected) return [...FIRE].some((c) => injected.has(c));
	return pads.up;
}
function onKeyDown(e) {
	if (!MOVE_LEFT.has(e.code) && !MOVE_RIGHT.has(e.code) && !FIRE.has(e.code) && e.code !== "Escape" && e.code !== "KeyP" && e.code !== "KeyM") return;
	e.preventDefault();
	if (e.repeat) {
		if (MOVE_LEFT.has(e.code)) pads.left = true;
		if (MOVE_RIGHT.has(e.code)) pads.right = true;
		if (FIRE.has(e.code)) pads.up = true;
		return;
	}
	unlockAudio();
	if (MOVE_LEFT.has(e.code)) pads.left = true;
	if (MOVE_RIGHT.has(e.code)) pads.right = true;
	if (FIRE.has(e.code)) pads.up = true;
	if (e.code === "Escape" || e.code === "KeyP") pads.pauseJust = true;
	if (e.code === "KeyM") pads.muteJust = true;
}
function onKeyUp(e) {
	if (MOVE_LEFT.has(e.code)) pads.left = false;
	if (MOVE_RIGHT.has(e.code)) pads.right = false;
	if (FIRE.has(e.code)) pads.up = false;
}
function clearKeys() {
	pads.left = false;
	pads.right = false;
	pads.up = false;
	pads.axisX = 0;
}
function attachInput() {
	if (attached || typeof window === "undefined") return () => {};
	attached = true;
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
	window.addEventListener("blur", clearKeys);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) clearKeys();
	});
	return () => {
		attached = false;
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
		window.removeEventListener("blur", clearKeys);
		clearKeys();
	};
}
var SAVE_KEY = "cr9-save-v2";
var SAVE_VERSION = 2;
function loadSave() {
	const fallback = {
		version: SAVE_VERSION,
		highScore: 0,
		muted: false,
		presets: [...DEFAULT_PRESETS],
		anthem: DEFAULT_ANTHEM
	};
	if (typeof window === "undefined") return fallback;
	try {
		const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem("cr9-save-v1");
		if (!raw) return fallback;
		const parsed = JSON.parse(raw);
		return {
			...fallback,
			...parsed,
			version: SAVE_VERSION,
			presets: Array.isArray(parsed.presets) && parsed.presets.length === 5 ? parsed.presets : fallback.presets
		};
	} catch {
		return fallback;
	}
}
function writeSave(partial) {
	try {
		const cur = loadSave();
		localStorage.setItem(SAVE_KEY, JSON.stringify({
			...cur,
			...partial,
			version: SAVE_VERSION
		}));
	} catch {}
}
var initial = loadSave();
var useGame = create((set, get) => ({
	scene: "title",
	presets: initial.presets,
	anthem: initial.anthem,
	muted: initial.muted,
	highScore: initial.highScore,
	lastRun: null,
	setScene: (scene) => set({ scene }),
	togglePreset: (id) => {
		const { presets, anthem } = get();
		const has = presets.includes(id);
		let next;
		if (has) {
			if (presets.length <= 1) return;
			next = presets.filter((g) => g !== id);
		} else {
			if (presets.length >= 5) return;
			next = [...presets, id];
		}
		const nextAnthem = next.includes(anthem) ? anthem : next[0];
		writeSave({
			presets: next,
			anthem: nextAnthem
		});
		set({
			presets: next,
			anthem: nextAnthem
		});
	},
	setAnthem: (id) => {
		if (!get().presets.includes(id)) return;
		writeSave({ anthem: id });
		set({ anthem: id });
	},
	setMuted: (muted) => {
		writeSave({ muted });
		set({ muted });
	},
	finishRun: (run) => {
		const highScore = Math.max(get().highScore, run.score);
		writeSave({ highScore });
		set({
			lastRun: run,
			highScore,
			scene: "results"
		});
	},
	resetRun: () => set({
		lastRun: null,
		scene: "dashboard"
	})
}));
var live = {
	score: 0,
	combo: 0,
	multiplier: 1,
	perfects: 0,
	goods: 0,
	misses: 0,
	songTime: 0,
	duration: 90,
	ufos: 0,
	bossHp: 100,
	reaction: "idle",
	bandmates: [],
	float: "",
	wave: 1,
	waves: 8,
	lockPct: 0,
	locked: false,
	playerX: 0,
	firing: false,
	roadSpeed: 14,
	shots: 0
};
function resetLive(duration) {
	live.score = 0;
	live.combo = 0;
	live.multiplier = 1;
	live.perfects = 0;
	live.goods = 0;
	live.misses = 0;
	live.songTime = 0;
	live.duration = duration;
	live.ufos = 0;
	live.bossHp = 100;
	live.reaction = "idle";
	live.bandmates = [];
	live.float = "";
	live.wave = 1;
	live.waves = 8;
	live.lockPct = 0;
	live.locked = false;
	live.playerX = 0;
	live.firing = false;
	live.roadSpeed = 14;
	live.shots = 0;
}
function Title() {
	const setScene = useGame((s) => s.setScene);
	const muted = useGame((s) => s.muted);
	const setMuted = useGame((s) => s.setMuted);
	const highScore = useGame((s) => s.highScore);
	function start() {
		unlockAudio();
		sfxRadioOn();
		startMusic("radio", useGame.getState().anthem);
		setScene("dashboard");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative flex h-full flex-col overflow-hidden bg-night",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				className: "absolute inset-0 h-full w-full object-cover",
				src: "/video/shred.mp4",
				autoPlay: true,
				muted: true,
				loop: true,
				playsInline: true,
				poster: "/art/hero-desert.webp"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-b from-night/35 via-night/50 to-night" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "paint-drip" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "film-grain" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 flex items-center justify-between px-5 pt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.22em] text-muted uppercase",
					children: "Sour Paint Studios"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-ghost h-10 min-h-10 px-3",
					"aria-label": muted ? "Unmute" : "Mute",
					onClick: (e) => {
						e.stopPropagation();
						unlockAudio();
						setMuted(!muted);
					},
					children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex flex-1 flex-col items-center justify-end px-6 pb-4 text-center stagger-in",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/art/logo.webp",
						alt: "Sour Paint Studios",
						className: "mb-3 h-16 w-28 rounded-md border border-cream/20 object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-medium tracking-[0.28em] text-lime uppercase",
						children: "Arcade guitar shooter"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display text-[clamp(3.2rem,14vw,5.4rem)] text-cream",
						children: "County Road 9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-sm text-sm leading-relaxed text-cream/80",
						children: "Tune the truck. Shred the saucers. Make the aliens dance."
					}),
					highScore > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs tracking-[0.18em] text-cream/80 uppercase",
						children: ["Best ", highScore.toLocaleString()]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 px-6 pb-[max(28px,env(safe-area-inset-bottom))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "btn-primary w-full",
					onClick: start,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }), "Climb in the truck"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-center text-xs text-muted",
					children: "Steer L/R. Hold UP to shred. Lock the saucer."
				})]
			})
		]
	});
}
function Dashboard() {
	const presets = useGame((s) => s.presets);
	const anthem = useGame((s) => s.anthem);
	const togglePreset = useGame((s) => s.togglePreset);
	const setAnthem = useGame((s) => s.setAnthem);
	const setScene = useGame((s) => s.setScene);
	const ready = presets.length === 5;
	function cruise() {
		if (!ready) return;
		unlockAudio();
		startMusic("radio", anthem);
		setScene("drive");
	}
	function tapGenre(id) {
		sfxClick();
		togglePreset(id);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative flex h-full flex-col overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/dashboard.webp",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-night/38" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "paint-drip" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "film-grain" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex h-full flex-col px-5 pt-6 pb-[max(20px,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.22em] text-lime uppercase",
						children: "Dashboard setup"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display mt-1 text-4xl text-cream",
						children: "Dash radio"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-md text-sm leading-relaxed text-muted",
						children: "Five mechanical presets. Slide an 8-track for the anthem. Then we roll County Road 9."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: GENRES.map((g) => {
							const on = presets.includes(g.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `radio-key ${on ? "is-on" : ""}`,
								onClick: () => tapGenre(g.id),
								"aria-pressed": on,
								children: g.short
							}, g.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: [presets.length, " / 5 presets locked"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "tape-slot mt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-muted uppercase",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disc3, { className: "size-3.5" }), "8-track anthem"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: presets.map((id) => {
								const g = GENRES.find((x) => x.id === id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: `radio-key min-w-20 px-3 ${anthem === id ? "is-on" : ""}`,
									onClick: () => {
										sfxClick();
										setAnthem(id);
									},
									children: g.short
								}, id);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-auto pt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn-primary w-full",
							disabled: !ready,
							onClick: cruise,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }), "Hit the road"]
						})
					})
				]
			})
		]
	});
}
function Drive() {
	const setScene = useGame((s) => s.setScene);
	const presets = useGame((s) => s.presets);
	const anthem = useGame((s) => s.anthem);
	(0, import_react.useEffect)(() => {
		unlockAudio();
		const t = window.setTimeout(() => setScene("abduction"), 5200);
		return () => window.clearTimeout(t);
	}, [setScene]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative flex h-full flex-col overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/dashboard.webp",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-night/40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "paint-drip" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "film-grain" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex h-full flex-col px-6 pt-10 pb-[max(24px,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.22em] text-lime uppercase",
						children: "Night drive"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display mt-2 text-5xl text-cream",
						children: "County Road 9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-sm text-sm leading-relaxed text-cream/85",
						children: "AM hiss. White lines. The wash is empty until it is not."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex flex-wrap gap-2",
						children: presets.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${id === anthem ? "bg-lime text-night" : "bg-oil text-cream"}`,
							children: id
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-ghost mt-auto self-start",
						onClick: () => setScene("abduction"),
						children: "Keep rolling"
					})
				]
			})
		]
	});
}
function Abduction() {
	const setScene = useGame((s) => s.setScene);
	(0, import_react.useEffect)(() => {
		sfxWhoosh();
		const t = window.setTimeout(() => setScene("desert"), 4800);
		return () => window.clearTimeout(t);
	}, [setScene]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative flex h-full flex-col overflow-hidden bg-night flash-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				className: "absolute inset-0 h-full w-full object-cover",
				src: "/video/lock-on.mp4",
				autoPlay: true,
				muted: true,
				playsInline: true,
				poster: "/art/chase.webp"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-night via-night/30 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "paint-drip" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "film-grain" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex h-full flex-col px-6 pt-12 pb-[max(24px,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.22em] text-lime uppercase",
						children: "The abduction"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display mt-2 text-5xl text-cream",
						children: "Shield your eyes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-sm text-sm leading-relaxed text-cream/85",
						children: "Hard light over the cholla. Martin out of the cab. The first saucers are already dropping."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-primary mt-auto",
						onClick: () => setScene("desert"),
						children: "Step into the road"
					})
				]
			})
		]
	});
}
function BeamUp() {
	const setScene = useGame((s) => s.setScene);
	(0, import_react.useEffect)(() => {
		sfxWhoosh();
		const t = window.setTimeout(() => setScene("mothership"), 5200);
		return () => window.clearTimeout(t);
	}, [setScene]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative flex h-full flex-col overflow-hidden bg-night",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				className: "absolute inset-0 h-full w-full object-cover",
				src: "/video/mothership.mp4",
				autoPlay: true,
				muted: true,
				playsInline: true,
				poster: "/art/chase.webp"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-night via-transparent to-night/40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "paint-drip" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "film-grain" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex h-full flex-col px-6 pt-12 pb-[max(24px,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.22em] text-lime uppercase",
						children: "Inside the vessel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display mt-2 text-5xl text-cream",
						children: "One boss. One riff."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-sm text-sm leading-relaxed text-cream/85",
						children: "No trash mobs. Lock ALN-007 and play until it dances, eats, or drops."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-primary mt-auto",
						onClick: () => setScene("mothership"),
						children: "Take the mothership"
					})
				]
			})
		]
	});
}
var POOL = 160;
function createJuice() {
	return {
		trauma: 0,
		hitstop: 0,
		flash: 0,
		punch: 0,
		particles: []
	};
}
function addTrauma(j, amount) {
	j.trauma = Math.min(1, j.trauma + amount);
}
function addHitstop(j, seconds) {
	j.hitstop = Math.max(j.hitstop, seconds);
}
function burst(j, x, y, color, count, power) {
	const n = Math.min(count, POOL - j.particles.length);
	for (let i = 0; i < n; i++) {
		const a = Math.random() * Math.PI * 2;
		const s = (.35 + Math.random()) * power;
		j.particles.push({
			x,
			y,
			vx: Math.cos(a) * s,
			vy: Math.sin(a) * s - power * .25,
			life: .35 + Math.random() * .45,
			max: .8,
			size: 2 + Math.random() * 5,
			color,
			drip: Math.random() < .35
		});
	}
}
function tickJuice(j, dt, reduced) {
	if (j.hitstop > 0) {
		j.hitstop -= dt;
		if (j.hitstop < 0) j.hitstop = 0;
	}
	const decay = reduced ? 6 : 2.4;
	j.trauma = Math.max(0, j.trauma - decay * dt);
	j.flash = Math.max(0, j.flash - dt * 4);
	j.punch = Math.max(0, j.punch - dt * 5);
	for (let i = j.particles.length - 1; i >= 0; i--) {
		const p = j.particles[i];
		p.life -= dt;
		p.x += p.vx * dt * 60;
		p.y += p.vy * dt * 60;
		p.vy += (p.drip ? 28 : 12) * dt;
		p.vx *= .98;
		if (p.life <= 0) j.particles.splice(i, 1);
	}
}
var WAVE_COUNT = 8;
var NOTE_POOL = 32;
var BIT_POOL = 64;
var LIM = 14090010;
var CREAM = 15984328;
var NIGHT = 787988;
var BAND_CYCLE = [
	"harmonica",
	"bass",
	"drums"
];
function hexColor(css) {
	return Number.parseInt(css.slice(1), 16);
}
function glowTexture(rgb) {
	const c = document.createElement("canvas");
	c.width = 64;
	c.height = 64;
	const g = c.getContext("2d");
	const grd = g.createRadialGradient(32, 32, 2, 32, 32, 30);
	grd.addColorStop(0, "#fff");
	grd.addColorStop(.18, rgb);
	grd.addColorStop(1, "rgba(0,0,0,0)");
	g.fillStyle = grd;
	g.fillRect(0, 0, 64, 64);
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	return tex;
}
function makeGuitarist() {
	const root = new Group();
	const skin = new MeshStandardMaterial({
		color: 15254688,
		roughness: .55
	});
	const shirt = new MeshStandardMaterial({
		color: 1445912,
		roughness: .7
	});
	const jeans = new MeshStandardMaterial({
		color: 2372684,
		roughness: .8
	});
	const hair = new MeshStandardMaterial({
		color: 14860362,
		roughness: .45
	});
	const wood = new MeshStandardMaterial({
		color: 12884554,
		roughness: .4,
		emissive: 3809800,
		emissiveIntensity: .2
	});
	const torso = new Mesh(new CapsuleGeometry(.28, .55, 4, 8), shirt);
	torso.position.y = 1.15;
	torso.castShadow = true;
	root.add(torso);
	const head = new Mesh(new SphereGeometry(.22, 16, 12), skin);
	head.position.y = 1.72;
	root.add(head);
	const hairMesh = new Mesh(new SphereGeometry(.24, 12, 8), hair);
	hairMesh.scale.set(1.05, .7, 1.1);
	hairMesh.position.set(0, 1.86, -.02);
	root.add(hairMesh);
	const legL = new Mesh(new CapsuleGeometry(.1, .55, 3, 6), jeans);
	const legR = legL.clone();
	legL.position.set(-.14, .42, 0);
	legR.position.set(.14, .42, 0);
	root.add(legL, legR);
	const armL = new Mesh(new CapsuleGeometry(.07, .42, 3, 6), shirt);
	armL.position.set(-.4, 1.28, .05);
	armL.rotation.z = .45;
	root.add(armL);
	const strum = new Group();
	strum.position.set(.34, 1.28, .12);
	const armR = new Mesh(new CapsuleGeometry(.07, .42, 3, 6), shirt);
	armR.rotation.z = -.7;
	armR.position.set(.12, -.1, .05);
	strum.add(armR);
	const guitar = new Group();
	guitar.position.set(.05, -.05, .28);
	guitar.rotation.set(.2, .4, -1.05);
	const body = new Mesh(new SphereGeometry(.28, 12, 10), wood);
	body.scale.set(.85, 1, .28);
	const neck = new Mesh(new BoxGeometry(.07, .72, .06), new MeshStandardMaterial({ color: 2759184 }));
	neck.position.set(0, .52, 0);
	guitar.add(body, neck);
	strum.add(guitar);
	root.add(strum);
	const harm = new Mesh(new BoxGeometry(.22, .05, .06), new MeshStandardMaterial({
		color: 9079442,
		metalness: .6,
		roughness: .3
	}));
	harm.position.set(0, 1.62, .2);
	root.add(harm);
	root.userData.strum = strum;
	root.userData.guitar = guitar;
	return root;
}
function makeSaucer(boss) {
	const g = new Group();
	const rim = new Mesh(new TorusGeometry(boss ? 1.35 : .72, boss ? .22 : .12, 10, 28), new MeshStandardMaterial({
		color: 1845811,
		emissive: LIM,
		emissiveIntensity: .55,
		metalness: .7,
		roughness: .28
	}));
	rim.rotation.x = Math.PI / 2;
	const dome = new Mesh(new SphereGeometry(boss ? .95 : .48, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new MeshStandardMaterial({
		color: 8257476,
		emissive: 1965960,
		emissiveIntensity: .35,
		transparent: true,
		opacity: .55,
		roughness: .15
	}));
	const disc = new Mesh(new CylinderGeometry(boss ? 1.4 : .76, boss ? 1.1 : .55, .16, 24), new MeshStandardMaterial({
		color: 2371640,
		metalness: .65,
		roughness: .35,
		emissive: 1056792,
		emissiveIntensity: .4
	}));
	disc.position.y = -.02;
	g.add(rim, dome, disc);
	const face = new Mesh(new CircleGeometry(boss ? .55 : .28, 20), new MeshBasicMaterial({ color: 8978329 }));
	face.position.set(0, .28, .42);
	g.add(face);
	g.userData.face = face;
	return g;
}
function makeStars() {
	const count = 900;
	const pos = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		pos[i * 3] = (Math.random() - .5) * 80;
		pos[i * 3 + 1] = 6 + Math.random() * 40;
		pos[i * 3 + 2] = -8 - Math.random() * 90;
	}
	const geo = new BufferGeometry();
	geo.setAttribute("position", new BufferAttribute(pos, 3));
	return new Points(geo, new PointsMaterial({
		color: CREAM,
		size: .08,
		transparent: true,
		opacity: .85
	}));
}
function World({ mission, presets, anthem, reduced, paused, onComplete }) {
	const wrapRef = (0, import_react.useRef)(null);
	const pausedRef = (0, import_react.useRef)(paused);
	const completeRef = (0, import_react.useRef)(onComplete);
	pausedRef.current = paused;
	completeRef.current = onComplete;
	(0, import_react.useEffect)(() => {
		const host = wrapRef.current;
		if (!host) return;
		const w0 = host.clientWidth || 390;
		const h0 = host.clientHeight || 700;
		const renderer = new WebGLRenderer({
			antialias: !reduced,
			alpha: false,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.setSize(w0, h0, false);
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.toneMapping = 4;
		renderer.toneMappingExposure = 1.12;
		renderer.setClearColor(NIGHT, 1);
		host.appendChild(renderer.domElement);
		renderer.domElement.style.width = "100%";
		renderer.domElement.style.height = "100%";
		renderer.domElement.style.display = "block";
		const scene = new Scene();
		scene.fog = new FogExp2(mission === "desert" ? 1181720 : 459790, .028);
		scene.background = new Color(mission === "desert" ? 1313052 : 459790);
		const camera = new PerspectiveCamera(52, w0 / h0, .1, 140);
		camera.position.set(0, 2.05, 6.6);
		const sun = new DirectionalLight(12044543, 1.15);
		sun.position.set(-6, 12, 4);
		scene.add(sun);
		scene.add(new AmbientLight(3809877, .55));
		scene.add(new HemisphereLight(5588104, 3810328, .55));
		const guitarLight = new PointLight(LIM, 0, 8, 2);
		scene.add(guitarLight);
		const moon = new PointLight(8956671, 1.4, 60, 2);
		moon.position.set(8, 14, -10);
		scene.add(moon);
		const loader = new TextureLoader();
		const signTex = loader.load("/art/sign.webp");
		signTex.colorSpace = SRGBColorSpace;
		const faceIdle = loader.load("/art/boss-lock.webp");
		const facePanic = loader.load("/art/alien-scream.jpg");
		const faceScared = loader.load("/art/alien-scared.webp");
		const faceEat = loader.load("/art/alien-sour.webp");
		for (const t of [
			faceIdle,
			facePanic,
			faceScared,
			faceEat
		]) t.colorSpace = SRGBColorSpace;
		const world = new Group();
		scene.add(world);
		if (mission === "desert") {
			const ground = new Mesh(new PlaneGeometry(90, 160), new MeshStandardMaterial({
				color: 2759186,
				roughness: 1
			}));
			ground.rotation.x = -Math.PI / 2;
			ground.position.z = -40;
			world.add(ground);
			const road = new Mesh(new PlaneGeometry(6.4, 160), new MeshStandardMaterial({
				color: 1445908,
				roughness: .9
			}));
			road.rotation.x = -Math.PI / 2;
			road.position.y = .02;
			road.position.z = -40;
			world.add(road);
			const dashMat = new MeshBasicMaterial({ color: 15255626 });
			for (let i = 0; i < 40; i++) {
				const dash = new Mesh(new BoxGeometry(.12, .04, 1.4), dashMat);
				dash.position.set(0, .05, 8 - i * 3.4);
				world.add(dash);
			}
			const mesaMat = new MeshStandardMaterial({
				color: 4860472,
				roughness: .9
			});
			for (let i = 0; i < 8; i++) {
				const m = new Mesh(new BoxGeometry(4 + i % 3, 2 + i % 4, 3), mesaMat);
				m.position.set((i % 2 === 0 ? -1 : 1) * (10 + i % 4 * 2), 1.2, -18 - i * 8);
				world.add(m);
			}
			const cactusMat = new MeshStandardMaterial({
				color: 3103288,
				roughness: .7
			});
			for (let i = 0; i < 12; i++) {
				const c = new Mesh(new CylinderGeometry(.12, .16, 1.4, 6), cactusMat);
				c.position.set((i % 2 === 0 ? -3.8 : 3.9) - i % 3 * .3, .7, 4 - i * 5);
				world.add(c);
			}
			const sign = new Mesh(new PlaneGeometry(2.2, 2.8), new MeshBasicMaterial({
				map: signTex,
				transparent: true
			}));
			sign.position.set(-4.2, 1.6, -6);
			world.add(sign);
			scene.add(makeStars());
		} else {
			const hall = new Mesh(new BoxGeometry(22, 12, 50), new MeshStandardMaterial({
				color: 1181718,
				side: 1,
				metalness: .4,
				roughness: .55
			}));
			hall.position.z = -16;
			hall.position.y = 5;
			world.add(hall);
			const floor = new Mesh(new PlaneGeometry(22, 50), new MeshStandardMaterial({
				color: 1708068,
				metalness: .5,
				roughness: .4,
				emissive: 657428,
				emissiveIntensity: .4
			}));
			floor.rotation.x = -Math.PI / 2;
			floor.position.z = -16;
			world.add(floor);
			const ring = new Mesh(new TorusGeometry(5.5, .08, 8, 48), new MeshBasicMaterial({ color: LIM }));
			ring.rotation.x = Math.PI / 2;
			ring.position.set(0, .05, -12);
			world.add(ring);
		}
		const player = makeGuitarist();
		player.position.set(0, 0, 2.1);
		player.scale.set(1.55, 1.55, 1.55);
		scene.add(player);
		const truck = new Group();
		const cab = new Mesh(new BoxGeometry(1.8, 1.1, 2.2), new MeshStandardMaterial({
			color: 3810328,
			roughness: .7,
			metalness: .2
		}));
		cab.position.y = .9;
		const bed = new Mesh(new BoxGeometry(1.7, .45, 1.6), new MeshStandardMaterial({ color: 2758672 }));
		bed.position.set(0, .55, -1.6);
		truck.add(cab, bed);
		truck.position.set(4.6, 0, 3.4);
		truck.rotation.y = -.35;
		if (mission === "desert") scene.add(truck);
		const glowTex = glowTexture("#d6ff1a");
		const shotMat = new SpriteMaterial({
			map: glowTex,
			color: LIM,
			blending: 2,
			depthWrite: false,
			transparent: true
		});
		const shots = [];
		for (let i = 0; i < NOTE_POOL; i++) {
			const sprite = new Sprite(shotMat.clone());
			sprite.scale.set(.9, .9, .9);
			sprite.visible = false;
			scene.add(sprite);
			shots.push({
				sprite,
				vx: 0,
				vy: 0,
				vz: 0,
				alive: false,
				life: 0,
				target: -1
			});
		}
		const bits = [];
		const bitGeo = new SphereGeometry(.06, 6, 6);
		const bitMat = new MeshBasicMaterial({ color: LIM });
		for (let i = 0; i < BIT_POOL; i++) {
			const mesh = new Mesh(bitGeo, bitMat.clone());
			mesh.visible = false;
			scene.add(mesh);
			bits.push({
				mesh,
				vx: 0,
				vy: 0,
				vz: 0,
				life: 0
			});
		}
		const beam = new Mesh(new CylinderGeometry(.04, .18, 1, 8, 1, true), new MeshBasicMaterial({
			color: LIM,
			transparent: true,
			opacity: .55,
			blending: 2,
			side: 2,
			depthWrite: false
		}));
		beam.visible = false;
		scene.add(beam);
		const ufos = [];
		let nextId = 1;
		let nextBand = 0;
		const juice = createJuice();
		let fireCool = 0;
		let waveCool = .6;
		let finished = false;
		let lockDing = false;
		let floatT = 0;
		let winT = -1;
		const camTarget = new Vector3();
		const look = new Vector3();
		const tmp = new Vector3();
		const tmp2 = new Vector3();
		function popBits(x, y, z, color, n) {
			let spawned = 0;
			for (const b of bits) {
				if (b.life > 0) continue;
				b.mesh.visible = true;
				b.mesh.position.set(x, y, z);
				b.mesh.material.color.setHex(color);
				const a = Math.random() * Math.PI * 2;
				const p = 2 + Math.random() * 6;
				b.vx = Math.cos(a) * p;
				b.vy = 2 + Math.random() * 6;
				b.vz = Math.sin(a) * p;
				b.life = .45 + Math.random() * .4;
				spawned += 1;
				if (spawned >= n) break;
			}
		}
		function applyFace(u, tex) {
			const mat = u.root.userData.face.material;
			mat.map = tex;
			mat.color.setHex(16777215);
			mat.needsUpdate = true;
		}
		function spawnUfo(boss, x, y, z) {
			const root = makeSaucer(boss);
			root.position.set(x, y, z);
			scene.add(root);
			const u = {
				id: nextId++,
				root,
				hp: boss ? 42 : 3,
				max: boss ? 42 : 3,
				alive: true,
				boss,
				phase: Math.random() * Math.PI * 2,
				x,
				y,
				z
			};
			applyFace(u, boss ? faceIdle : faceScared);
			ufos.push(u);
			return u;
		}
		function spawnWave(n) {
			const count = mission === "mothership" ? 0 : 3 + Math.min(4, n);
			for (let i = 0; i < count; i++) spawnUfo(false, -3.4 + i % 5 * 1.7 + (Math.random() - .5) * .4, 3.4 + Math.random() * 1.8, -9 - Math.random() * 6 - n * .4);
			live.float = `WAVE ${n}`;
			floatT = .7;
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
		const bloom = new UnrealBloomPass(new Vector2(w0, h0), reduced ? 0 : .72, .55, .18);
		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));
		composer.addPass(bloom);
		composer.addPass(new OutputPass());
		const probe = {
			getYaw: () => -live.playerX,
			getSpeed: () => live.roadSpeed,
			getX: () => live.playerX,
			setKeys: (codes) => setInjectedKeys(codes),
			setSteer: (v) => setInjectedKeys(v > .2 ? ["KeyA"] : v < -.2 ? ["KeyD"] : [])
		};
		window.__controlsTest = probe;
		let raf = 0;
		let last = performance.now();
		let elapsed = 0;
		const duration = mission === "desert" ? 78 : 55;
		live.duration = duration;
		function fireNote(px, py, pz, color, targetId) {
			const s = shots.find((n) => !n.alive);
			if (!s) return;
			s.alive = true;
			s.life = 1.6;
			s.target = targetId;
			s.sprite.visible = true;
			s.sprite.position.set(px, py, pz);
			s.sprite.material.color.setHex(color);
			s.vx = (Math.random() - .5) * 1.4;
			s.vy = 2.2;
			s.vz = -16;
			live.shots += 1;
		}
		function killUfo(u, locked) {
			u.alive = false;
			u.root.visible = false;
			live.ufos += 1;
			sfxBoom();
			addTrauma(juice, locked ? .72 : .45);
			addHitstop(juice, locked ? .07 : .03);
			juice.flash = locked ? .5 : .28;
			popBits(u.x, u.y, u.z, locked ? LIM : CREAM, locked ? 28 : 16);
			burst(juice, 0, 0, "#d6ff1a", 12, 4);
			if (Math.random() < .45 || locked) {
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
		const loop = (now) => {
			raf = requestAnimationFrame(loop);
			const dt = Math.min((now - last) / 1e3, .1);
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
				player.position.x = Math.max(-3.6, Math.min(limit, player.position.x));
				live.playerX = player.position.x;
				live.roadSpeed = 14;
				player.rotation.y = axis * -.25;
				player.position.y = Math.sin(elapsed * 6) * .03;
				const strum = player.userData.strum;
				strum.rotation.x = fire ? Math.sin(elapsed * 28) * .35 : Math.sin(elapsed * 2) * .05;
				guitarLight.position.set(player.position.x + .45, 2.1, player.position.z + .3);
				guitarLight.intensity = fire ? 4.2 : .55;
				if (mission === "desert") {
					world.position.z += 10 * dt;
					if (world.position.z > 3.4) world.position.z = 0;
				}
				const living = ufos.filter((u) => u.alive);
				let best = null;
				let bestD = 99;
				for (const u of living) {
					u.phase += dt;
					if (u.boss) {
						u.x = Math.sin(elapsed * .55) * 2.8;
						u.y = 3.4 + Math.sin(elapsed * 1.3) * .35;
						u.z = -12.5;
					} else {
						u.x += Math.sin(elapsed * .8 + u.phase) * dt * .6;
						u.y += Math.sin(elapsed * 1.6 + u.phase) * dt * .4;
						u.z += dt * 1.6;
						if (u.z > 4) u.z = -22;
					}
					u.root.position.set(u.x, u.y, u.z);
					u.root.rotation.y = elapsed * .4;
					const dx = u.x - player.position.x;
					const d = Math.abs(dx) + Math.abs(u.z + 8) * .08;
					if (d < bestD) {
						bestD = d;
						best = u;
					}
				}
				if (best && Math.abs(best.x - player.position.x) < 1.8) live.lockPct = Math.min(100, live.lockPct + dt * (fire ? 55 : 22));
				else live.lockPct = Math.max(0, live.lockPct - dt * 28);
				live.locked = live.lockPct >= 100;
				if (live.locked && !lockDing) {
					sfxLock();
					live.float = "TARGET LOCK";
					floatT = .9;
					lockDing = true;
				}
				if (!live.locked) lockDing = false;
				if (mission === "mothership" && best?.boss) {
					if (live.bossHp <= 0) live.reaction = "collapse";
					else if (live.locked) live.reaction = "panic";
					else if (live.bandmates.includes("harmonica") && live.combo > 12) live.reaction = "dance";
					else if (anthem === "love" || anthem === "country") live.reaction = live.combo > 8 ? "eat" : "idle";
					else live.reaction = "idle";
					const tex = live.reaction === "panic" || live.reaction === "collapse" ? facePanic : live.reaction === "eat" ? faceEat : live.reaction === "dance" ? faceScared : faceIdle;
					applyFace(best, tex);
					live.bossHp = Math.max(0, best.hp / best.max * 100);
				}
				fireCool -= dt;
				if (fire && fireCool <= 0) {
					fireCool = live.bandmates.includes("drums") ? .09 : .14;
					const g = genreById(presets[Math.floor(elapsed * 2) % presets.length] ?? anthem);
					const extra = live.bandmates.length;
					sfxStrum();
					fireNote(player.position.x + .55, 2.05, player.position.z + .35, hexColor(g.color), best?.id ?? -1);
					if (extra > 0) fireNote(player.position.x - .2, 2.2, player.position.z + .35, LIM, best?.id ?? -1);
				}
				for (const s of shots) {
					if (!s.alive) continue;
					s.life -= dt;
					const tgt = ufos.find((u) => u.id === s.target && u.alive);
					if (tgt) {
						tmp.set(tgt.x, tgt.y, tgt.z).sub(s.sprite.position);
						const dist = Math.max(.001, tmp.length());
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
					for (const u of living) if (s.sprite.position.distanceTo(tmp2.set(u.x, u.y, u.z)) < (u.boss ? 2.4 : 1.85)) {
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
						floatT = .45;
						sfxHit("perfect");
						popBits(u.x, u.y, u.z, LIM, 6);
						addTrauma(juice, .12);
						if (u.hp <= 0) killUfo(u, live.locked);
						if (u.boss) live.bossHp = Math.max(0, u.hp / u.max * 100);
						break;
					}
					if (hit || s.life <= 0 || s.sprite.position.z < -40) {
						if (!hit && s.life <= 0 && living.length > 0) live.misses += 1;
						s.alive = false;
						s.sprite.visible = false;
					}
				}
				if (best && fire) {
					beam.visible = true;
					const from = tmp.set(player.position.x + .55, 2, player.position.z + .3);
					const to = tmp2.set(best.x, best.y, best.z);
					const dist = from.distanceTo(to);
					beam.position.copy(from).lerp(to, .5);
					beam.scale.set(1, dist, 1);
					beam.lookAt(to);
					beam.rotateX(Math.PI / 2);
					beam.material.opacity = live.locked ? .85 : .4;
				} else beam.visible = false;
				if (winT >= 0) {
					winT -= dt;
					if (winT <= 0) finish();
				} else if (mission === "desert") {
					if (ufos.filter((u) => u.alive).length === 0) {
						waveCool -= dt;
						if (waveCool <= 0) {
							if (live.wave >= WAVE_COUNT) {
								live.float = "THEY'RE PULLING YOU IN";
								floatT = 1.4;
								winT = 1.5;
							} else {
								live.wave += 1;
								spawnWave(live.wave);
								waveCool = .8;
							}
						}
					} else waveCool = .8;
				} else if (live.bossHp <= 0) {
					live.reaction = "collapse";
					live.float = "BOSS DOWN";
					floatT = 1.4;
					winT = 1.6;
				}
				if (elapsed >= duration && winT < 0) winT = .4;
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
			camTarget.set(player.position.x * .45, 2.05 + shake * Math.sin(now * .04), 6.6);
			camera.position.x += (camTarget.x - camera.position.x) * (1 - Math.exp(-6 * dt));
			camera.position.y += (camTarget.y - camera.position.y) * (1 - Math.exp(-6 * dt));
			look.set(player.position.x * .35, 1.7, -3.2);
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
				const mesh = obj;
				if (mesh.geometry) mesh.geometry.dispose();
				const mat = mesh.material;
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
	}, [
		mission,
		presets,
		anthem,
		reduced
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: wrapRef,
		className: "absolute inset-0 h-full w-full"
	});
}
function useHud() {
	const [hud, setHud] = (0, import_react.useState)(() => ({ ...live }));
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setHud({ ...live }), 70);
		return () => window.clearInterval(id);
	}, []);
	return hud;
}
var REACTION_COPY = {
	idle: "Watching you",
	dance: "Dancing itself hollow",
	eat: "Bingeing cheeseburgers",
	panic: "Can't take the riff",
	collapse: "Down on the deck"
};
function Play$1({ mission }) {
	const presets = useGame((s) => s.presets);
	const anthem = useGame((s) => s.anthem);
	const muted = useGame((s) => s.muted);
	const setMuted = useGame((s) => s.setMuted);
	const setScene = useGame((s) => s.setScene);
	const finishRun = useGame((s) => s.finishRun);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const [stick, setStick] = (0, import_react.useState)(0);
	const [upDown, setUpDown] = (0, import_react.useState)(false);
	const hud = useHud();
	const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const stickRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		resetLive(mission === "desert" ? 78 : 55);
		if (mission === "mothership") {
			live.wave = 1;
			live.waves = 1;
			live.bossHp = 100;
		}
		return attachInput();
	}, [mission]);
	(0, import_react.useEffect)(() => {
		setMutedAudio(muted);
	}, [muted]);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			if (pads.pauseJust) {
				pads.pauseJust = false;
				setPaused((p) => !p);
			}
			if (pads.muteJust) {
				pads.muteJust = false;
				setMuted(!useGame.getState().muted);
			}
		}, 32);
		return () => window.clearInterval(id);
	}, [setMuted]);
	function onComplete() {
		if (mission === "desert") {
			setScene("beamup");
			return;
		}
		const total = live.perfects + live.goods + live.misses;
		finishRun({
			score: live.score,
			combo: live.combo,
			perfects: live.perfects,
			goods: live.goods,
			misses: live.misses,
			ufos: live.ufos,
			bandmates: live.bandmates,
			bossDown: live.bossHp <= 0,
			accuracy: total === 0 ? 0 : Math.round((live.perfects + live.goods) / total * 100)
		});
	}
	function stickFromEvent(e) {
		const el = stickRef.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const nx = (e.clientX - (r.left + r.width / 2)) / (r.width * .42);
		const ax = Math.max(-1, Math.min(1, nx));
		setAxisX(ax);
		setStick(ax);
	}
	const portrait = mission === "mothership" ? hud.reaction === "panic" || hud.reaction === "collapse" ? "/art/alien-scream.jpg" : hud.reaction === "eat" ? "/art/alien-sour.webp" : hud.reaction === "dance" ? "/art/alien-scared.webp" : "/art/boss-lock.webp" : hud.locked ? "/art/alien-scream.jpg" : "/art/boss-lock.webp";
	const progress = Math.min(1, hud.songTime / Math.max(.01, hud.duration));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative flex h-full flex-col overflow-hidden bg-night",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(World, {
				mission,
				presets,
				anthem,
				reduced,
				paused,
				onComplete
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "film-grain" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hud-chip min-w-20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "k",
								children: mission === "desert" ? `Wave ${hud.wave}/${hud.waves}` : "Boss"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "v",
								children: mission === "desert" ? `${hud.ufos} down` : `${Math.ceil(hud.bossHp)}%`
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] font-semibold tracking-[0.28em] text-lime uppercase",
								children: ["Combo x", hud.combo]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "display text-[clamp(1.6rem,7vw,2.4rem)] text-cream",
								children: "County Road 9"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-auto flex flex-col items-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "btn-ghost h-10 min-h-10 px-3",
									"aria-label": muted ? "Unmute" : "Mute",
									onClick: () => setMuted(!muted),
									children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "btn-ghost h-10 min-h-10 px-3",
									"aria-label": paused ? "Resume" : "Pause",
									onClick: () => setPaused((p) => !p),
									children: paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hud-chip min-w-20 text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "Score"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "v",
									children: hud.score.toLocaleString()
								})]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `lock-pip ${hud.locked ? "is-locked" : ""}`,
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: portrait,
						alt: ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "lock-label",
						children: hud.locked ? "TARGET LOCK" : `LOCK ${Math.round(hud.lockPct)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						className: "lock-ring",
						viewBox: "0 0 100 100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "50",
							cy: "50",
							r: "46"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "50",
							cy: "50",
							r: "46",
							style: { strokeDashoffset: `${290 - 290 * hud.lockPct / 100}` }
						})]
					})
				]
			}),
			mission === "mothership" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute right-3 top-36 z-10 w-40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hud-chip",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "k",
							children: "ALN-007"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "v",
							children: REACTION_COPY[hud.reaction] ?? "Watching you"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 h-1.5 overflow-hidden rounded-full bg-oil",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-lime",
								style: { width: `${Math.max(0, hud.bossHp)}%` }
							})
						})
					]
				})
			}) : null,
			hud.float ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "float-pop",
				children: hud.float
			}) : null,
			hud.bandmates.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "pointer-events-none absolute bottom-36 left-4 z-10 text-xs tracking-[0.16em] text-cream/80 uppercase",
				children: ["Band ", hud.bandmates.join(" · ")]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-night via-night/70 to-transparent px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 h-1 overflow-hidden rounded-full bg-oil",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-lime",
						style: { width: `${progress * 100}%` }
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto flex items-end justify-between gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							ref: stickRef,
							type: "button",
							className: "stick-pad",
							"aria-label": "Steer left and right",
							onPointerDown: (e) => {
								e.preventDefault();
								e.currentTarget.setPointerCapture(e.pointerId);
								stickFromEvent(e);
							},
							onPointerMove: (e) => {
								if (e.buttons) stickFromEvent(e);
							},
							onPointerUp: () => {
								setAxisX(0);
								setStick(0);
							},
							onPointerCancel: () => {
								setAxisX(0);
								setStick(0);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "stick-knob",
								style: { transform: `translateX(${stick * 22}px)` }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "stick-label",
								children: "L / R"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 max-w-32 text-center text-[10px] leading-snug tracking-[0.14em] text-muted uppercase",
							children: "Steer. Hold UP. Lock the saucer."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `fire-pad ${upDown ? "is-down" : ""}`,
							"aria-label": "Shred",
							onPointerDown: (e) => {
								e.preventDefault();
								e.currentTarget.setPointerCapture(e.pointerId);
								setFire(true);
								setUpDown(true);
							},
							onPointerUp: () => {
								setFire(false);
								setUpDown(false);
							},
							onPointerCancel: () => {
								setFire(false);
								setUpDown(false);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "fire-arrow" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "UP" })]
						})
					]
				})]
			}),
			paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-20 flex flex-col items-center justify-center bg-night/80 px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "display text-5xl text-cream",
						children: "Paused"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "The road holds. The mothership does not mind waiting."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-primary mt-6",
						onClick: () => setPaused(false),
						children: "Resume"
					})
				]
			}) : null
		]
	});
}
function Results() {
	const lastRun = useGame((s) => s.lastRun);
	const highScore = useGame((s) => s.highScore);
	const setScene = useGame((s) => s.setScene);
	const resetRun = useGame((s) => s.resetRun);
	if (!lastRun) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "flex h-full items-center justify-center bg-night text-cream",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "btn-primary",
			onClick: () => setScene("title"),
			children: "Back"
		})
	});
	const title = lastRun.bossDown ? "Mothership down" : "Abducted with style";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative flex h-full flex-col overflow-hidden paint-wash",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: lastRun.bossDown ? "/art/alien-scared.webp" : "/art/boss-lock.webp",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover opacity-40"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-night/70" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "film-grain" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex h-full flex-col px-6 pt-10 pb-[max(24px,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.22em] text-lime uppercase",
						children: "County Road 9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display mt-2 text-5xl text-cream",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: lastRun.bossDown ? "They danced, they ate, they dropped. The beam lets you go." : "You filled the clock. The vessel still remembers the riff."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid grid-cols-2 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hud-chip",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "Score"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "v",
									children: lastRun.score.toLocaleString()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hud-chip",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "Best"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "v",
									children: highScore.toLocaleString()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hud-chip",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "Accuracy"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "v",
									children: [lastRun.accuracy, "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hud-chip",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "UFOs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "v",
									children: lastRun.ufos
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hud-chip",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "Locks"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "v",
									children: lastRun.perfects
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hud-chip",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "k",
									children: "Miss"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "v",
									children: lastRun.misses
								})]
							})
						]
					}),
					lastRun.bandmates.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-xs tracking-[0.16em] text-cream/80 uppercase",
						children: ["Bandmates ", lastRun.bandmates.join(" · ")]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex flex-col gap-2 pt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn-primary w-full",
							onClick: () => {
								unlockAudio();
								startMusic("radio", useGame.getState().anthem);
								setScene("drive");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Run it back"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn-ghost w-full",
							onClick: resetRun,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }), "Retune the radio"]
						})]
					})
				]
			})
		]
	});
}
function GameApp() {
	const scene = useGame((s) => s.scene);
	const muted = useGame((s) => s.muted);
	(0, import_react.useEffect)(() => {
		setMutedAudio(muted);
	}, [muted]);
	(0, import_react.useEffect)(() => {
		const onVis = () => {
			if (!document.hidden) resumeAudio();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			document.removeEventListener("visibilitychange", onVis);
			stopMusic();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		window.__cr9 = {
			scene: () => useGame.getState().scene,
			score: () => live.score,
			fire: () => setFire(true),
			go: (next) => useGame.getState().setScene(next),
			live
		};
		return () => {
			delete window.__cr9;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "game-shell",
		children: [
			scene === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {}) : null,
			scene === "dashboard" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) : null,
			scene === "drive" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drive, {}) : null,
			scene === "abduction" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Abduction, {}) : null,
			scene === "desert" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play$1, { mission: "desert" }) : null,
			scene === "beamup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeamUp, {}) : null,
			scene === "mothership" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play$1, { mission: "mothership" }) : null,
			scene === "results" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Results, {}) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { Home as component };
