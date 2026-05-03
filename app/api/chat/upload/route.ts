import { NextRequest, NextResponse } from 'next/server';
const DJANGO = process.env.API_URL || 'http://127.0.0.1:8000';

/**
 * POST /api/chat/upload/
 * Forwards multipart/form-data to Django's upload endpoint.
 *
 * IMPORTANT: Do NOT set Content-Type here. When you pass a FormData body,
 * the Node.js fetch implementation sets the correct multipart/form-data
 * header with the boundary automatically. Setting it manually breaks the
 * boundary and Django's multipart parser will reject the request.
 *
 * session_id arrives as a FormData field (not JSON), so Django reads it
 * from request.data (multipart) rather than request.body (JSON).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || '';
    const formData = await request.formData();

    const res = await fetch(`${DJANGO}/api/chat/upload/`, {
      method: 'POST',
      headers: { Authorization: auth },
      // No Content-Type — let fetch set multipart/form-data + boundary
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
