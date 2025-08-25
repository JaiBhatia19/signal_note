import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";

let _openai: OpenAI | null = null;
export function getOpenAI() {
  const { OPENAI_API_KEY } = getServerEnv();
  if (!OPENAI_API_KEY) return null;
  if (!_openai) _openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  return _openai;
} 