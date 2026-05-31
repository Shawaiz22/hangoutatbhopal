import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuizAnswers, WeatherInfo, GeminiSuggestion } from "@/types";

// Initialize Google Generative AI client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn("GEMINI_API_KEY is not configured or using placeholder");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function generateHangoutSuggestions(
  answers: QuizAnswers,
  weather: WeatherInfo,
  currentTime: string,
  currentDay: string
): Promise<GeminiSuggestion[]> {
  const client = getGeminiClient();

  if (!client) {
    return getMockSuggestions(answers);
  }

  try {
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction:
        "You are a hyperlocal Bhopal city guide AI. You know every hangout spot, cafe, mall, monument, lake, street food area, park, and hidden gem in Bhopal, India. You suggest places based on mood, weather, time, and budget.",
    });

    const prompt = `Suggest exactly 3 hangout spots in Bhopal for someone who is feeling ${answers.mood}, going ${answers.company}, with a budget of ${answers.budget}, willing to travel ${answers.distance}. 
Current weather: ${weather.description}, ${weather.temperature}°C. 
Current time: ${currentTime}. Day: ${currentDay}.

For each place return a JSON array with this exact structure:
[
  {
    "name": "Place Name",
    "category": "Cafe / Mall / Park / Monument / Street Food / Lake",
    "tagline": "One fun punchy line about this place",
    "why": "2-3 sentences explaining exactly why this place fits the user's mood, weather and time right now",
    "address": "Full address in Bhopal",
    "googleMapsQuery": "Place name Bhopal for Maps search",
    "estimatedBudget": "e.g. ₹0 | ₹150–300 per person",
    "bestTimeToVisit": "e.g. Evenings after 6 PM",
    "mustTry": "One thing to do or eat there",
    "weatherSuitability": "Why this place works in current weather",
    "vibeScore": 85
  }
]

Return ONLY the JSON array. No explanation, no markdown.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    if (!responseText) {
      throw new Error("Empty response received from Gemini API");
    }

    const suggestions: GeminiSuggestion[] = JSON.parse(responseText.trim());
    return suggestions;
  } catch (error) {
    console.error("Error generating Gemini suggestions:", error);
    return getMockSuggestions(answers);
  }
}

// Fallback mock recommendations in case API keys are missing or requests fail
function getMockSuggestions(answers: QuizAnswers): GeminiSuggestion[] {
  const mood = answers.mood.toLowerCase();
  
  if (mood.includes("hungry") || mood.includes("social")) {
    return [
      {
        name: "Chatori Gali",
        category: "Street Food",
        tagline: "The culinary heart of old Bhopal's non-veg delights",
        why: "Perfect for satisfying intense cravings. The buzzing social vibe and aroma of kebabs fit your craving for street food.",
        address: "Chatori Gali, Ibrahimpura, Peer Gate Area, Bhopal, Madhya Pradesh 462001",
        googleMapsQuery: "Chatori Gali Bhopal",
        estimatedBudget: "₹150–300 per person",
        bestTimeToVisit: "Evenings after 6 PM",
        mustTry: "Mutton Seekh Kebabs and Filni",
        weatherSuitability: "Great for a bustling evening stroll under clear or cloudy skies.",
        vibeScore: 92,
      },
      {
        name: "Jehan Numa Retreat",
        category: "Cafe",
        tagline: "Fine dining and luxurious nature escape inside the city",
        why: "Offers a serene, premium dining experience surrounded by lush greenery, fitting for a relaxed yet premium food adventure.",
        address: "Near Van Vihar National Park, Prempura, Bhopal, Madhya Pradesh 462002",
        googleMapsQuery: "Jehan Numa Retreat Bhopal",
        estimatedBudget: "₹1000–2000 per person",
        bestTimeToVisit: "Afternoons and Sunset hours",
        mustTry: "Farm-to-fork organic lunch or wood-fired pizzas",
        weatherSuitability: "Beautiful open-air setting that excels in pleasant weather.",
        vibeScore: 95,
      },
      {
        name: "DB City Mall Food Court",
        category: "Mall",
        tagline: "Bhopal's premium shopping and multi-cuisine destination",
        why: "A great air-conditioned hangout spot when you want multiple food options and a highly social, lively environment.",
        address: "DB City Mall, Arera Hills, Bhopal, Madhya Pradesh 462011",
        googleMapsQuery: "DB City Mall Bhopal",
        estimatedBudget: "₹250–600 per person",
        bestTimeToVisit: "Anytime between 11 AM and 10 PM",
        mustTry: "Chhole Bhature at Sagar Gaire or waffles at Belgian Waffle",
        weatherSuitability: "Indoor venue, perfect protection from heavy rains or afternoon heat.",
        vibeScore: 88,
      },
    ];
  }

  // Default mock fallback
  return [
    {
      name: "Manuabhan Tekri",
      category: "Monument",
      tagline: "A hilltop temple offering breathtaking panoramic views of Bhopal",
      why: "Fits a chill or adventurous vibe perfectly. Taking the ropeway to the top gives you the absolute best viewpoint of the city lakes.",
      address: "Lalghati, Bhopal, Madhya Pradesh 462038",
      googleMapsQuery: "Manuabhan Tekri Bhopal",
      estimatedBudget: "₹50–150 per person (ropeway fee)",
      bestTimeToVisit: "Sunset or Early Mornings",
      mustTry: "Ropeway ride to the temple summit",
      weatherSuitability: "Best visited during windy evenings or cloudy days for a breezy panoramic experience.",
      vibeScore: 94,
    },
    {
      name: "Wind & Waves (Upper Lake)",
      category: "Lake",
      tagline: "Sip hot coffee right on the edge of the scenic Upper Lake",
      why: "Provides the ultimate relaxing Bhopal experience. Perfect for watching the sunset over Bada Talaab while sipping tea.",
      address: "Near Boat Club, Shamla Hills, Bhopal, Madhya Pradesh 462013",
      googleMapsQuery: "Wind & Waves Boat Club Bhopal",
      estimatedBudget: "₹200–400 per person",
      bestTimeToVisit: "5 PM to 9 PM",
      mustTry: "Hot Coffee with Cheese Sandwiches",
      weatherSuitability: "Fabulous breezy lakeside breeze makes this spot delightful in any weather except heavy downpours.",
      vibeScore: 90,
    },
    {
      name: "Sair Sapata",
      category: "Park",
      tagline: "Entertainment zone along the Bhadbhada dam backwaters",
      why: "Perfect for hanging out with friends or family. Features suspension bridges, toy trains, and beautiful walking paths.",
      address: "Bhadbhada Road, Prempura, Bhopal, Madhya Pradesh 462003",
      googleMapsQuery: "Sair Sapata Bhopal",
      estimatedBudget: "₹20–100 per person",
      bestTimeToVisit: "Late Afternoons and Evenings",
      mustTry: "Walking across the suspension bridge at night",
      weatherSuitability: "Outdoor park that is ideal for dry and pleasant weather.",
      vibeScore: 85,
    }
  ];
}
