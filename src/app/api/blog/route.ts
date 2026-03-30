import { NextRequest, NextResponse } from "next/server";

// Get API URL - use API_URL for server-side, NEXT_PUBLIC_API_URL for fallback
const getApiUrl = () => {
  // Server-side environment variable (no NEXT_PUBLIC prefix)
  // This should be set in Vercel environment variables
  if (process.env.API_URL) {
    return process.env.API_URL;
  }
  // Fallback for client-side or development
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Local development fallback
  return "http://localhost:3001";
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const apiUrl = getApiUrl();

    let url = `${apiUrl}/api/blog`;
    if (featured) {
      url += `?featured=${featured}`;
    }

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Blog API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { success: false, error: "Failed to fetch blogs", data: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Blog API proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/blog`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Blog POST error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { success: false, error: "Failed to create blog" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Blog API proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}