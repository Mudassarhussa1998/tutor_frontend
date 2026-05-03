import { NextRequest, NextResponse } from 'next/server';
const DJANGO = process.env.API_URL || 'http://127.0.0.1:8000';

/**
 * DELETE /api/documents/[id]/delete/
 * Removes the UploadedDocument record from DB and deletes all its
 * vector chunks from ChromaDB atomically.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(`${DJANGO}/api/chat/documents/${id}/delete/`, {
      method: 'DELETE',
      headers: { Authorization: auth },
    });
    // Django returns 204 No Content on success
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
