import { NextRequest, NextResponse } from 'next/server';
const DJANGO = process.env.API_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(`${DJANGO}/api/chat/sessions/${id}/`, {
      headers: { Authorization: auth },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = request.headers.get('authorization') || '';
    const body = await request.json();
    const res = await fetch(`${DJANGO}/api/chat/sessions/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(`${DJANGO}/api/chat/sessions/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: auth },
    });
    return new NextResponse(null, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
