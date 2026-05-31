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
        "You are a hyperlocal Bhopal city guide AI. You know every real, active hangout spot, cafe, mall, monument, lake, street food area, park, and hidden gem in Bhopal, India. You suggest places based on mood, weather, time, and budget. " +
        "Reference knowledge base of trending spots in Bhopal: Bansal One Complex (Rani Kamalapati Station - upscale dining), Sartre Cafe (Arera Colony), Shahpura Lake Promenade, Kerwa Dam Adventure Park (zipline/nature), Kaliasot Dam Viewpoint, Manuabhan Tekri Hilltop (Jain Temple & ropeway), Chatori Gali (Peer Gate - Mughlai street food), 10 Number Market (youth shopping/fast-food), Boat Club (Upper Lake/Bada Talaab - boating/cruise), Van Vihar National Park (lakeside cycling), DB City Mall (Central India's largest mall), Under The Mango Tree (Jehan Numa Palace - luxury dining), Bhopal Express (Coach Restaurant - themed dining), Gauhar Mahal (VIP Road - heritage handicraft palace), Ishan Coffee House (Shahpura). " +
        "CRITICAL RULES: Ensure every recommended place exists in Bhopal, is currently active, and is highly specific. Never output generic categories like 'A cafe in Arera Colony' or 'A local park'. Always output a verified, real-world name and exact address.",
    });

    // Strict mood-to-category rules injected into prompt
    const moodCategoryRules: Record<string, string> = {
      "adventurous": "ONLY suggest outdoor Parks, Lakes, Dams, Hill viewpoints, or Nature spots. Do NOT suggest cafes, restaurants, or malls.",
      "romantic":    "Suggest scenic Lakes, upscale Cafes with ambiance, or heritage Monuments. Avoid loud street food or malls.",
      "hungry":      "ONLY suggest Street Food areas, Cafes, or Restaurants. Do NOT suggest parks or monuments.",
      "chill":       "Suggest quiet Lakes, relaxed Parks, peaceful Cafes, or calm Monuments. Avoid loud malls or crowded markets.",
      "social":      "Suggest Malls, lively Cafes, or vibrant Street Food markets. Avoid isolated nature spots or quiet monuments.",
      "bored":       "Mix it up: one outdoor spot (Park or Lake), one food/cafe spot, and one unique or unexpected experience.",
    };
    const moodKey = Object.keys(moodCategoryRules).find(k => answers.mood.toLowerCase().includes(k));
    const moodRule = moodKey ? `STRICT MOOD RULE: ${moodCategoryRules[moodKey]}` : "";

    const prompt = `Suggest exactly 3 hangout spots in Bhopal for someone who is feeling ${answers.mood}, going ${answers.company}, with a budget of ${answers.budget}, willing to travel ${answers.distance}. 
Current weather: ${weather.description}, ${weather.temperature}°C. 
Current time: ${currentTime}. Day: ${currentDay}.
${moodRule}

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
  const budget = answers.budget.toLowerCase();
  const distance = answers.distance.toLowerCase();
  
  // High fidelity database of real Bhopal spots
  const database: GeminiSuggestion[] = [
    {
      name: "Bansal One Complex",
      category: "Cafe",
      tagline: "Bhopal's newest premium culinary and social hub",
      why: "Features trending fine-dining restaurants, cocktail lounges, and chic cafes. It's the absolute best spot for a premium social outing right now.",
      address: "Rani Kamalapati Railway Station Road, Habib Ganj, Bhopal, Madhya Pradesh 462016",
      googleMapsQuery: "Bansal One Bhopal",
      estimatedBudget: "₹600–1200 per person",
      bestTimeToVisit: "Evenings after 7 PM",
      mustTry: "Craft mocktails or artisanal coffee at any lounge",
      weatherSuitability: "An upscale indoor and semi-outdoor complex offering perfect weather protection.",
      vibeScore: 96
    },
    {
      name: "Madhya Pradesh Tribal Museum",
      category: "Monument",
      tagline: "An immersive, artistically curated tribute to tribal life",
      why: "A highly acclaimed museum featuring large-scale interactive tribal home replicas and galleries. Ideal for a deeply engaging, relaxed afternoon.",
      address: "Shyamla Hills Rd, near State Museum, Shyamla Hills, Bhopal, Madhya Pradesh 462002",
      googleMapsQuery: "Madhya Pradesh Tribal Museum Bhopal",
      estimatedBudget: "₹10–50 entry ticket",
      bestTimeToVisit: "12 PM to 5 PM (Closed Mondays)",
      mustTry: "Walking through the life-sized tribal diorama galleries",
      weatherSuitability: "Excellent air-conditioned indoor experience to escape afternoon heat or rain.",
      vibeScore: 95
    },
    {
      name: "Sartre Cafe (Arera Colony)",
      category: "Cafe",
      tagline: "A cozy literary cafe with premium brews and continental bites",
      why: "Quiet, intellectual ambiance with gorgeous minimal decor. Excellent for romantic conversations or chill reading sessions.",
      address: "E-7/84, near Bittan Market, E-7, Arera Colony, Bhopal, Madhya Pradesh 462016",
      googleMapsQuery: "Sartre Cafe Arera Colony Bhopal",
      estimatedBudget: "₹300–600 per person",
      bestTimeToVisit: "Late Afternoons & Evenings",
      mustTry: "Hot Mocha with sourdough chicken sandwich",
      weatherSuitability: "Cozy warm interiors, perfect for a rainy day or warm afternoon.",
      vibeScore: 92
    },
    {
      name: "Shahpura Lake Promenade",
      category: "Lake",
      tagline: "A picturesque sunset promenade with a pleasant walking track",
      why: "A local favorite for peaceful evening walks. It has a beautiful park, seating by the lake, and quick access to nearby cafes.",
      address: "Shahpura Lake, Ekant Park Road, Shahpura, Bhopal, Madhya Pradesh 462016",
      googleMapsQuery: "Shahpura Lake Bhopal",
      estimatedBudget: "₹0 (Free entry)",
      bestTimeToVisit: "5 PM to 8 PM",
      mustTry: "Watching the sunset from the lake-facing steps",
      weatherSuitability: "Breezy lakeside walkways that feel magical on a pleasant evening.",
      vibeScore: 89
    },
    {
      name: "Kerwa Dam Adventure Park",
      category: "Park",
      tagline: "Scenic reservoir with ziplining and nature trails",
      why: "Located on the outskirts, it offers beautiful views of green hills and the reservoir. Great for adventure, hiking, and picnics.",
      address: "Kerwa Dam Road, Mendora, Bhopal, Madhya Pradesh 462044",
      googleMapsQuery: "Kerwa Dam Bhopal",
      estimatedBudget: "₹50–500 (zipline charges extra)",
      bestTimeToVisit: "Mornings or Sunset hours",
      mustTry: "The long zip-line crossing over the dam waters",
      weatherSuitability: "Beautiful open-air setting that comes alive with lush greenery during monsoons and winters.",
      vibeScore: 94
    },
    {
      name: "Manuabhan Tekri",
      category: "Monument",
      tagline: "Hilltop Jain temple offering panoramic views of Bhopal",
      why: "Riding the ropeway to the top gives you a breezy, spectacular view of the entire city and its lakes. Ideal for families and couples.",
      address: "Lalghati, Bhopal, Madhya Pradesh 462038",
      googleMapsQuery: "Manuabhan Tekri Bhopal",
      estimatedBudget: "₹50–150 (for ropeway)",
      bestTimeToVisit: "Sunset or Early Mornings",
      mustTry: "Ropeway ride to the temple summit",
      weatherSuitability: "High altitude makes it breezy and cool during summer evenings and winter afternoons.",
      vibeScore: 91
    },
    {
      name: "Chatori Gali (Peer Gate)",
      category: "Street Food",
      tagline: "The heritage Mughlai street-food hub of old Bhopal",
      why: "The legendary alleyway that serves the finest kebabs, paya soup, and traditional desserts. A bustling, sensory food walk.",
      address: "Chatori Gali, Ibrahimpura, Peer Gate Area, Bhopal, Madhya Pradesh 462001",
      googleMapsQuery: "Chatori Gali Peer Gate Bhopal",
      estimatedBudget: "₹100–250 per person",
      bestTimeToVisit: "Post 7 PM",
      mustTry: "Bade Ke Kebab and Shahi Tukda",
      weatherSuitability: "Highly energetic outdoor street, best for dinner on pleasant nights.",
      vibeScore: 93
    },
    {
      name: "10 Number Market (Arera Colony)",
      category: "Street Food",
      tagline: "Bhopal's iconic youth shopping and fast-food hub",
      why: "A vibrant market plaza packed with local food stalls, bookshops, and boutiques. The social center for college students.",
      address: "10 No. Market, E-4, Arera Colony, Bhopal, Madhya Pradesh 462016",
      googleMapsQuery: "10 No Market Bhopal",
      estimatedBudget: "₹100–300 per person",
      bestTimeToVisit: "5 PM to 9:30 PM",
      mustTry: "Cheese burgers at Sagar Gaire or paneer tikka rolls",
      weatherSuitability: "Bustling open-air market lanes, great for shopping and snacking in dry weather.",
      vibeScore: 90
    },
    {
      name: "Boat Club (Upper Lake)",
      category: "Lake",
      tagline: "Bhopal's signature lakeside spot with boating and cruises",
      why: "The iconic tourist spot of Bhopal. You can rent paddleboats, speedboats, or cruise on the majestic Bada Talaab.",
      address: "Shamla Hills, near Wind & Waves, Bhopal, Madhya Pradesh 462013",
      googleMapsQuery: "Boat Club Bhopal",
      estimatedBudget: "₹50–350 (boating fee)",
      bestTimeToVisit: "4 PM to 8 PM",
      mustTry: "Speedboating or catching the evening cruise",
      weatherSuitability: "Open lakeside that gets beautifully breezy in the evening. Perfect when the skies are clear or overcast.",
      vibeScore: 95
    },
    {
      name: "Van Vihar National Park",
      category: "Park",
      tagline: "A lakeside open national park and wildlife sanctuary",
      why: "A unique open zoo where animals roam in large natural enclosures. You can rent a bicycle and ride along the 5km lake path.",
      address: "Lake View Walk Path, Shamla Hills, Bhopal, Madhya Pradesh 462002",
      googleMapsQuery: "Van Vihar National Park Bhopal",
      estimatedBudget: "₹20–100 (bicycle rental extra)",
      bestTimeToVisit: "7 AM to 10 AM or 4 PM to 6 PM (Closed Fridays)",
      mustTry: "Cycling the length of the park next to the Upper Lake",
      weatherSuitability: "Best enjoyed in cool morning hours or pleasant winter days.",
      vibeScore: 93
    },
    {
      name: "DB City Mall (Arera Hills)",
      category: "Mall",
      tagline: "The largest shopping mall in Central India",
      why: "Bhopal's standard for retail therapy, multiplex cinema, and multi-cuisine dining under one roof. High energy and social.",
      address: "DB City Mall, Arera Hills, Bhopal, Madhya Pradesh 462011",
      googleMapsQuery: "DB City Mall Bhopal",
      estimatedBudget: "₹300–800 per person",
      bestTimeToVisit: "Anytime (11 AM to 10 PM)",
      mustTry: "Snack at the food court or visit the gaming zone",
      weatherSuitability: "Fully indoor and climatized, the best shelter from summer heat waves or heavy monsoon rains.",
      vibeScore: 88
    },
    {
      name: "Under The Mango Tree",
      category: "Cafe",
      tagline: "Luxurious open-air dining under a heritage mango orchard",
      why: "Part of the Jehan Numa Palace hotel, this premium spot offers a majestic royal ambiance, outstanding service, and exquisite cuisine.",
      address: "Jehan Numa Palace Hotel, 157, Shamla Hills, Bhopal, Madhya Pradesh 462013",
      googleMapsQuery: "Under The Mango Tree Jehan Numa Palace Bhopal",
      estimatedBudget: "₹1200–2500 per person",
      bestTimeToVisit: "Dinner hours (7 PM onwards)",
      mustTry: "Royal Mughlai platters or specialty pasta",
      weatherSuitability: "Open-air courtyard surrounding a tree, spectacular during pleasant evenings.",
      vibeScore: 97
    },
    {
      name: "Bhopal Express (Coach Restaurant)",
      category: "Cafe",
      tagline: "Bhopal's unique restaurant set inside a real train coach",
      why: "Owned by MP Tourism, this restaurant simulates the dining car of a luxury train. Excellent theme, great for families and date nights.",
      address: "Hotel Lake View Ashok Campus, Shamla Hills, Bhopal, Madhya Pradesh 462013",
      googleMapsQuery: "Bhopal Express Train Restaurant Bhopal",
      estimatedBudget: "₹300–600 per person",
      bestTimeToVisit: "7 PM to 11 PM",
      mustTry: "Lakeside paneer tikka or railway mutton curry",
      weatherSuitability: "Indoors, simulation of train cabin. Warm and comfortable year-round.",
      vibeScore: 90
    },
    {
      name: "Gauhar Mahal",
      category: "Monument",
      tagline: "An 1820s royal palace blending Hindu and Mughal architecture",
      why: "Built by the first female ruler of Bhopal, this heritage palace features gorgeous courtyards and regularly hosts local handicraft fairs.",
      address: "VIP Road, near Upper Lake, Chowk Bazaar, Bhopal, Madhya Pradesh 462001",
      googleMapsQuery: "Gauhar Mahal VIP Road Bhopal",
      estimatedBudget: "₹0 (Free entry)",
      bestTimeToVisit: "3 PM to 7 PM",
      mustTry: "Shopping for handloom Maheshwari and Chanderi sarees",
      weatherSuitability: "Lakeside stone structure, very pleasant in the late afternoon.",
      vibeScore: 87
    },
    {
      name: "Kaliasot Dam Viewpoint",
      category: "Lake",
      tagline: "A scenic dam backwater spot for sunset watchers",
      why: "A scenic escape on the outskirts of the city. Very popular for watching sunsets, enjoying piping hot tea, and looking at the hills.",
      address: "Kaliasot Dam Road, Kaliasot, Bhopal, Madhya Pradesh 462003",
      googleMapsQuery: "Kaliasot Dam Bhopal",
      estimatedBudget: "₹0 (Free)",
      bestTimeToVisit: "5 PM to 7 PM",
      mustTry: "Kulhad Chai at a nearby local stall",
      weatherSuitability: "Excellent lakeside breezes. Highly recommended during monsoons when gates are open.",
      vibeScore: 91
    }
  ];

  // Dynamic matching logic
  let filtered = database.filter(item => {
    // 1. Filter by distance
    const isOutskirts = distance.includes("outskirts");
    const isNearby = distance.includes("nearby");
    
    if (isOutskirts) {
      // Outskirts only
      return item.name.includes("Kerwa") || item.name.includes("Kaliasot") || item.name.includes("Manuabhan");
    } else if (isNearby) {
      // Exclude outskirts
      return !(item.name.includes("Kerwa") || item.name.includes("Kaliasot") || item.name.includes("Manuabhan"));
    }
    return true;
  });

  // 2. Filter by budget
  const isFree = budget.includes("free");
  const isBudget = budget.includes("budget");
  const isModerate = budget.includes("moderate");
  const isSplurge = budget.includes("splurge");

  let budgetFiltered = filtered.filter(item => {
    const cost = item.estimatedBudget.toLowerCase();
    if (isFree) return cost.includes("₹0") || cost.includes("free");
    if (isBudget) return cost.includes("₹10") || cost.includes("₹50") || cost.includes("₹100") || cost.includes("₹150") || cost.includes("free") || cost.includes("₹0");
    if (isModerate) return cost.includes("₹200") || cost.includes("₹300") || cost.includes("₹500") || cost.includes("₹600") || cost.includes("₹100") || cost.includes("₹150");
    if (isSplurge) return cost.includes("₹600") || cost.includes("₹800") || cost.includes("₹1000") || cost.includes("₹1200") || cost.includes("₹2500") || cost.includes("₹2000");
    return true;
  });

  // Fallback to full list if budget filter is too restrictive
  if (budgetFiltered.length < 3) {
    budgetFiltered = filtered;
  }

  // 3. Strict mood-to-category filter
  const moodCategoryMap: Record<string, (cat: string, name: string) => boolean> = {
    "hungry":      (cat) => cat.includes("street food") || cat.includes("cafe"),
    "romantic":    (cat, name) => cat.includes("lake") || (cat.includes("cafe") && (name.includes("Sartre") || name.includes("Mango") || name.includes("Express"))) || name.includes("Manuabhan"),
    "adventurous": (cat, name) => cat.includes("park") || cat.includes("lake") || name.includes("Kerwa") || name.includes("Kaliasot") || name.includes("Manuabhan"),
    "chill":       (cat) => cat.includes("lake") || cat.includes("monument") || cat.includes("park"),
    "social":      (cat) => cat.includes("mall") || cat.includes("cafe") || cat.includes("street food"),
    "bored":       () => true, // show variety
  };

  const moodKey = Object.keys(moodCategoryMap).find(k => mood.includes(k));
  const moodTest = moodKey ? moodCategoryMap[moodKey] : () => true;

  const moodFiltered = budgetFiltered.filter(item =>
    moodTest(item.category.toLowerCase(), item.name)
  );

  // Top-up: if mood filter yields < 3, fill from database using SAME mood rule
  // Never pad with wrong-category items
  let finalSuggestions = moodFiltered.slice(0, 3);
  if (finalSuggestions.length < 3) {
    const moodPool = database.filter(item =>
      moodTest(item.category.toLowerCase(), item.name) &&
      !finalSuggestions.some(f => f.name === item.name)
    );
    finalSuggestions = [...finalSuggestions, ...moodPool].slice(0, 3);
  }

  // Last resort: if still < 3 (e.g. mood + distance is very restrictive), use full distance-filtered list
  if (finalSuggestions.length < 3) {
    const pool = filtered.filter(item => !finalSuggestions.some(f => f.name === item.name));
    finalSuggestions = [...finalSuggestions, ...pool].slice(0, 3);
  }

  return finalSuggestions;
}
