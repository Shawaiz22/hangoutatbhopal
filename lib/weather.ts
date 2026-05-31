import { WeatherInfo } from "@/types";

export function getWeatherDetails(code: number): { description: string; emoji: string } {
  // Mapping WMO Weather Codes (https://open-meteo.com/en/docs)
  if (code === 0) return { description: "Clear Sky", emoji: "☀️" };
  if (code >= 1 && code <= 3) return { description: "Partly Cloudy", emoji: "⛅" };
  if (code === 45 || code === 48) return { description: "Foggy", emoji: "🌫️" };
  if (code >= 51 && code <= 55) return { description: "Drizzle", emoji: "🌧️" };
  if (code >= 56 && code <= 57) return { description: "Freezing Drizzle", emoji: "🌧️" };
  if (code >= 61 && code <= 65) return { description: "Rainy", emoji: "🌧️" };
  if (code >= 66 && code <= 67) return { description: "Freezing Rain", emoji: "🌧️" };
  if (code >= 71 && code <= 77) return { description: "Snowy", emoji: "❄️" };
  if (code >= 80 && code <= 82) return { description: "Rain Showers", emoji: "🌦️" };
  if (code >= 85 && code <= 86) return { description: "Snow Showers", emoji: "🌨️" };
  if (code >= 95 && code <= 99) return { description: "Thunderstorm", emoji: "⛈️" };
  return { description: "Cloudy", emoji: "☁️" };
}

export async function fetchBhopalWeather(): Promise<WeatherInfo> {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=23.2599&longitude=77.4126&current_weather=true";
  
  try {
    const res = await fetch(url, { next: { revalidate: 300 } }); // Cache weather for 5 minutes
    if (!res.ok) {
      throw new Error(`Failed to fetch weather: ${res.statusText}`);
    }
    const data = await res.json();
    const current = data.current_weather;
    
    if (!current) {
      throw new Error("Invalid weather data format received");
    }

    const { description, emoji } = getWeatherDetails(current.weathercode);

    return {
      temperature: Math.round(current.temperature),
      weathercode: current.weathercode,
      windspeed: current.windspeed,
      description,
      emoji,
    };
  } catch (error) {
    console.error("Error fetching Bhopal weather:", error);
    // Return standard fallback weather for Bhopal
    return {
      temperature: 28,
      weathercode: 1,
      windspeed: 10,
      description: "Partly Cloudy",
      emoji: "⛅",
    };
  }
}
