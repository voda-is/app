import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_BASE_URL;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  throw new Error('ADMIN_TOKEN environment variable is not set');
}

async function getAccessToken(user_id: string): Promise<string> {
  const response = await fetch(`${API_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify(user_id),
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, method, data } = body.data;

    let authHeader = {};
    if (!data.ignoreToken) {
      // Get access token first
      const accessToken = await getAccessToken(data.user_id);
      authHeader = {
        'Authorization': `Bearer ${accessToken}`,
      };

      if (data.stripUserId) {
        delete data.user_id;
      }
    }

    delete data.ignoreToken;
    delete data.stripUserId;

    // Make the actual API request with the access token
    const response = await fetch(`${API_URL}${path}`, {
      method: method,
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      ...(method === 'GET' 
        ? { params: new URLSearchParams(data).toString() }
        : { body: JSON.stringify(data) }
      ),
    });

    const responseData = await response.json();
    console.log(responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Internal Server Error',
        data: null 
      },
      { status: 500 }
    );
  }
}
