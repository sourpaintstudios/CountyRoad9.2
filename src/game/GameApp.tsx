import { useEffect } from "react";
import { resumeAudio, setMutedAudio, stopMusic } from "./audio";
import { setFire } from "./input";
import { live, useGame } from "./store";
import { Title } from "./scenes/Title";
import { Dashboard } from "./scenes/Dashboard";
import { Abduction, BeamUp, Drive } from "./scenes/Cinematics";
import { Play } from "./scenes/Play";
import { Results } from "./scenes/Results";

export function GameApp() {
  const scene = useGame((s) => s.scene);
  const muted = useGame((s) => s.muted);

  useEffect(() => {
    setMutedAudio(muted);
  }, [muted]);

  useEffect(() => {
    const onVis = () => {
      if (!document.hidden) resumeAudio();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stopMusic();
    };
  }, []);

  useEffect(() => {
    window.__cr9 = {
      scene: () => useGame.getState().scene,
      score: () => live.score,
      fire: () => setFire(true),
      go: (next: string) => useGame.getState().setScene(next as never),
      live,
    };
    return () => {
      delete window.__cr9;
    };
  }, []);

  return (
    <div className="game-shell">
      {scene === "title" ? <Title /> : null}
      {scene === "dashboard" ? <Dashboard /> : null}
      {scene === "drive" ? <Drive /> : null}
      {scene === "abduction" ? <Abduction /> : null}
      {scene === "desert" ? <Play mission="desert" /> : null}
      {scene === "beamup" ? <BeamUp /> : null}
      {scene === "mothership" ? <Play mission="mothership" /> : null}
      {scene === "results" ? <Results /> : null}
    </div>
  );
}

declare global {
  interface Window {
    __cr9?: {
      scene: () => string;
      score: () => number;
      fire: () => void;
      go: (scene: string) => void;
      live: typeof live;
    };
  }
}
