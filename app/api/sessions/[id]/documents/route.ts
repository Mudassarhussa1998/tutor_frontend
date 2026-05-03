import { NextRequest, NextResponse } from 'next/server';
const DJANGO = process.env.API_URL || 'http://127.0.0.1:8000';

/**
 * GET /api/sessions/[id]/documents/
 * Lists all uploaded documents for a session.
 * Returns: id, filename, file_type, is_processed, char_count, created_at
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(`${DJANGO}/api/chat/sessions/${id}/documents/`, {
      headers: { Authorization: auth },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
