import { PlaceDetails, CommuteDetails, CommuteOption, GoogleReview } from "@/types";

const getMapsApiKey = () => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || key === "your_google_maps_api_key_here") {
    return null;
  }
  return key;
};

// 1. Text Search to get place_id and basic info
export async function searchPlace(query: string): Promise<PlaceDetails | null> {
  const apiKey = getMapsApiKey();
  if (!apiKey) {
    console.warn(`GOOGLE_MAPS_API_KEY is not set. Generating mock PlaceDetails for query: ${query}`);
    return getMockPlaceDetails(query);
  }

  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    const res = await fetch(searchUrl);
    if (!res.ok) throw new Error(`Places Search failed: ${res.statusText}`);
    const data = await res.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.warn(`No search results found for query: ${query}. Status: ${data.status}`);
      return null;
    }

    const firstResult = data.results[0];
    const placeId = firstResult.place_id;
    const geometry = firstResult.geometry?.location || { lat: 23.2599, lng: 77.4126 };

    const placeDetails: PlaceDetails = {
      place_id: placeId,
      name: firstResult.name,
      rating: firstResult.rating,
      user_ratings_total: firstResult.user_ratings_total,
      formatted_address: firstResult.formatted_address,
      photos: firstResult.photos ? firstResult.photos.map((p: any) => ({
        photo_reference: p.photo_reference,
        height: p.height,
        width: p.width,
      })) : undefined,
      open_now: firstResult.opening_hours?.open_now,
      lat: geometry.lat,
      lng: geometry.lng,
    };

    return placeDetails;
  } catch (error) {
    console.error(`Error searching place for query "${query}":`, error);
    return getMockPlaceDetails(query);
  }
}

// 2. Place Details to get reviews, phone, website, opening hours
export async function getPlaceDetails(placeId: string): Promise<Partial<PlaceDetails> | null> {
  const apiKey = getMapsApiKey();
  if (!apiKey) {
    // Already mocked in searchPlace if key is missing, return empty or mocked details
    return {};
  }

  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,formatted_phone_number,website,opening_hours&key=${apiKey}`;

    const res = await fetch(detailsUrl);
    if (!res.ok) throw new Error(`Place Details failed: ${res.statusText}`);
    const data = await res.json();

    if (data.status !== "OK" || !data.result) {
      console.warn(`No details found for placeId: ${placeId}. Status: ${data.status}`);
      return null;
    }

    const result = data.result;
    const details: Partial<PlaceDetails> = {
      formatted_phone_number: result.formatted_phone_number,
      website: result.website,
      open_now: result.opening_hours?.open_now,
      reviews: result.reviews ? result.reviews.map((r: any) => ({
        author_name: r.author_name,
        rating: r.rating,
        text: r.text,
        relative_time_description: r.relative_time_description,
      })) : [],
    };

    return details;
  } catch (error) {
    console.error(`Error getting place details for ID "${placeId}":`, error);
    return {};
  }
}

// 3. Directions from city center (23.2332, 77.4272) to destination
export async function getDirections(
  destLat: number,
  destLng: number,
  destAddress: string
): Promise<CommuteDetails | null> {
  const apiKey = getMapsApiKey();
  const origin = "23.2332,77.4272"; // Bhopal City Center (Rajiv Gandhi Square / New Market)

  if (!apiKey) {
    return getMockDirections(destLat, destLng);
  }

  try {
    const modes: ("driving" | "walking" | "transit")[] = ["driving", "walking", "transit"];
    const commute: Partial<CommuteDetails> = {};

    for (const mode of modes) {
      const destQuery = destLat && destLng ? `${destLat},${destLng}` : destAddress;
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${encodeURIComponent(
        destQuery
      )}&mode=${mode}&key=${apiKey}`;

      const res = await fetch(directionsUrl);
      if (!res.ok) {
        console.error(`Directions failed for mode ${mode}: ${res.statusText}`);
        continue;
      }
      const data = await res.json();

      if (data.status === "OK" && data.routes && data.routes.length > 0) {
        const leg = data.routes[0].legs[0];
        const option: CommuteOption = {
          duration: leg.duration.text,
          distance: leg.distance.text,
          summary: data.routes[0].summary || "via Main Road",
        };

        if (mode === "driving") commute.driving = option;
        if (mode === "walking") commute.walking = option;
        if (mode === "transit") commute.transit = option;
      } else {
        // Transit might not be available, which is common. We will handle fallback for transit
        if (mode === "transit") {
          commute.transit = undefined;
        }
      }
    }

    // Fallbacks if driving/walking failed to fetch but API was called
    if (!commute.driving) {
      commute.driving = { duration: "15 mins", distance: "5.0 km", summary: "via Link Road 1" };
    }
    if (!commute.walking) {
      commute.walking = { duration: "1 hr 10 mins", distance: "4.8 km", summary: "via Link Road 1" };
    }

    return commute as CommuteDetails;
  } catch (error) {
    console.error("Error getting directions:", error);
    return getMockDirections(destLat, destLng);
  }
}

// Helper Mock Data Generators
function getMockPlaceDetails(query: string): PlaceDetails {
  const cleanQuery = query.toLowerCase();

  let name = query.replace(" Bhopal", "");
  let rating = 4.4;
  let ratingsCount = 1250;
  let address = "New Market, TT Nagar, Bhopal, Madhya Pradesh 462003";
  let phone = "+91 755 255 1234";
  let website = "https://bhopaltourism.mp.gov.in";
  let lat = 23.2332;
  let lng = 77.4272;

  const reviews: GoogleReview[] = [
    {
      author_name: "Amit Sharma",
      rating: 5,
      text: "Absolutely stunning spot. Visited with my family on a weekend. Highly recommended for anyone visiting Bhopal!",
      relative_time_description: "2 weeks ago",
    },
    {
      author_name: "Pooja Patel",
      rating: 4,
      text: "Lovely ambiance and delicious local flavors. The service was a bit slow due to rush hours, but the overall vibe is great.",
      relative_time_description: "3 days ago",
    },
    {
      author_name: "Rahul Verma",
      rating: 4,
      text: "A must-visit spot in Bhopal. Clean environment, nice views, and budget-friendly. Great place to hang out with friends.",
      relative_time_description: "1 month ago",
    },
  ];

  if (cleanQuery.includes("chatori")) {
    name = "Chatori Gali";
    rating = 4.5;
    ratingsCount = 3890;
    address = "Chatori Gali, Ibrahimpura, Peer Gate Area, Bhopal, Madhya Pradesh 462001";
    lat = 23.2599;
    lng = 77.4126;
    phone = "+91 98270 12345";
    website = "https://www.mptourism.com";
  } else if (cleanQuery.includes("retreat") || cleanQuery.includes("jehan")) {
    name = "Jehan Numa Retreat";
    rating = 4.7;
    ratingsCount = 1420;
    address = "Near Van Vihar National Park, Prempura, Bhopal, Madhya Pradesh 462002";
    lat = 23.2255;
    lng = 77.3685;
    phone = "+91 755 423 5100";
    website = "https://www.jehannuma.com/retreat/";
  } else if (cleanQuery.includes("db city") || cleanQuery.includes("mall")) {
    name = "DB City Mall";
    rating = 4.4;
    ratingsCount = 42800;
    address = "DB City Mall, Arera Hills, Bhopal, Madhya Pradesh 462011";
    lat = 23.2325;
    lng = 77.4308;
    phone = "+91 755 664 4000";
    website = "http://www.dbcitymall.com";
  } else if (cleanQuery.includes("tekri") || cleanQuery.includes("manua")) {
    name = "Manuabhan Tekri";
    rating = 4.6;
    ratingsCount = 5890;
    address = "Lalghati, Bhopal, Madhya Pradesh 462038";
    lat = 23.2842;
    lng = 77.3752;
    phone = "+91 755 274 0100";
    website = "https://www.mptourism.com";
  } else if (cleanQuery.includes("waves") || cleanQuery.includes("boat club")) {
    name = "Wind & Waves";
    rating = 4.3;
    ratingsCount = 2890;
    address = "Near Boat Club, Shamla Hills, Bhopal, Madhya Pradesh 462013";
    lat = 23.2425;
    lng = 77.3878;
    phone = "+91 755 266 1530";
    website = "https://www.mpstdc.com";
  } else if (cleanQuery.includes("sapata") || cleanQuery.includes("sair")) {
    name = "Sair Sapata";
    rating = 4.2;
    ratingsCount = 7450;
    address = "Bhadbhada Road, Prempura, Bhopal, Madhya Pradesh 462003";
    lat = 23.2104;
    lng = 77.3698;
    phone = "+91 755 242 4000";
    website = "http://www.sairsapatabhopal.co.in";
  }

  return {
    place_id: `mock_place_id_${Math.random().toString(36).substr(2, 9)}`,
    name,
    rating,
    user_ratings_total: ratingsCount,
    formatted_address: address,
    photos: undefined, // Will fallback to gradient in UI
    reviews,
    formatted_phone_number: phone,
    website,
    open_now: true,
    lat,
    lng,
  };
}

function getMockDirections(destLat?: number, destLng?: number): CommuteDetails {
  // Bhopal city center to target coordinates estimation
  let durationMinutes = 15;
  let distanceKm = 4.5;

  if (destLat && destLng) {
    const latDiff = Math.abs(destLat - 23.2332);
    const lngDiff = Math.abs(destLng - 77.4272);
    const totalDiff = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    
    // Estimate: 1 degree ≈ 111km
    distanceKm = Math.max(1.2, Math.round(totalDiff * 111 * 10) / 10);
    // Driving speed avg 25km/h in city
    durationMinutes = Math.max(5, Math.round((distanceKm / 25) * 60));
  }

  const walkingMinutes = Math.round(distanceKm * 12);
  const transitMinutes = Math.round(durationMinutes * 1.5);

  return {
    driving: {
      duration: `${durationMinutes} mins`,
      distance: `${distanceKm} km`,
      summary: "via Link Road 1 / Hamidia Road",
    },
    walking: {
      duration: walkingMinutes > 60 
        ? `${Math.floor(walkingMinutes / 60)} hr ${walkingMinutes % 60} mins`
        : `${walkingMinutes} mins`,
      distance: `${distanceKm} km`,
      summary: "via Pedestrian Paths",
    },
    transit: distanceKm > 3 ? {
      duration: `${transitMinutes} mins`,
      distance: `${distanceKm} km`,
      summary: "BCLL Bus Route 204 / TR-4",
    } : undefined,
  };
}
