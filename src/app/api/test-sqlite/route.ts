import { NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = await openDb();
    await db.close();
    return NextResponse.json({ success: true, message: 'SQLite bağlantısı başarılı!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Bağlantı hatası', error: err.message });
  }
}