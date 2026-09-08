import { genreById, type GenreId } from "./types";

type AudioKit = {
  ctx: AudioContext;
  master: GainNode;
  music: GainNode;
  sfx: GainNode;
};

let kit: AudioKit | null = null;
let muted = false;
let musicTimer = 0;
let step = 0;
let nextNote = 0;
let playing = false;
let bpm = 118;
let anthem: GenreId = "country";
let mission: "desert" | "mothership" | "radio" | "idle" = "idle";
let noiseBuf: AudioBuffer | null = null;

function ensure(): AudioKit {
  if (kit) return kit;
  const ctx = new AudioContext({ latencyHint: "interactive" });
  const master = ctx.createGain();
  const music = ctx.createGain();
  const sfx = ctx.createGain();
  music.gain.value = 0.22;
  sfx.gain.value = 0.55;
  master.gain.value = muted ? 0 : 1;
  music.connect(master);
  sfx.connect(master);
  master.connect(ctx.destination);
  const n = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  noiseBuf = n;
  kit = { ctx, master, music, sfx };
  return kit;
}

export function unlockAudio() {
  const { ctx } = ensure();
  if (ctx.state === "suspended") void ctx.resume();
}

export function setMutedAudio(next: boolean) {
  muted = next;
  if (!kit) return;
  kit.master.gain.setTargetAtTime(next ? 0 : 1, kit.ctx.currentTime, 0.02);
}

export function resumeAudio() {
  if (!kit) return;
  if (kit.ctx.state === "suspended") void kit.ctx.resume();
}

function envGain(ctx: AudioContext, when: number, peak: number, dur: number) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(peak, when + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  return g;
}

function tone(
  bus: GainNode,
  when: number,
  freq: number,
  dur: number,
  type: OscillatorType,
  peak: number,
) {
  if (!kit) return;
  const { ctx } = kit;
  const o = ctx.createOscillator();
  const g = envGain(ctx, when, peak, dur);
  o.type = type;
  o.frequency.setValueAtTime(freq, when);
  o.connect(g).connect(bus);
  o.start(when);
  o.stop(when + dur + 0.03);
}

function hat(when: number, open: boolean) {
  if (!kit || !noiseBuf) return;
  const { ctx, music } = kit;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = open ? 6000 : 9000;
  const g = envGain(ctx, when, open ? 0.08 : 0.05, open ? 0.12 : 0.04);
  src.connect(f).connect(g).connect(music);
  src.start(when);
  src.stop(when + 0.14);
}

function kick(when: number) {
  if (!kit) return;
  const { ctx, music } = kit;
  const o = ctx.createOscillator();
  const g = envGain(ctx, when, 0.55, 0.16);
  o.type = "sine";
  o.frequency.setValueAtTime(140, when);
  o.frequency.exponentialRampToValueAtTime(42, when + 0.12);
  o.connect(g).connect(music);
  o.start(when);
  o.stop(when + 0.18);
}

const SCALES: Record<GenreId, number[]> = {
  rock: [0, 0, 7, 12, 7, 5, 7, 12],
  classical: [0, 4, 7, 12, 16, 12, 7, 4],
  love: [0, 3, 7, 10, 7, 3, 0, 7],
  country: [0, 2, 4, 7, 9, 7, 4, 2],
  blues: [0, 3, 5, 6, 7, 10, 7, 3],
  rap: [0, 0, 7, 0, 5, 0, 7, 10],
  metal: [0, 0, 1, 0, 7, 0, 6, 12],
};

function midi(base: number, semitone: number) {
  return base * Math.pow(2, semitone / 12);
}

function scheduleStep(when: number) {
  if (!kit) return;
  const { music } = kit;
  const scale = SCALES[anthem];
  const degree = scale[step % scale.length];
  const bar = Math.floor(step / 16);
  const inBar = step % 16;
  const intense = mission === "mothership";

  if (inBar % 4 === 0) kick(when);
  if (anthem === "rap" && (inBar === 4 || inBar === 12)) kick(when + 0.001);
  if (inBar % 2 === 1) hat(when, inBar % 8 === 7);
  if (intense && inBar % 4 === 2) hat(when, false);

  const root = anthem === "classical" ? 196 : anthem === "metal" ? 110 : 146.8;
  if (inBar % 2 === 0) {
    tone(music, when, midi(root / 2, degree), 0.18, "triangle", 0.12);
  }
  const leadEvery = anthem === "love" || anthem === "blues" ? 2 : 1;
  if (inBar % leadEvery === 0) {
    const oct = intense && bar % 2 === 1 ? 12 : 0;
    const wave: OscillatorType =
      anthem === "classical" ? "sine" : anthem === "metal" ? "sawtooth" : "square";
    tone(music, when, midi(root, degree + oct), 0.14, wave, intense ? 0.11 : 0.08);
  }
  step++;
}

function tickMusic() {
  if (!playing || !kit) return;
  const { ctx } = kit;
  const horizon = ctx.currentTime + 0.12;
  const stepDur = 60 / bpm / 4;
  while (nextNote < horizon) {
    scheduleStep(nextNote);
    nextNote += stepDur;
  }
}

export function startMusic(kind: "desert" | "mothership" | "radio", nextAnthem: GenreId) {
  unlockAudio();
  const { ctx } = ensure();
  anthem = nextAnthem;
  mission = kind;
  const g = genreById(nextAnthem);
  bpm = kind === "mothership" ? Math.round(g.bpm * 1.08) : kind === "desert" ? Math.round(g.bpm * 0.92) : 104;
  step = 0;
  nextNote = ctx.currentTime + 0.05;
  playing = true;
  if (musicTimer) window.clearInterval(musicTimer);
  tickMusic();
  musicTimer = window.setInterval(tickMusic, 25);
}

export function stopMusic() {
  playing = false;
  mission = "idle";
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = 0;
  }
}

export function sfxHit(quality: "perfect" | "good" | "miss") {
  unlockAudio();
  const { ctx, sfx } = ensure();
  const when = ctx.currentTime;
  if (quality === "miss") {
    tone(sfx, when, 90, 0.16, "sawtooth", 0.12);
    return;
  }
  const f = quality === "perfect" ? 880 : 660;
  tone(sfx, when, f, 0.07, "square", 0.16);
  tone(sfx, when, f * 1.5, 0.05, "triangle", 0.08);
}

export function sfxBoom() {
  unlockAudio();
  const { ctx, sfx } = ensure();
  const when = ctx.currentTime;
  tone(sfx, when, 70, 0.28, "sine", 0.4);
  tone(sfx, when, 180, 0.12, "sawtooth", 0.12);
}

export function sfxPower() {
  unlockAudio();
  const { ctx, sfx } = ensure();
  const when = ctx.currentTime;
  tone(sfx, when, 523, 0.1, "square", 0.14);
  tone(sfx, when + 0.07, 784, 0.12, "square", 0.12);
}

export function sfxClick() {
  unlockAudio();
  const { ctx, sfx } = ensure();
  tone(sfx, ctx.currentTime, 420, 0.04, "square", 0.1);
}

export function sfxWhoosh() {
  unlockAudio();
  const { ctx, sfx } = ensure();
  const when = ctx.currentTime;
  tone(sfx, when, 220, 0.4, "sine", 0.18);
  tone(sfx, when, 60, 0.5, "triangle", 0.22);
}

export function sfxRadioOn() {
  unlockAudio();
  const { ctx, sfx } = ensure();
  const when = ctx.currentTime;
  tone(sfx, when, 180, 0.08, "square", 0.08);
  tone(sfx, when + 0.06, 240, 0.08, "square", 0.08);
}

export function sfxStrum() {
  unlockAudio();
  const { ctx, sfx } = ensure();
  const when = ctx.currentTime;
  tone(sfx, when, 196, 0.11, "sawtooth", 0.07);
  tone(sfx, when, 247, 0.09, "square", 0.05);
  tone(sfx, when, 294, 0.13, "triangle", 0.06);
}

export function sfxLock() {
  unlockAudio();
  const { ctx, sfx } = ensure();
  const when = ctx.currentTime;
  tone(sfx, when, 740, 0.08, "sine", 0.1);
  tone(sfx, when + 0.05, 980, 0.1, "sine", 0.08);
}
