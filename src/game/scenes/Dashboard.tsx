import { Disc3, Radio } from "lucide-react";
import { sfxClick, startMusic, unlockAudio } from "../audio";
import { useGame } from "../store";
import { GENRES, type GenreId } from "../types";

export function Dashboard() {
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

  function tapGenre(id: GenreId) {
    sfxClick();
    togglePreset(id);
  }

  return (
    <section className="relative flex h-full flex-col overflow-hidden">
      <img
        src="/art/dashboard.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-night/38" />
      <div className="paint-drip" />
      <div className="film-grain" />

      <div className="relative z-10 flex h-full flex-col px-5 pt-6 pb-[max(20px,env(safe-area-inset-bottom))]">
        <p className="text-xs font-medium tracking-[0.22em] text-lime uppercase">Dashboard setup</p>
        <h1 className="display mt-1 text-4xl text-cream">Dash radio</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Five mechanical presets. Slide an 8-track for the anthem. Then we roll County Road 9.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GENRES.map((g) => {
            const on = presets.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                className={`radio-key ${on ? "is-on" : ""}`}
                onClick={() => tapGenre(g.id)}
                aria-pressed={on}
              >
                {g.short}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">{presets.length} / 5 presets locked</p>

        <div className="tape-slot mt-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-muted uppercase">
            <Disc3 className="size-3.5" />
            8-track anthem
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((id) => {
              const g = GENRES.find((x) => x.id === id)!;
              const on = anthem === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`radio-key min-w-20 px-3 ${on ? "is-on" : ""}`}
                  onClick={() => {
                    sfxClick();
                    setAnthem(id);
                  }}
                >
                  {g.short}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-6">
          <button type="button" className="btn-primary w-full" disabled={!ready} onClick={cruise}>
            <Radio className="size-4" />
            Hit the road
          </button>
        </div>
      </div>
    </section>
  );
}
