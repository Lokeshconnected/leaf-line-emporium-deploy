export interface PlantIntelligencePlant {
  name: string;
  difficulty: string;
  lightRequirement: string;
  wateringFrequency: string;
  humidityRequirement: string;
  petSafe: boolean;
  airPurificationRating: number;
}

export interface FitPreferences {
  roomLight: "low" | "medium" | "bright";
  routine: "light-touch" | "steady" | "hands-on";
  humidity: "dry" | "balanced" | "humid";
  hasPets: boolean;
}

export interface CareEvent {
  title: string;
  description: string;
  date: Date;
}

function normalize(value: string) {
  return value.toLowerCase();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function inferLightBand(value: string): "low" | "medium" | "bright" {
  const text = normalize(value);
  if (text.includes("low") || text.includes("shade") || text.includes("any")) return "low";
  if (text.includes("bright") || text.includes("direct") || text.includes("sun")) return "bright";
  return "medium";
}

export function inferRoutineBand(value: string): "light-touch" | "steady" | "hands-on" {
  const text = normalize(value);
  if (text.includes("monthly") || text.includes("10") || text.includes("bi-week")) return "light-touch";
  if (text.includes("weekly")) return "steady";
  return "hands-on";
}

export function inferHumidityBand(value: string): "dry" | "balanced" | "humid" {
  const text = normalize(value);
  if (text.includes("high")) return "humid";
  if (text.includes("low")) return "dry";
  return "balanced";
}

function wateringIntervalDays(value: string) {
  const text = normalize(value);
  if (text.includes("monthly")) return 28;
  if (text.includes("bi-week")) return 14;
  if (text.includes("10")) return 10;
  if (text.includes("weekly")) return 7;
  return 9;
}

function mistIntervalDays(value: string) {
  const band = inferHumidityBand(value);
  if (band === "humid") return 4;
  if (band === "balanced") return 8;
  return 14;
}

function feedIntervalDays(difficulty: string) {
  const text = normalize(difficulty);
  if (text.includes("expert")) return 21;
  if (text.includes("moderate")) return 30;
  return 45;
}

export function buildCareTimeline(plant: PlantIntelligencePlant, start = new Date()) {
  const base = new Date(start);
  const events: CareEvent[] = [];

  for (let step = 1; step <= 4; step += 1) {
    events.push({
      title: "Water check",
      description: `Check moisture and water ${plant.name} only if the top layer feels dry.`,
      date: new Date(base.getTime() + wateringIntervalDays(plant.wateringFrequency) * step * 86400000),
    });
  }

  for (let step = 1; step <= 2; step += 1) {
    events.push({
      title: "Humidity and leaf care",
      description: `Refresh foliage, inspect leaves, and support the ${plant.humidityRequirement.toLowerCase()} humidity preference.`,
      date: new Date(base.getTime() + mistIntervalDays(plant.humidityRequirement) * step * 86400000),
    });
  }

  events.push({
    title: "Feed and rotate",
    description: `Rotate the pot and add a light feed if ${plant.name} is in an active growth phase.`,
    date: new Date(base.getTime() + feedIntervalDays(plant.difficulty) * 86400000),
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function buildCareCalendarFile(plant: PlantIntelligencePlant) {
  const events = buildCareTimeline(plant);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Leafline//Plant Care Planner//EN",
    "CALSCALE:GREGORIAN",
  ];

  events.forEach((event, index) => {
    const startDate = formatIcsDate(event.date);
    const endDate = formatIcsDate(new Date(event.date.getTime() + 3600000));
    lines.push(
      "BEGIN:VEVENT",
      `UID:${slugify(plant.name)}-${index}-${startDate}@leafline`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${escapeIcsText(`${plant.name} • ${event.title}`)}`,
      `DESCRIPTION:${escapeIcsText(event.description)}`,
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadCareCalendar(plant: PlantIntelligencePlant) {
  const calendar = buildCareCalendarFile(plant);
  const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(plant.name)}-care-plan.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function calculatePlantFit(plant: PlantIntelligencePlant, preferences: FitPreferences) {
  let score = 62;
  const strengths: string[] = [];
  const cautions: string[] = [];

  const lightBand = inferLightBand(plant.lightRequirement);
  if (lightBand === preferences.roomLight) {
    score += 14;
    strengths.push(`Light needs line up well with a ${preferences.roomLight}-light room.`);
  } else if (lightBand === "medium" && preferences.roomLight !== "low") {
    score += 6;
    strengths.push("This plant is flexible enough to work with adaptable lighting.");
  } else {
    score -= 14;
    cautions.push(`Its light preference leans ${lightBand}, so placement will matter.`);
  }

  const routineBand = inferRoutineBand(plant.wateringFrequency);
  if (routineBand === preferences.routine) {
    score += 12;
    strengths.push("The care rhythm matches the routine you want to keep.");
  } else if (routineBand === "steady" && preferences.routine !== "light-touch") {
    score += 4;
  } else {
    score -= 10;
    cautions.push("Its watering rhythm may feel heavier or lighter than your ideal routine.");
  }

  const humidityBand = inferHumidityBand(plant.humidityRequirement);
  if (humidityBand === preferences.humidity) {
    score += 10;
    strengths.push("Humidity expectations are a close fit for your space.");
  } else if (humidityBand === "balanced" || preferences.humidity === "balanced") {
    score += 3;
  } else {
    score -= 8;
    cautions.push(`Humidity support may be needed because this plant leans ${humidityBand}.`);
  }

  if (preferences.hasPets) {
    if (plant.petSafe) {
      score += 12;
      strengths.push("It is a safer option for pet-friendly homes.");
    } else {
      score -= 24;
      cautions.push("This plant is not pet safe, so placement needs extra care.");
    }
  }

  if (normalize(plant.difficulty).includes("easy")) {
    score += 6;
    strengths.push("Its beginner-friendly profile lowers the day-to-day maintenance risk.");
  } else if (normalize(plant.difficulty).includes("expert")) {
    score -= 6;
    cautions.push("It rewards consistency, so it is less forgiving than starter plants.");
  }

  if (plant.airPurificationRating >= 4) {
    strengths.push("It also brings strong air-purifying value to the room.");
  }

  return {
    score: clamp(score, 22, 98),
    strengths: strengths.slice(0, 3),
    cautions: cautions.slice(0, 2),
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatIcsDate(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
