import { NextRequest, NextResponse } from "next/server";

// Proxy to backend API server for individual case studies
const getApiUrl = () => {
  // Server-side: use API_URL (no NEXT_PUBLIC prefix)
  // Fallback to localhost for development
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/case-studies/${slug}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Case study API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { success: false, error: "Case study not found", data: null },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Case study slug API proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch case study", data: null },
      { status: 500 }
    );
  }
}