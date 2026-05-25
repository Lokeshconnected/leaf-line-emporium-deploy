import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Droplets, Home, Loader2, PawPrint, Sparkles, Sprout, SunMedium, Trees, Wind } from "lucide-react";
import { Link } from "wouter";
import { getApiBase } from "@/lib/api";

interface Plant {
  id: number;
  name: string;
  scientificName: string;
  price: number;
  category: string;
  difficulty: string;
  lightRequirement: string;
  wateringFrequency: string;
  petSafe: boolean;
  airPurificationRating: number;
  indoor: boolean;
  recommendedPlacement: string;
  description: string;
  growthSpeed: string;
  humidityRequirement: string;
  emoji: string;
  gradient: string;
  popularity: number;
}

type EnvironmentMode = "all" | "indoor" | "outdoor";
type DifficultyMode = "all" | "Easy" | "Moderate" | "Expert";
type WaterMode = "all" | "low" | "medium" | "high";
type GrowthMode = "all" | "slow" | "moderate" | "fast";
type SizeMode = "all" | "compact" | "balanced" | "statement";
type LightMode = "all" | "low" | "medium" | "bright";

const ENVIRONMENT_OPTIONS: Array<{ id: EnvironmentMode; label: string; hint: string; icon: typeof Home }> = [
  { id: "all", label: "All Spaces", hint: "Show the full collection", icon: Home },
  { id: "indoor", label: "Indoor", hint: "Bedroom, living room, desk", icon: Home },
  { id: "outdoor", label: "Outdoor", hint: "Balcony, patio, open air", icon: Trees },
];

const DIFFICULTY_OPTIONS: DifficultyMode[] = ["all", "Easy", "Moderate", "Expert"];
const WATER_OPTIONS: Array<{ id: WaterMode; label: string }> = [
  { id: "all", label: "Any watering" },
  { id: "low", label: "Water less often" },
  { id: "medium", label: "Regular routine" },
  { id: "high", label: "Frequent watering" },
];
const GROWTH_OPTIONS: Array<{ id: GrowthMode; label: string }> = [
  { id: "all", label: "Any growth" },
  { id: "slow", label: "Slow growth" },
  { id: "moderate", label: "Moderate growth" },
  { id: "fast", label: "Fast growth" },
];
const SIZE_OPTIONS: Array<{ id: SizeMode; label: string }> = [
  { id: "all", label: "Any size" },
  { id: "compact", label: "Compact" },
  { id: "balanced", label: "Balanced" },
  { id: "statement", label: "Statement" },
];
const LIGHT_OPTIONS: Array<{ id: LightMode; label: string }> = [
  { id: "all", label: "Any light" },
  { id: "low", label: "Low light" },
  { id: "medium", label: "Medium light" },
  { id: "bright", label: "Bright light" },
];

function normalize(value: string) {
  return value.toLowerCase();
}

function inferWaterBand(value: string): WaterMode {
  const text = normalize(value);
  if (text.includes("weekly") || text.includes("every 5") || text.includes("every 7")) return "high";
  if (text.includes("10") || text.includes("1-2") || text.includes("biweek")) return "low";
  return "medium";
}

function inferLightBand(value: string): LightMode {
  const text = normalize(value);
  if (text.includes("low") || text.includes("shade")) return "low";
  if (text.includes("bright") || text.includes("direct") || text.includes("sun")) return "bright";
  return "medium";
}

function inferSizeBand(plant: Plant): Exclude<SizeMode, "all"> {
  const placement = normalize(plant.recommendedPlacement);
  const description = normalize(plant.description);
  const category = normalize(plant.category);

  if (
    placement.includes("floor") ||
    placement.includes("corner") ||
    placement.includes("entry") ||
    category.includes("statement") ||
    description.includes("dramatic") ||
    description.includes("large")
  ) {
    return "statement";
  }

  if (
    placement.includes("desk") ||
    placement.includes("shelf") ||
    placement.includes("table") ||
    category.includes("small") ||
    category.includes("succulent") ||
    category.includes("cactus")
  ) {
    return "compact";
  }

  return "balanced";
}

function computeScore(plant: Plant, selections: {
  environmentMode: EnvironmentMode;
  difficultyMode: DifficultyMode;
  waterMode: WaterMode;
  growthMode: GrowthMode;
  sizeMode: SizeMode;
  lightMode: LightMode;
  petSafeOnly: boolean;
}) {
  let score = 25 + Math.min(Math.round(plant.popularity / 10), 12);

  if (selections.environmentMode !== "all") {
    score += selections.environmentMode === "indoor" && plant.indoor ? 20 : 0;
    score += selections.environmentMode === "outdoor" && !plant.indoor ? 20 : 0;
  }

  if (selections.difficultyMode !== "all") {
    score += plant.difficulty === selections.difficultyMode ? 22 : 0;
  }

  if (selections.waterMode !== "all") {
    score += inferWaterBand(plant.wateringFrequency) === selections.waterMode ? 16 : 0;
  }

  if (selections.growthMode !== "all") {
    score += normalize(plant.growthSpeed).includes(selections.growthMode) ? 16 : 0;
  }

  if (selections.sizeMode !== "all") {
    score += inferSizeBand(plant) === selections.sizeMode ? 18 : 0;
  }

  if (selections.lightMode !== "all") {
    score += inferLightBand(plant.lightRequirement) === selections.lightMode ? 16 : 0;
  }

  if (selections.petSafeOnly && plant.petSafe) {
    score += 24;
  }

  score += plant.airPurificationRating * 2;
  return score;
}

function matchesFilters(plant: Plant, selections: {
  environmentMode: EnvironmentMode;
  difficultyMode: DifficultyMode;
  waterMode: WaterMode;
  growthMode: GrowthMode;
  sizeMode: SizeMode;
  lightMode: LightMode;
  petSafeOnly: boolean;
}) {
  if (selections.environmentMode === "indoor" && !plant.indoor) return false;
  if (selections.environmentMode === "outdoor" && plant.indoor) return false;
  if (selections.difficultyMode !== "all" && plant.difficulty !== selections.difficultyMode) return false;
  if (selections.waterMode !== "all" && inferWaterBand(plant.wateringFrequency) !== selections.waterMode) return false;
  if (selections.growthMode !== "all" && !normalize(plant.growthSpeed).includes(selections.growthMode)) return false;
  if (selections.sizeMode !== "all" && inferSizeBand(plant) !== selections.sizeMode) return false;
  if (selections.lightMode !== "all" && inferLightBand(plant.lightRequirement) !== selections.lightMode) return false;
  if (selections.petSafeOnly && !plant.petSafe) return false;
  return true;
}

function activeSelectionCount(selections: {
  environmentMode: EnvironmentMode;
  difficultyMode: DifficultyMode;
  waterMode: WaterMode;
  growthMode: GrowthMode;
  sizeMode: SizeMode;
  lightMode: LightMode;
  petSafeOnly: boolean;
}) {
  return [
    selections.environmentMode !== "all",
    selections.difficultyMode !== "all",
    selections.waterMode !== "all",
    selections.growthMode !== "all",
    selections.sizeMode !== "all",
    selections.lightMode !== "all",
    selections.petSafeOnly,
  ].filter(Boolean).length;
}

export default function PlantMatchmaker() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const [environmentMode, setEnvironmentMode] = useState<EnvironmentMode>("all");
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>("all");
  const [waterMode, setWaterMode] = useState<WaterMode>("all");
  const [growthMode, setGrowthMode] = useState<GrowthMode>("all");
  const [sizeMode, setSizeMode] = useState<SizeMode>("all");
  const [lightMode, setLightMode] = useState<LightMode>("all");
  const [petSafeOnly, setPetSafeOnly] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(`${getApiBase()}/api/plants?sortBy=popularity`)
      .then((response) => response.json())
      .then((data) => {
        if (active && Array.isArray(data)) {
          setPlants(data);
        }
      })
      .catch(() => {
        if (active) setPlants([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selections = {
    environmentMode,
    difficultyMode,
    waterMode,
    growthMode,
    sizeMode,
    lightMode,
    petSafeOnly,
  };

  const filteredPlants = useMemo(() => {
    return plants
      .filter((plant) => matchesFilters(plant, selections))
      .map((plant) => ({
        plant,
        score: computeScore(plant, selections),
      }))
      .sort((a, b) => b.score - a.score);
  }, [plants, environmentMode, difficultyMode, waterMode, growthMode, sizeMode, lightMode, petSafeOnly]);

  const heroPlant = filteredPlants[0];
  const shownPlants = filteredPlants.slice(0, visibleCount);
  const hasMore = filteredPlants.length > shownPlants.length;
  const activeCount = activeSelectionCount(selections);

  useEffect(() => {
    setVisibleCount(8);
  }, [environmentMode, difficultyMode, waterMode, growthMode, sizeMode, lightMode, petSafeOnly]);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(27,94,57,0.06),rgba(255,248,230,0.96),rgba(205,238,220,0.65))] py-24 lg:py-28">
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute left-[8%] top-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute right-[10%] top-24 h-40 w-40 rounded-full bg-lime-100/70 blur-3xl" />
        <div className="absolute bottom-12 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Leafline Smart Selector
          </div>
          <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Explore All Plants With
            <span className="block text-primary">A Smarter Selection System</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Instead of showing only three suggestions, this selector scans your full catalog and filters plants by environment, care effort, watering rhythm, growth behavior, and room presence.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/72 p-6 shadow-xl backdrop-blur md:p-8">
            <div className="grid gap-6">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Environment</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {ENVIRONMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = environmentMode === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setEnvironmentMode(option.id)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${active ? "border-emerald-700 bg-emerald-900 text-white shadow-lg" : "border-border bg-background/80 hover:border-emerald-300 hover:bg-white"}`}
                      >
                        <Icon className={`mb-3 h-5 w-5 ${active ? "text-emerald-200" : "text-emerald-700"}`} />
                        <div className="text-base font-semibold">{option.label}</div>
                        <div className={`mt-1 text-sm ${active ? "text-emerald-100/85" : "text-muted-foreground"}`}>{option.hint}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Difficulty</p>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => setDifficultyMode(option)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${difficultyMode === option ? "bg-amber-500 text-white shadow-md" : "bg-background text-muted-foreground border border-border hover:border-amber-300 hover:text-foreground"}`}
                      >
                        {option === "all" ? "Any difficulty" : option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Light Need</p>
                  <div className="flex flex-wrap gap-2">
                    {LIGHT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setLightMode(option.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${lightMode === option.id ? "bg-yellow-500 text-white shadow-md" : "bg-background text-muted-foreground border border-border hover:border-yellow-300 hover:text-foreground"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Watering</p>
                  <div className="flex flex-wrap gap-2">
                    {WATER_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setWaterMode(option.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${waterMode === option.id ? "bg-sky-500 text-white shadow-md" : "bg-background text-muted-foreground border border-border hover:border-sky-300 hover:text-foreground"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Growth Speed</p>
                  <div className="flex flex-wrap gap-2">
                    {GROWTH_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setGrowthMode(option.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${growthMode === option.id ? "bg-lime-600 text-white shadow-md" : "bg-background text-muted-foreground border border-border hover:border-lime-300 hover:text-foreground"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Plant Presence</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSizeMode(option.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${sizeMode === option.id ? "bg-violet-600 text-white shadow-md" : "bg-background text-muted-foreground border border-border hover:border-violet-300 hover:text-foreground"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setPetSafeOnly((value) => !value)}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${petSafeOnly ? "border-sky-500 bg-sky-100 text-sky-950 shadow-md" : "border-border bg-background text-muted-foreground hover:border-sky-300 hover:text-foreground"}`}
                  >
                    <PawPrint className="h-4 w-4" />
                    Pet Safe Only
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {filteredPlants.length} matching plants from your catalog
                  </p>
                  <p className="text-sm text-emerald-800/75">
                    {activeCount > 0 ? `${activeCount} smart filters active` : "No filters applied yet, so the full collection stays visible."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEnvironmentMode("all");
                    setDifficultyMode("all");
                    setWaterMode("all");
                    setGrowthMode("all");
                    setSizeMode("all");
                    setLightMode("all");
                    setPetSafeOnly(false);
                  }}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm transition-all hover:shadow"
                >
                  Reset Selector
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-100 bg-[#163b26] p-6 text-white shadow-2xl md:p-8">
            {loading ? (
              <div className="flex min-h-[22rem] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-200" />
              </div>
            ) : heroPlant ? (
              <motion.div
                key={`${environmentMode}-${difficultyMode}-${waterMode}-${growthMode}-${sizeMode}-${lightMode}-${petSafeOnly}-${heroPlant.plant.id}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Best Current Match</p>
                    <h3 className="mt-2 text-3xl font-black">{heroPlant.plant.name}</h3>
                    <p className="text-sm italic text-emerald-100/75">{heroPlant.plant.scientificName}</p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                    Match {Math.min(heroPlant.score, 99)}%
                  </div>
                </div>

                <div className={`relative mb-6 flex min-h-[15rem] items-center justify-center overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${heroPlant.plant.gradient}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                    className="relative text-8xl drop-shadow-[0_14px_24px_rgba(0,0,0,0.15)]"
                  >
                    {heroPlant.plant.emoji}
                  </motion.div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-100/60">
                      <Sprout className="h-3.5 w-3.5" />
                      Growth
                    </div>
                    <div className="text-sm text-emerald-50/90">
                      {heroPlant.plant.growthSpeed} growth with {inferSizeBand(heroPlant.plant)} room presence.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-100/60">
                      <Droplets className="h-3.5 w-3.5" />
                      Watering
                    </div>
                    <div className="text-sm text-emerald-50/90">
                      {heroPlant.plant.wateringFrequency}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-100/60">
                      <SunMedium className="h-3.5 w-3.5" />
                      Light
                    </div>
                    <div className="text-sm text-emerald-50/90">
                      {heroPlant.plant.lightRequirement}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-100/60">
                      <Wind className="h-3.5 w-3.5" />
                      Humidity
                    </div>
                    <div className="text-sm text-emerald-50/90">
                      {heroPlant.plant.humidityRequirement}
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-emerald-100/80">
                  {heroPlant.plant.description}
                </p>

                <Link href={`/plant/${heroPlant.plant.id}`}>
                  <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-900 shadow-lg transition-transform hover:translate-x-1">
                    Open Plant Details
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ) : (
              <div className="flex min-h-[22rem] flex-col items-start justify-center">
                <p className="text-sm uppercase tracking-[0.18em] text-emerald-200/70">No match found</p>
                <h3 className="mt-3 text-3xl font-black">Try widening one filter</h3>
                <p className="mt-4 max-w-md text-emerald-100/75">
                  The current combination is very strict. Reset one or two filters and the selector will immediately repopulate from your catalog.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          {loading ? null : (
            <>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-foreground">Matched Collection</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing {shownPlants.length} of {filteredPlants.length} plants that fit the current selection.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {shownPlants.map(({ plant, score }, index) => (
                  <motion.div
                    key={plant.id}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                  >
                    <Link href={`/plant/${plant.id}`}>
                      <div className="group h-full cursor-pointer overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${plant.gradient}`}>
                          <span className="text-6xl">{plant.emoji}</span>
                          <div className="absolute right-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-emerald-900 backdrop-blur">
                            {Math.min(score, 99)}%
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="text-sm italic text-muted-foreground">{plant.scientificName}</p>
                          <h4 className="mt-1 text-lg font-bold text-foreground">{plant.name}</h4>
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{plant.description}</p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                              {plant.indoor ? "Indoor" : "Outdoor"}
                            </span>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                              {plant.difficulty}
                            </span>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                              {inferSizeBand(plant)}
                            </span>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                              {plant.growthSpeed}
                            </span>
                            {plant.petSafe ? (
                              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                Pet Safe
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-sky-600" />
                              <span>{plant.wateringFrequency}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <SunMedium className="h-4 w-4 text-amber-500" />
                              <span>{plant.lightRequirement}</span>
                            </div>
                          </div>

                          <div className="mt-5 flex items-center justify-between">
                            <span className="text-lg font-bold text-foreground">${plant.price.toFixed(2)}</span>
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                              View
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {hasMore ? (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleCount((count) => count + 8)}
                    className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent"
                  >
                    Show More Plants
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
