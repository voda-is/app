import { createAuthToken } from "@/lib/authToken";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_BASE_URL;
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, method, data } = body.data;

    let authHeader = {};
    if (!data.ignoreToken) {
      const accessToken = createAuthToken(data.user_id);
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

    // Make the actual API request with the access token
    let response;
    if (method === "GET") {
      const requestUrl = `${API_URL}${path}?${new URLSearchParams(data).toString()}`;
      response = await fetch(requestUrl, {
        method: method,
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      });
    } else {
      response = await fetch(`${API_URL}${path}`, {
        method: method,
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }

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
