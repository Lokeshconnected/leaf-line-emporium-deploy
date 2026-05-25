import OpenAI from "openai";

const openRouterBaseUrl =
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ??
  process.env.OPENROUTER_BASE_URL ??
  "https://openrouter.ai/api/v1";

const openRouterApiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY ??
  process.env.OPENROUTER_API_KEY;

if (!openRouterBaseUrl) {
  throw new Error("Missing OpenRouter base URL");
}

if (!openRouterApiKey) {
  throw new Error("Missing OpenRouter API key");
}

export const openai = new OpenAI({
  apiKey: openRouterApiKey,
  baseURL: openRouterBaseUrl,

  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:5174",
    "X-Title": process.env.OPENROUTER_APP_NAME ?? "Leafline AI Assistant",
  },
});
