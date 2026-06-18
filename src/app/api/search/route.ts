import { NextResponse } from "next/server";
import { searchSimilarEmails } from "@/lib/vector-search";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const results = await searchSimilarEmails(query, 5);

    return NextResponse.json({ 
      success: true, 
      results 
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
