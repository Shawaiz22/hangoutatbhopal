import { NextResponse } from "next/server";
import { searchPlace, getPlaceDetails, getDirections } from "@/lib/maps";
import { GeminiSuggestion, CombinedPlace, PlaceDetails } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { suggestions }: { suggestions: GeminiSuggestion[] } = body;

    if (!suggestions || !Array.isArray(suggestions)) {
      return NextResponse.json(
        { error: "Invalid parameters: suggestions array required" },
        { status: 400 }
      );
    }

    const combinedPlaces: CombinedPlace[] = [];

    for (const suggestion of suggestions) {
      try {
        // Step 1 & 2: Search place and get basic details
        const basicDetails = await searchPlace(suggestion.googleMapsQuery);
        
        let details: PlaceDetails | null = null;
        let commute = null;
        let olaLink: string | null = null;
        let googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          suggestion.name + " Bhopal"
        )}`;

        if (basicDetails) {
          // Fetch additional details (reviews, website, phone, open status)
          const additionalDetails = await getPlaceDetails(basicDetails.place_id);
          
          details = {
            ...basicDetails,
            ...additionalDetails,
          };

          // Step 3: Fetch directions if we have coordinates or address
          const destLat = details.lat || 23.2599;
          const destLng = details.lng || 77.4126;
          const destAddress = details.formatted_address || suggestion.address;
          
          commute = await getDirections(destLat, destLng, destAddress);

          // Step 4: Generate Ola booking link and Google Maps Link
          olaLink = `https://olawebsite.com/booking?pickup=23.2332,77.4272&drop=${destLat},${destLng}`;
          googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            details.formatted_address || details.name + " Bhopal"
          )}`;
        }

        combinedPlaces.push({
          suggestion,
          details,
          commute,
          olaLink,
          googleMapsLink,
        });
      } catch (placeError) {
        console.error(`Error processing place: ${suggestion.name}`, placeError);
        // Add suggestion with null details so we still show it in UI
        combinedPlaces.push({
          suggestion,
          details: null,
          commute: null,
          olaLink: null,
          googleMapsLink: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            suggestion.name + " Bhopal"
          )}`,
        });
      }
    }

    return NextResponse.json(combinedPlaces);
  } catch (error) {
    console.error("Error in places API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: 500 }
    );
  }
}
