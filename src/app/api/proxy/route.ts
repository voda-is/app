import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  throw new Error("ADMIN_TOKEN environment variable is not set");
}

async function getAccessToken(user_id: string): Promise<string> {
  const response = await fetch(`${API_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify(user_id),
  });

  if (!response.ok) {
    throw new Error("Failed to get access token");
  }

  const data = await response.json();
  return data.data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, method, data } = body.data;

    console.log("path", path);
    console.log("method", method);
    console.log("data", data);

    let authHeader = {};
    if (!data.ignoreToken) {
      const accessToken = await getAccessToken(data.user_id);
      authHeader = {
        Authorization: `Bearer ${accessToken}`,
      };

      if (data.stripUserId) {
        delete data.user_id;
      }
    }

    const isStream = data.isStream;

    delete data.ignoreToken;
    delete data.stripUserId;
    delete data.isStream;

    console.log("sending", JSON.stringify(data));
    // Make the actual API request with the access token
    const response = await fetch(`${API_URL}${path}`, {
      method: method,
      headers: {
        ...authHeader,
        ...(method !== "GET" && { "Content-Type": "application/json" }),
      },
      ...(method === "GET"
        ? {
            url: `${API_URL}${path}?${new URLSearchParams(data).toString()}`,
          }
        : { body: JSON.stringify(data) }),
    });

    if (isStream) {
      if (!response.body) {
        throw new Error("No response body");
      }

      const contentType = response.headers.get("content-type");
      const arrayBuffer = await response.arrayBuffer();
      // Return raw binary data
      return new Response(arrayBuffer, {
        headers: {
          "Content-Type": contentType || "audio/mp3",
          "Content-Length": arrayBuffer.byteLength.toString(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Content-Transfer-Encoding": "binary",
          "x-content-type-options": "nosniff",
        },
      });
    } else {
      // Handle as a regular JSON response
      const responseData = await response.json();
      return NextResponse.json(responseData);
    }
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error",
        data: null,
      },
      { status: 500 }
    );
  }
}
