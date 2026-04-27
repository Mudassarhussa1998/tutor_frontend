import { NextRequest, NextResponse } from 'next/server';

// Weather is fetched directly from wttr.in by Next.js server
// (Django server may not have internet access)
export async function GET(request: NextRequest) {
  const city = new URL(request.url).searchParams.get('city') || 'London';
  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`wttr.in returned ${res.status}`);
    const data = await res.json();
    const temp = data.current_condition[0].temp_C;
    const desc = data.current_condition[0].weatherDesc[0].value;
    return NextResponse.json({ city, temp, desc });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
