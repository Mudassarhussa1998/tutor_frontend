import { NextResponse, NextRequest } from 'next/server';
const DJANGO = process.env.API_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(`${DJANGO}/api/chat/history/`, {
      headers: { Authorization: auth },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
