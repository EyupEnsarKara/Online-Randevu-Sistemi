import { NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

export async function GET() {
  try {
    const db = await openDb();
    
    // Tüm işletmeleri getir
    const businesses = await db.all(`
      SELECT 
        b.id,
        b.name,
        b.description,
        b.address,
        b.phone,
        u.name as owner_name
      FROM businesses b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.name
    `);
    
    await db.close();

    return NextResponse.json({
      success: true,
      businesses: businesses
    });

  } catch (error: any) {
    console.error('Businesses API hatası:', error);
    return NextResponse.json(
      { success: false, message: 'İşletmeler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 