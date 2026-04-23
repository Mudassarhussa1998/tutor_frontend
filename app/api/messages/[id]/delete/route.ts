import { NextRequest, NextResponse } from 'next/server';
const DJANGO = process.env.API_URL || 'http://127.0.0.1:8000';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(`${DJANGO}/api/chat/messages/${id}/delete/`, {
      method: 'DELETE',
      headers: { Authorization: auth },
    });
    return new NextResponse(null, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
