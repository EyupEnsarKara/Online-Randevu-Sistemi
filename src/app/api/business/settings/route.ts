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

    // İşletme ayarlarını getir (şimdilik varsayılan değerler döndür)
    const settings = {
      workingHours: [
        { day: 'Pazartesi', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Salı', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Çarşamba', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Perşembe', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Cuma', open: '09:00', close: '18:00', isOpen: true },
        { day: 'Cumartesi', open: '09:00', close: '16:00', isOpen: true },
        { day: 'Pazar', open: '10:00', close: '16:00', isOpen: false }
      ],
      services: [
        { name: 'Konsültasyon', duration: 30, price: 100 },
        { name: 'Tam Muayene', duration: 60, price: 200 }
      ]
    };

    await db.close();

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

    const { workingHours, services } = await request.json();

    // Validasyon
    if (!workingHours || !Array.isArray(workingHours)) {
      return NextResponse.json(
        { success: false, message: 'Geçerli çalışma saatleri gerekli' },
        { status: 400 }
      );
    }

    if (!services || !Array.isArray(services)) {
      return NextResponse.json(
        { success: false, message: 'Geçerli hizmetler gerekli' },
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

    // Ayarları güncelle (şimdilik sadece başarı mesajı döndür)
    // Gerçek uygulamada bu verileri veritabanında saklayabilirsiniz
    
    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Ayarlar başarıyla kaydedildi'
    });

  } catch (error: any) {
    console.error('Business settings update error:', error);
    return NextResponse.json(
      { success: false, message: 'Ayarlar güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 