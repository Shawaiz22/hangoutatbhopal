import { NextResponse } from "next/server";
import { generateHangoutSuggestions } from "@/lib/gemini";
import { QuizAnswers, WeatherInfo } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, weather }: { answers: QuizAnswers; weather: WeatherInfo } = body;

    if (!answers || !weather) {
      return NextResponse.json(
        { error: "Missing required parameters: answers and weather" },
        { status: 400 }
      );
    }

    // Get current time and day in Indian Standard Time (IST) since Bhopal is in India
    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });
    const currentDay = now.toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
    });

    const suggestions = await generateHangoutSuggestions(
      answers,
      weather,
      currentTime,
      currentDay
    );

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error in suggest API route:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
