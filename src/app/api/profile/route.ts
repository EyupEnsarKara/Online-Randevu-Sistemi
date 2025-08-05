import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';
import { getJwtSecretKey } from '@/lib/auth';
import { jwtVerify } from 'jose';
import bcrypt from 'bcrypt';

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

    const { name, email, currentPassword, newPassword } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Ad ve email gerekli' },
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

    // Email değişikliği varsa, yeni email'in başka kullanıcı tarafından kullanılmadığını kontrol et
    if (email !== userEmail) {
      const existingUser = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, user.id]);
      if (existingUser) {
        await db.close();
        return NextResponse.json(
          { success: false, message: 'Bu email zaten kullanımda' },
          { status: 409 }
        );
      }
    }

    // Şifre değişikliği varsa, mevcut şifreyi doğrula
    if (newPassword) {
      if (!currentPassword) {
        await db.close();
        return NextResponse.json(
          { success: false, message: 'Mevcut şifre gerekli' },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        await db.close();
        return NextResponse.json(
          { success: false, message: 'Mevcut şifre yanlış' },
          { status: 400 }
        );
      }
    }

    // Kullanıcı bilgilerini güncelle
    let updateQuery = 'UPDATE users SET name = ?, email = ?';
    let updateParams = [name, email];

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateQuery += ', password = ?';
      updateParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(user.id);

    await db.run(updateQuery, updateParams);

    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Profil başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Profil güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 