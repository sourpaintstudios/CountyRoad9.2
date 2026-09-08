import { useEffect } from "react";
import { sfxWhoosh, unlockAudio } from "../audio";
import { useGame } from "../store";

export function Drive() {
  const setScene = useGame((s) => s.setScene);
  const presets = useGame((s) => s.presets);
  const anthem = useGame((s) => s.anthem);

  useEffect(() => {
    unlockAudio();
    const t = window.setTimeout(() => setScene("abduction"), 5200);
    return () => window.clearTimeout(t);
  }, [setScene]);

  return (
    <section className="relative flex h-full flex-col overflow-hidden">
      <img src="/art/dashboard.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-night/40" />
      <div className="paint-drip" />
      <div className="film-grain" />
      <div className="relative z-10 flex h-full flex-col px-6 pt-10 pb-[max(24px,env(safe-area-inset-bottom))]">
        <p className="text-xs font-medium tracking-[0.22em] text-lime uppercase">Night drive</p>
        <h1 className="display mt-2 text-5xl text-cream">County Road 9</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/85">
          AM hiss. White lines. The wash is empty until it is not.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {presets.map((id) => (
            <span
              key={id}
              className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
                id === anthem ? "bg-lime text-night" : "bg-oil text-cream"
              }`}
            >
              {id}
            </span>
          ))}
        </div>
        <button type="button" className="btn-ghost mt-auto self-start" onClick={() => setScene("abduction")}>
          Keep rolling
        </button>
      </div>
    </section>
  );
}

export function Abduction() {
  const setScene = useGame((s) => s.setScene);

  useEffect(() => {
    sfxWhoosh();
    const t = window.setTimeout(() => setScene("desert"), 4800);
    return () => window.clearTimeout(t);
  }, [setScene]);

  return (
    <section className="relative flex h-full flex-col overflow-hidden bg-night flash-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/lock-on.mp4"
        autoPlay
        muted
        playsInline
        poster="/art/chase.webp"
      />
      <div className="absolute inset-0 bg-linear-to-t from-night via-night/30 to-transparent" />
      <div className="paint-drip" />
      <div className="film-grain" />
      <div className="relative z-10 flex h-full flex-col px-6 pt-12 pb-[max(24px,env(safe-area-inset-bottom))]">
        <p className="text-xs font-medium tracking-[0.22em] text-lime uppercase">The abduction</p>
        <h1 className="display mt-2 text-5xl text-cream">Shield your eyes</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/85">
          Hard light over the cholla. Martin out of the cab. The first saucers are already dropping.
        </p>
        <button type="button" className="btn-primary mt-auto" onClick={() => setScene("desert")}>
          Step into the road
        </button>
      </div>
    </section>
  );
}

export function BeamUp() {
  const setScene = useGame((s) => s.setScene);

  useEffect(() => {
    sfxWhoosh();
    const t = window.setTimeout(() => setScene("mothership"), 5200);
    return () => window.clearTimeout(t);
  }, [setScene]);

  return (
    <section className="relative flex h-full flex-col overflow-hidden bg-night">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/mothership.mp4"
        autoPlay
        muted
        playsInline
        poster="/art/chase.webp"
      />
      <div className="absolute inset-0 bg-linear-to-t from-night via-transparent to-night/40" />
      <div className="paint-drip" />
      <div className="film-grain" />
      <div className="relative z-10 flex h-full flex-col px-6 pt-12 pb-[max(24px,env(safe-area-inset-bottom))]">
        <p className="text-xs font-medium tracking-[0.22em] text-lime uppercase">Inside the vessel</p>
        <h1 className="display mt-2 text-5xl text-cream">One boss. One riff.</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/85">
          No trash mobs. Lock ALN-007 and play until it dances, eats, or drops.
        </p>
        <button type="button" className="btn-primary mt-auto" onClick={() => setScene("mothership")}>
          Take the mothership
        </button>
      </div>
    </section>
  );
}
