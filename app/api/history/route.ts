import { NextResponse } from 'next/server';

const DJANGO = process.env.API_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${DJANGO}/api/history/`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
