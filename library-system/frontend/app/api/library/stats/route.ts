import { NextResponse } from 'next/server';
import { getDb } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();

    const rows = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM sach) AS "totalTitles",
        (SELECT COUNT(*)::int FROM ban_sao) AS "totalCopies",
        (SELECT COUNT(*)::int FROM ban_sao WHERE trang_thai IN ('on_loan', 'reserved')) AS "borrowedCopies",
        (SELECT COUNT(*)::int FROM ban_sao WHERE trang_thai = 'available') AS "availableCopies";
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        totalTitles: 0,
        totalCopies: 0,
        borrowedCopies: 0,
        availableCopies: 0
      });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Error in GET /api/library/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
