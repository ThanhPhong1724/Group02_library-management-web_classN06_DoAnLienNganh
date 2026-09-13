import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');

    if (!q || !q.trim()) {
      return NextResponse.json([]);
    }

    const searchTerm = `%${q.trim()}%`;
    const sql = getDb();

    const rows = await sql`
      SELECT
        b.id,
        b.tieu_de AS "title",
        b.tac_gia AS "author",
        COUNT(c.id)::int AS "totalCopies",
        COUNT(CASE WHEN c.trang_thai IN ('on_loan', 'reserved') THEN 1 END)::int AS "borrowedCopies",
        COUNT(CASE WHEN c.trang_thai = 'available' THEN 1 END)::int AS "availableCopies"
      FROM sach b
      LEFT JOIN ban_sao c ON b.id = c.id_sach
      WHERE LOWER(b.tieu_de) LIKE LOWER(${searchTerm})
         OR LOWER(b.tac_gia) LIKE LOWER(${searchTerm})
      GROUP BY b.id, b.tieu_de, b.tac_gia
      ORDER BY b.id ASC;
    `;

    const mapped = rows.map((r: any) => ({
      id: Number(r.id),
      title: r.title,
      author: r.author,
      totalCopies: Number(r.totalCopies),
      borrowedCopies: Number(r.borrowedCopies),
      availableCopies: Number(r.availableCopies),
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error in GET /api/books/search:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
