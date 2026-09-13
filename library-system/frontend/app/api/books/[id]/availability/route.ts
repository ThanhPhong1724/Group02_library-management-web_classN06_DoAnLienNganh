import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const sql = getDb();

    const rows = await sql`
      SELECT
        b.id,
        b.tieu_de AS "title",
        COUNT(c.id)::int AS "totalCopies",
        COUNT(CASE WHEN c.trang_thai IN ('on_loan', 'reserved') THEN 1 END)::int AS "borrowedCopies",
        COUNT(CASE WHEN c.trang_thai = 'available' THEN 1 END)::int AS "availableCopies"
      FROM sach b
      LEFT JOIN ban_sao c ON b.id = c.id_sach
      WHERE b.id = ${bookId}
      GROUP BY b.id, b.tieu_de;
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    const b = rows[0];
    return NextResponse.json({
      id: Number(b.id),
      title: b.title,
      totalCopies: Number(b.totalCopies),
      borrowedCopies: Number(b.borrowedCopies),
      availableCopies: Number(b.availableCopies),
    });
  } catch (error: any) {
    console.error('Error in GET /api/books/[id]/availability:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
