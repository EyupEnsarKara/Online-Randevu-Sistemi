import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';
import { getJwtSecretKey } from '@/lib/auth';
import { jwtVerify } from 'jose';

// İşletme bilgilerini getir
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

    // İşletme bilgilerini getir
    const business = await db.get(`
      SELECT id, name, description, address, phone
      FROM businesses 
      WHERE user_id = ?
    `, [user.id]);

    await db.close();

    if (!business) {
      return NextResponse.json(
        { success: false, message: 'İşletme bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      business: business
    });

  } catch (error: any) {
    console.error('Business profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'İşletme bilgileri yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// İşletme bilgilerini güncelle
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

    const { name, description, address, phone } = await request.json();

    // Validasyon
    if (!name || !address || !phone) {
      return NextResponse.json(
        { success: false, message: 'İşletme adı, adres ve telefon gerekli' },
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

    // İşletme bilgilerini güncelle
    const result = await db.run(`
      UPDATE businesses 
      SET name = ?, description = ?, address = ?, phone = ?
      WHERE user_id = ?
    `, [name, description || '', address, phone, user.id]);

    await db.close();

    if (result.changes === 0) {
      return NextResponse.json(
        { success: false, message: 'İşletme bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'İşletme bilgileri başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('Business profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'İşletme bilgileri güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 