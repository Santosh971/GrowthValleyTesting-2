import { NextRequest, NextResponse } from "next/server";

// Proxy to backend API server for individual blog posts
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

    const response = await fetch(`${apiUrl}/api/blog/${slug}`, {
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache control for better performance
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Blog API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { success: false, error: "Blog post not found", data: null },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Blog slug API proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog post", data: null },
      { status: 500 }
    );
  }
}