import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

// İşletme çalışma saatlerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({
        success: false,
        message: 'İşletme ID gerekli'
      }, { status: 400 });
    }

    const db = await openDb();
    
    // Çalışma saatlerini getir
    const hours = await db.all(`
      SELECT * FROM business_hours 
      WHERE business_id = ? 
      ORDER BY day_of_week, open_time
    `, [businessId]);

    await db.close();

    return NextResponse.json({
      success: true,
      business_hours: hours
    });

  } catch (error: any) {
    console.error('Business hours error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Çalışma saatleri alınırken hata oluştu',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// İşletme çalışma saatlerini güncelle/oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, hours } = body;

    if (!business_id || !hours || !Array.isArray(hours)) {
      return NextResponse.json({
        success: false,
        message: 'Geçersiz veri formatı'
      }, { status: 400 });
    }

    const db = await openDb();

    // Mevcut çalışma saatlerini sil
    await db.run('DELETE FROM business_hours WHERE business_id = ?', [business_id]);

    // Yeni çalışma saatlerini ekle
    for (const hour of hours) {
      if (hour.is_working_day) {
        await db.run(`
          INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_working_day)
          VALUES (?, ?, ?, ?, ?)
        `, [business_id, hour.day_of_week, hour.open_time, hour.close_time, hour.is_working_day]);
      }
    }

    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Çalışma saatleri güncellendi'
    });

  } catch (error: any) {
    console.error('Update business hours error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Çalışma saatleri güncellenirken hata oluştu',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
