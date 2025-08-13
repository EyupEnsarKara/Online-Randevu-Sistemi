import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';
import { getJwtSecretKey } from '@/lib/auth';
import { jwtVerify } from 'jose';

// İşletme profil bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, getJwtSecretKey());
    const userEmail = payload.email as string;

    const db = await openDb();
    
    // Kullanıcıyı ve işletmeyi bul
    const user = await db.get('SELECT id, user_type FROM users WHERE email = ?', [userEmail]);
    if (!user || user.user_type !== 'business') {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'İşletme hesabı bulunamadı' },
        { status: 403 }
      );
    }

    const business = await db.get(`
      SELECT 
        b.id,
        b.name,
        b.description,
        b.address,
        b.phone,
        u.name as owner_name,
        u.email as owner_email
      FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = ?
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

// İşletme profil bilgilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, getJwtSecretKey());
    const userEmail = payload.email as string;

    const { name, description, address, phone } = await request.json();

    // Validasyon
    if (!name || !address || !phone) {
      return NextResponse.json(
        { success: false, message: 'İşletme adı, adres ve telefon gerekli' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    // Kullanıcıyı ve işletmeyi bul
    const user = await db.get('SELECT id, user_type FROM users WHERE email = ?', [userEmail]);
    if (!user || user.user_type !== 'business') {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'İşletme hesabı bulunamadı' },
        { status: 403 }
      );
    }

    const business = await db.get('SELECT id FROM businesses WHERE user_id = ?', [user.id]);
    if (!business) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'İşletme bulunamadı' },
        { status: 404 }
      );
    }

    // İşletme bilgilerini güncelle
    await db.run(`
      UPDATE businesses 
      SET name = ?, description = ?, address = ?, phone = ?
      WHERE id = ?
    `, [name, description || '', address, phone, business.id]);

    await db.close();

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