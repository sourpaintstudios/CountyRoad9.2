import { Pause, Play as PlayIcon, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { World } from "../World";
import { attachInput, pads, setAxisX, setFire } from "../input";
import { live, resetLive, useGame } from "../store";
import { setMutedAudio } from "../audio";
import type { Mission } from "../types";

function useHud() {
  const [hud, setHud] = useState(() => ({ ...live }));
  useEffect(() => {
    const id = window.setInterval(() => setHud({ ...live }), 70);
    return () => window.clearInterval(id);
  }, []);
  return hud;
}

const REACTION_COPY: Record<string, string> = {
  idle: "Watching you",
  dance: "Dancing itself hollow",
  eat: "Bingeing cheeseburgers",
  panic: "Can't take the riff",
  collapse: "Down on the deck",
};

export function Play({ mission }: { mission: Mission }) {
  const presets = useGame((s) => s.presets);
  const anthem = useGame((s) => s.anthem);
  const muted = useGame((s) => s.muted);
  const setMuted = useGame((s) => s.setMuted);
  const setScene = useGame((s) => s.setScene);
  const finishRun = useGame((s) => s.finishRun);
  const [paused, setPaused] = useState(false);
  const [stick, setStick] = useState(0);
  const [upDown, setUpDown] = useState(false);
  const hud = useHud();
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stickRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    resetLive(mission === "desert" ? 78 : 55);
    if (mission === "mothership") {
      live.wave = 1;
      live.waves = 1;
      live.bossHp = 100;
    }
    return attachInput();
  }, [mission]);

  useEffect(() => {
    setMutedAudio(muted);
  }, [muted]);

  useEffect(() => {
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
      accuracy: total === 0 ? 0 : Math.round(((live.perfects + live.goods) / total) * 100),
    });
  }

  function stickFromEvent(e: React.PointerEvent<HTMLButtonElement>) {
    const el = stickRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width * 0.42);
    const ax = Math.max(-1, Math.min(1, nx));
    setAxisX(ax);
    setStick(ax);
  }

  const portrait =
    mission === "mothership"
      ? hud.reaction === "panic" || hud.reaction === "collapse"
        ? "/art/alien-scream.jpg"
        : hud.reaction === "eat"
          ? "/art/alien-sour.webp"
          : hud.reaction === "dance"
            ? "/art/alien-scared.webp"
            : "/art/boss-lock.webp"
      : hud.locked
        ? "/art/alien-scream.jpg"
        : "/art/boss-lock.webp";

  const progress = Math.min(1, hud.songTime / Math.max(0.01, hud.duration));

  return (
    <section className="relative flex h-full flex-col overflow-hidden bg-night">
      <World
        mission={mission}
        presets={presets}
        anthem={anthem}
        reduced={reduced}
        paused={paused}
        onComplete={onComplete}
      />
      <div className="film-grain" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="hud-chip min-w-20">
            <span className="k">{mission === "desert" ? `Wave ${hud.wave}/${hud.waves}` : "Boss"}</span>
            <span className="v">{mission === "desert" ? `${hud.ufos} down` : `${Math.ceil(hud.bossHp)}%`}</span>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-lime uppercase">Combo x{hud.combo}</p>
            <h1 className="display text-[clamp(1.6rem,7vw,2.4rem)] text-cream">County Road 9</h1>
          </div>
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <div className="flex gap-1.5">
              <button
                type="button"
                className="btn-ghost h-10 min-h-10 px-3"
                aria-label={muted ? "Unmute" : "Mute"}
                onClick={() => setMuted(!muted)}
              >
                {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>
              <button
                type="button"
                className="btn-ghost h-10 min-h-10 px-3"
                aria-label={paused ? "Resume" : "Pause"}
                onClick={() => setPaused((p) => !p)}
              >
                {paused ? <PlayIcon className="size-4" /> : <Pause className="size-4" />}
              </button>
            </div>
            <div className="hud-chip min-w-20 text-right">
              <span className="k">Score</span>
              <span className="v">{hud.score.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`lock-pip ${hud.locked ? "is-locked" : ""}`} aria-hidden>
        <img src={portrait} alt="" />
        <span className="lock-label">{hud.locked ? "TARGET LOCK" : `LOCK ${Math.round(hud.lockPct)}%`}</span>
        <svg className="lock-ring" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" />
          <circle
            cx="50"
            cy="50"
            r="46"
            style={{ strokeDashoffset: `${290 - (290 * hud.lockPct) / 100}` }}
          />
        </svg>
      </div>

      {mission === "mothership" ? (
        <div className="pointer-events-none absolute right-3 top-36 z-10 w-40">
          <div className="hud-chip">
            <span className="k">ALN-007</span>
            <span className="v">{REACTION_COPY[hud.reaction] ?? "Watching you"}</span>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-oil">
              <div className="h-full bg-lime" style={{ width: `${Math.max(0, hud.bossHp)}%` }} />
            </div>
          </div>
        </div>
      ) : null}

      {hud.float ? <p className="float-pop">{hud.float}</p> : null}

      {hud.bandmates.length > 0 ? (
        <p className="pointer-events-none absolute bottom-36 left-4 z-10 text-xs tracking-[0.16em] text-cream/80 uppercase">
          Band {hud.bandmates.join(" · ")}
        </p>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-night via-night/70 to-transparent px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-10">
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-oil">
          <div className="h-full bg-lime" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="pointer-events-auto flex items-end justify-between gap-4">
          <button
            ref={stickRef}
            type="button"
            className="stick-pad"
            aria-label="Steer left and right"
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              stickFromEvent(e);
            }}
            onPointerMove={(e) => {
              if (e.buttons) stickFromEvent(e);
            }}
            onPointerUp={() => {
              setAxisX(0);
              setStick(0);
            }}
            onPointerCancel={() => {
              setAxisX(0);
              setStick(0);
            }}
          >
            <span className="stick-knob" style={{ transform: `translateX(${stick * 22}px)` }} />
            <span className="stick-label">L / R</span>
          </button>
          <p className="mb-3 max-w-32 text-center text-[10px] leading-snug tracking-[0.14em] text-muted uppercase">
            Steer. Hold UP. Lock the saucer.
          </p>
          <button
            type="button"
            className={`fire-pad ${upDown ? "is-down" : ""}`}
            aria-label="Shred"
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setFire(true);
              setUpDown(true);
            }}
            onPointerUp={() => {
              setFire(false);
              setUpDown(false);
            }}
            onPointerCancel={() => {
              setFire(false);
              setUpDown(false);
            }}
          >
            <span className="fire-arrow" />
            <span>UP</span>
          </button>
        </div>
      </div>

      {paused ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-night/80 px-6 text-center">
          <h2 className="display text-5xl text-cream">Paused</h2>
          <p className="mt-2 text-sm text-muted">The road holds. The mothership does not mind waiting.</p>
          <button type="button" className="btn-primary mt-6" onClick={() => setPaused(false)}>
            Resume
          </button>
        </div>
      ) : null}
    </section>
  );
}
