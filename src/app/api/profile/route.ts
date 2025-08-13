import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';
import { getJwtSecretKey } from '@/lib/auth';
import { jwtVerify } from 'jose';
import bcrypt from 'bcrypt';

// Kullanıcı profil bilgilerini getir
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
    
    // Kullanıcıyı bul
    const user = await db.get(`
      SELECT 
        id,
        name,
        email,
        user_type,
        created_at
      FROM users 
      WHERE email = ?
    `, [userEmail]);

    await db.close();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Şifre bilgisini çıkar
    delete user.password;

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Profil bilgileri yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Kullanıcı profil bilgilerini güncelle
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

    const { name, currentPassword, newPassword } = await request.json();

    // Validasyon
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Ad alanı gerekli' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    // Kullanıcıyı bul
    const user = await db.get('SELECT id, password FROM users WHERE email = ?', [userEmail]);
    if (!user) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Şifre değişikliği varsa mevcut şifreyi kontrol et
    if (newPassword) {
      if (!currentPassword) {
        await db.close();
        return NextResponse.json(
          { success: false, message: 'Mevcut şifre gerekli' },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        await db.close();
        return NextResponse.json(
          { success: false, message: 'Mevcut şifre yanlış' },
          { status: 400 }
        );
      }

      // Yeni şifreyi hash'le
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Ad ve şifreyi güncelle
      await db.run(`
        UPDATE users 
        SET name = ?, password = ?
        WHERE id = ?
      `, [name, hashedNewPassword, user.id]);
    } else {
      // Sadece adı güncelle
      await db.run(`
        UPDATE users 
        SET name = ?
        WHERE id = ?
      `, [name, user.id]);
    }

    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Profil bilgileri başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Profil bilgileri güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 