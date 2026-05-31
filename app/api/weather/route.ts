import { NextResponse } from "next/server";
import { fetchBhopalWeather } from "@/lib/weather";

export async function GET() {
  try {
    const weather = await fetchBhopalWeather();
    return NextResponse.json(weather);
  } catch (error) {
    console.error("Error in weather API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
