import { unlockAudio } from "./audio";

type Codes = Set<string>;

const MOVE_LEFT = new Set(["KeyA", "ArrowLeft"]);
const MOVE_RIGHT = new Set(["KeyD", "ArrowRight"]);
const FIRE = new Set(["KeyW", "ArrowUp", "Space"]);

export const pads = {
  left: false,
  right: false,
  up: false,
  axisX: 0,
  pauseJust: false,
  muteJust: false,
};

let injected: Codes | null = null;
let attached = false;

export function setInjectedKeys(codes: string[]) {
  injected = new Set(codes);
}

export function setAxisX(v: number) {
  pads.axisX = Math.max(-1, Math.min(1, v));
}

export function setFire(on: boolean) {
  if (on) unlockAudio();
  pads.up = on;
}

export function moveAxis(): number {
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

export function isFiring(): boolean {
  if (injected) return [...FIRE].some((c) => injected!.has(c));
  return pads.up;
}

function onKeyDown(e: KeyboardEvent) {
  if (!MOVE_LEFT.has(e.code) && !MOVE_RIGHT.has(e.code) && !FIRE.has(e.code) && e.code !== "Escape" && e.code !== "KeyP" && e.code !== "KeyM") {
    return;
  }
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

function onKeyUp(e: KeyboardEvent) {
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

export function attachInput() {
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
