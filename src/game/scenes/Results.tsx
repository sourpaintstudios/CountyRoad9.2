import { Radio, RotateCcw } from "lucide-react";
import { startMusic, unlockAudio } from "../audio";
import { useGame } from "../store";

export function Results() {
  const lastRun = useGame((s) => s.lastRun);
  const highScore = useGame((s) => s.highScore);
  const setScene = useGame((s) => s.setScene);
  const resetRun = useGame((s) => s.resetRun);

  if (!lastRun) {
    return (
      <section className="flex h-full items-center justify-center bg-night text-cream">
        <button type="button" className="btn-primary" onClick={() => setScene("title")}>
          Back
        </button>
      </section>
    );
  }

  const title = lastRun.bossDown ? "Mothership down" : "Abducted with style";

  return (
    <section className="relative flex h-full flex-col overflow-hidden paint-wash">
      <img
        src={lastRun.bossDown ? "/art/alien-scared.webp" : "/art/boss-lock.webp"}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-night/70" />
      <div className="film-grain" />
      <div className="relative z-10 flex h-full flex-col px-6 pt-10 pb-[max(24px,env(safe-area-inset-bottom))]">
        <p className="text-xs font-medium tracking-[0.22em] text-lime uppercase">County Road 9</p>
        <h1 className="display mt-2 text-5xl text-cream">{title}</h1>
        <p className="mt-2 text-sm text-muted">
          {lastRun.bossDown
            ? "They danced, they ate, they dropped. The beam lets you go."
            : "You filled the clock. The vessel still remembers the riff."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <div className="hud-chip">
            <span className="k">Score</span>
            <span className="v">{lastRun.score.toLocaleString()}</span>
          </div>
          <div className="hud-chip">
            <span className="k">Best</span>
            <span className="v">{highScore.toLocaleString()}</span>
          </div>
          <div className="hud-chip">
            <span className="k">Accuracy</span>
            <span className="v">{lastRun.accuracy}%</span>
          </div>
          <div className="hud-chip">
            <span className="k">UFOs</span>
            <span className="v">{lastRun.ufos}</span>
          </div>
          <div className="hud-chip">
            <span className="k">Locks</span>
            <span className="v">{lastRun.perfects}</span>
          </div>
          <div className="hud-chip">
            <span className="k">Miss</span>
            <span className="v">{lastRun.misses}</span>
          </div>
        </div>

        {lastRun.bandmates.length > 0 ? (
          <p className="mt-4 text-xs tracking-[0.16em] text-cream/80 uppercase">
            Bandmates {lastRun.bandmates.join(" · ")}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-6">
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => {
              unlockAudio();
              startMusic("radio", useGame.getState().anthem);
              setScene("drive");
            }}
          >
            <RotateCcw className="size-4" />
            Run it back
          </button>
          <button type="button" className="btn-ghost w-full" onClick={resetRun}>
            <Radio className="size-4" />
            Retune the radio
          </button>
        </div>
      </div>
    </section>
  );
}
