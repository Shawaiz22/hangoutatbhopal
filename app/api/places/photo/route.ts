import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!reference) {
    return NextResponse.json({ error: "Missing photo reference" }, { status: 400 });
  }

  // Fallback to Unsplash images if no Google Maps API key is configured
  if (!apiKey || apiKey === "your_google_maps_api_key_here") {
    // Generate a semi-stable Unsplash image based on reference hash
    const hash = reference.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const keywords = ["cafe", "lake", "palace", "park", "food", "city"];
    const keyword = keywords[hash % keywords.length];
    return NextResponse.redirect(
      `https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800`
    );
  }

  try {
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${reference}&key=${apiKey}`;
    const res = await fetch(photoUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch photo from Google API: ${res.statusText}`);
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set("Content-Type", blob.type || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=86400"); // Cache image for 24 hours

    return new Response(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error proxying Google photo:", error);
    return NextResponse.redirect(
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800"
    );
  }
}
