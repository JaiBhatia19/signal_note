import OpenAI from "openai";
import { env } from "../env";

export function getOpenAI() {
  if (!env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
} 