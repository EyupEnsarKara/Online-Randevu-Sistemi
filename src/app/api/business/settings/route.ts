import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';
import { getJwtSecretKey } from '@/lib/auth';
import { jwtVerify } from 'jose';

// İşletme ayarlarını getir
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // JWT token'ı doğrula
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    const userEmail = payload.email as string;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz token' },
        { status: 401 }
      );
    }

    const db = await openDb();

    // Kullanıcıyı bul
    const user = await db.get('SELECT id, user_type FROM users WHERE email = ?', [userEmail]);
    if (!user) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Sadece işletme kullanıcıları erişebilir
    if (user.user_type !== 'business') {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Bu sayfaya erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // İşletmeyi bul
    const business = await db.get('SELECT id FROM businesses WHERE user_id = ?', [user.id]);
    if (!business) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'İşletme bulunamadı' },
        { status: 404 }
      );
    }

    // Çalışma saatlerini veritabanından getir
    const businessHours = await db.all(`
      SELECT 
        day_of_week,
        open_time,
        close_time,
        is_working_day,
        slot_duration
      FROM business_hours 
      WHERE business_id = ?
      ORDER BY day_of_week
    `, [business.id]);

    await db.close();

    // Eğer hiç çalışma saati tanımlanmamışsa varsayılan değerleri kullan
    let workingHours;
    if (businessHours.length === 0) {
      workingHours = [
        { day: 'Pazartesi', open: '09:00', close: '18:00', isOpen: true, slotDuration: 30 },
        { day: 'Salı', open: '09:00', close: '18:00', isOpen: true, slotDuration: 30 },
        { day: 'Çarşamba', open: '09:00', close: '18:00', isOpen: true, slotDuration: 30 },
        { day: 'Perşembe', open: '09:00', close: '18:00', isOpen: true, slotDuration: 30 },
        { day: 'Cuma', open: '09:00', close: '18:00', isOpen: true, slotDuration: 30 },
        { day: 'Cumartesi', open: '09:00', close: '16:00', isOpen: true, slotDuration: 30 },
        { day: 'Pazar', open: '10:00', close: '16:00', isOpen: false, slotDuration: 30 }
      ];
    } else {
      // Veritabanından gelen verileri frontend formatına çevir
      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      workingHours = businessHours.map(hour => ({
        day: dayNames[hour.day_of_week],
        open: hour.open_time,
        close: hour.close_time,
        isOpen: hour.is_working_day === 1,
        slotDuration: hour.slot_duration || 30
      }));
    }

    const settings = {
      workingHours: workingHours
    };

    return NextResponse.json({
      success: true,
      settings: settings
    });

  } catch (error: any) {
    console.error('Business settings fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Ayarlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// İşletme ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // JWT token'ı doğrula
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    const userEmail = payload.email as string;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz token' },
        { status: 401 }
      );
    }

    const { workingHours } = await request.json();

    // Validasyon
    if (!workingHours || !Array.isArray(workingHours)) {
      return NextResponse.json(
        { success: false, message: 'Geçerli çalışma saatleri gerekli' },
        { status: 400 }
      );
    }

    const db = await openDb();

    // Kullanıcıyı bul
    const user = await db.get('SELECT id, user_type FROM users WHERE email = ?', [userEmail]);
    if (!user) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Sadece işletme kullanıcıları erişebilir
    if (user.user_type !== 'business') {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Bu işlemi gerçekleştirme yetkiniz yok' },
        { status: 403 }
      );
    }

    // İşletmeyi bul
    const business = await db.get('SELECT id FROM businesses WHERE user_id = ?', [user.id]);
    if (!business) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'İşletme bulunamadı' },
        { status: 404 }
      );
    }

    // Mevcut çalışma saatlerini sil
    await db.run('DELETE FROM business_hours WHERE business_id = ?', [business.id]);

    // Yeni çalışma saatlerini ekle
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    
    for (const hour of workingHours) {
      if (hour.isOpen) {
        const dayOfWeek = dayNames.indexOf(hour.day);
        if (dayOfWeek !== -1) {
          await db.run(`
            INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_working_day, slot_duration)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [business.id, dayOfWeek, hour.open, hour.close, 1, hour.slotDuration || 30]);
        }
      }
    }

    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Çalışma saatleri başarıyla kaydedildi'
    });

  } catch (error: any) {
    console.error('Business settings update error:', error);
    return NextResponse.json(
      { success: false, message: 'Ayarlar güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 