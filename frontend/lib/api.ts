export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export type PredictResponse = {
  label: "fake" | "real";
  label_th: string;
  probability: number;
  prob_fake: number;
  model_used: string;
  display_name: string;
  latency_ms: number;
};

export type ModelMetrics = {
  display_name: string;
  f1: number;
  precision: number;
  recall: number;
  accuracy: number;
  confusion_matrix: number[][];
  available?: boolean;
};

export async function pingHealth(timeoutMs = 4000): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type ModelsResponse = {
  best_model: string;
  models: Record<string, ModelMetrics>;
};

export async function predict(
  text: string,
  model?: string
): Promise<PredictResponse> {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, model: model || null }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail?.[0]?.msg ?? detail?.detail ?? `API error ${res.status}`);
  }
  return res.json();
}

export async function getModels(): Promise<ModelsResponse> {
  const res = await fetch(`${API_BASE}/api/models`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
