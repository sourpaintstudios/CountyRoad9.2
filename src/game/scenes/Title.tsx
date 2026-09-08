import { Radio, Volume2, VolumeX } from "lucide-react";
import { sfxRadioOn, startMusic, unlockAudio } from "../audio";
import { useGame } from "../store";

export function Title() {
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

  return (
    <section className="relative flex h-full flex-col overflow-hidden bg-night">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/shred.mp4"
        autoPlay
        muted
        loop
        playsInline
        poster="/art/hero-desert.webp"
      />
      <div className="absolute inset-0 bg-linear-to-b from-night/35 via-night/50 to-night" />
      <div className="paint-drip" />
      <div className="film-grain" />

      <header className="relative z-10 flex items-center justify-between px-5 pt-5">
        <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">Sour Paint Studios</p>
        <button
          type="button"
          className="btn-ghost h-10 min-h-10 px-3"
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={(e) => {
            e.stopPropagation();
            unlockAudio();
            setMuted(!muted);
          }}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-end px-6 pb-4 text-center stagger-in">
        <img
          src="/art/logo.webp"
          alt="Sour Paint Studios"
          className="mb-3 h-16 w-28 rounded-md border border-cream/20 object-cover"
        />
        <p className="mb-2 text-xs font-medium tracking-[0.28em] text-lime uppercase">Arcade guitar shooter</p>
        <h1 className="display text-[clamp(3.2rem,14vw,5.4rem)] text-cream">County Road 9</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/80">
          Tune the truck. Shred the saucers. Make the aliens dance.
        </p>
        {highScore > 0 ? (
          <p className="mt-3 text-xs tracking-[0.18em] text-cream/80 uppercase">Best {highScore.toLocaleString()}</p>
        ) : null}
      </div>

      <div className="relative z-10 px-6 pb-[max(28px,env(safe-area-inset-bottom))]">
        <button type="button" className="btn-primary w-full" onClick={start}>
          <Radio className="size-4" />
          Climb in the truck
        </button>
        <p className="mt-3 text-center text-xs text-muted">Steer L/R. Hold UP to shred. Lock the saucer.</p>
      </div>
    </section>
  );
}
