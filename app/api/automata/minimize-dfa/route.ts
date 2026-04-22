import { NextRequest, NextResponse } from 'next/server';

const DJANGO = process.env.API_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || '';
    const body = await request.json();
    const res = await fetch(`${DJANGO}/api/automata/minimize-dfa/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
