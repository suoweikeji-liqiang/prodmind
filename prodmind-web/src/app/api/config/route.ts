import { NextResponse } from "next/server";
import { getAppConfig, setAppConfig, maskApiKey } from "@/lib/config";

export async function GET() {
  const cfg = await getAppConfig();
  return NextResponse.json({
    apiKey: maskApiKey(cfg.apiKey),
    baseURL: cfg.baseURL,
    model: cfg.model,
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  await setAppConfig(body);
  const cfg = await getAppConfig();
  return NextResponse.json({
    apiKey: maskApiKey(cfg.apiKey),
    baseURL: cfg.baseURL,
    model: cfg.model,
  });
}
