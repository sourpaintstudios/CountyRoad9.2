import { create } from "zustand";
import {
  DEFAULT_ANTHEM,
  DEFAULT_PRESETS,
  type BandmateId,
  type GenreId,
  type RunResult,
  type Scene,
} from "./types";

const SAVE_KEY = "cr9-save-v2";
const SAVE_VERSION = 2;

type SaveBlob = {
  version: number;
  highScore: number;
  muted: boolean;
  presets: GenreId[];
  anthem: GenreId;
};

function loadSave(): SaveBlob {
  const fallback: SaveBlob = {
    version: SAVE_VERSION,
    highScore: 0,
    muted: false,
    presets: [...DEFAULT_PRESETS],
    anthem: DEFAULT_ANTHEM,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem("cr9-save-v1");
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<SaveBlob>;
    return {
      ...fallback,
      ...parsed,
      version: SAVE_VERSION,
      presets:
        Array.isArray(parsed.presets) && parsed.presets.length === 5
          ? (parsed.presets as GenreId[])
          : fallback.presets,
    };
  } catch {
    return fallback;
  }
}

function writeSave(partial: Partial<SaveBlob>) {
  try {
    const cur = loadSave();
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...cur, ...partial, version: SAVE_VERSION }));
  } catch {
    /* private mode / quota */
  }
}

const initial = loadSave();

type GameStore = {
  scene: Scene;
  presets: GenreId[];
  anthem: GenreId;
  muted: boolean;
  highScore: number;
  lastRun: RunResult | null;
  setScene: (scene: Scene) => void;
  togglePreset: (id: GenreId) => void;
  setAnthem: (id: GenreId) => void;
  setMuted: (muted: boolean) => void;
  finishRun: (run: RunResult) => void;
  resetRun: () => void;
};

export const useGame = create<GameStore>((set, get) => ({
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
    let next: GenreId[];
    if (has) {
      if (presets.length <= 1) return;
      next = presets.filter((g) => g !== id);
    } else {
      if (presets.length >= 5) return;
      next = [...presets, id];
    }
    const nextAnthem = next.includes(anthem) ? anthem : next[0];
    writeSave({ presets: next, anthem: nextAnthem });
    set({ presets: next, anthem: nextAnthem });
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
    set({ lastRun: run, highScore, scene: "results" });
  },
  resetRun: () => set({ lastRun: null, scene: "dashboard" }),
}));

export type LiveHud = {
  score: number;
  combo: number;
  multiplier: number;
  perfects: number;
  goods: number;
  misses: number;
  songTime: number;
  duration: number;
  ufos: number;
  bossHp: number;
  reaction: "idle" | "dance" | "eat" | "panic" | "collapse";
  bandmates: BandmateId[];
  float: string;
  wave: number;
  waves: number;
  lockPct: number;
  locked: boolean;
  playerX: number;
  firing: boolean;
  roadSpeed: number;
  shots: number;
};

export const live: LiveHud = {
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
  shots: 0,
};

export function resetLive(duration: number) {
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
