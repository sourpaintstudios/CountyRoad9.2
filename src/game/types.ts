export const GENRES = [
  { id: "rock", name: "Rock & Roll", short: "ROCK", bpm: 132, color: "#FF6A3D" },
  { id: "classical", name: "Classical", short: "CLASS", bpm: 108, color: "#F3E6C8" },
  { id: "love", name: "Love Songs", short: "LOVE", bpm: 96, color: "#E8A0B8" },
  { id: "country", name: "Country", short: "CTRY", bpm: 118, color: "#D6FF1A" },
  { id: "blues", name: "Blues", short: "BLUES", bpm: 92, color: "#6AA7C4" },
  { id: "rap", name: "Rap", short: "RAP", bpm: 96, color: "#C4A574" },
  { id: "metal", name: "Heavy Metal", short: "METAL", bpm: 148, color: "#C9C4D6" },
] as const;

export type GenreId = (typeof GENRES)[number]["id"];

export type Scene =
  | "title"
  | "dashboard"
  | "drive"
  | "abduction"
  | "desert"
  | "beamup"
  | "mothership"
  | "results";

export type Mission = "desert" | "mothership";

export type BossReaction = "idle" | "dance" | "eat" | "panic" | "collapse";

export type BandmateId = "harmonica" | "bass" | "drums";

export type RunResult = {
  score: number;
  combo: number;
  perfects: number;
  goods: number;
  misses: number;
  ufos: number;
  bandmates: BandmateId[];
  bossDown: boolean;
  accuracy: number;
};

export function genreById(id: GenreId) {
  return GENRES.find((g) => g.id === id)!;
}

export const DEFAULT_PRESETS: GenreId[] = ["country", "rock", "blues", "metal", "love"];
export const DEFAULT_ANTHEM: GenreId = "country";
