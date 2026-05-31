import { NextResponse } from "next/server";
import { getPlaceDetails } from "@/lib/maps";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json(
        { error: "Missing required parameter: placeId" },
        { status: 400 }
      );
    }

    const details = await getPlaceDetails(placeId);
    
    if (!details) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    return NextResponse.json(details.reviews || []);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
