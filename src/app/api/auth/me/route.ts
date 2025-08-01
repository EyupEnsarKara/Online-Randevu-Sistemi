import { NextRequest, NextResponse } from 'next/server';
import { getJwtSecretKey } from '@/lib/auth';
import { jwtVerify } from 'jose';
import { openDb } from '@/lib/sqlite';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // JWT token'ı doğrula
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    const email = payload.email as string;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Kullanıcı bilgilerini veritabanından al
    const db = await openDb();
    const user = await db.get('SELECT id, name, email, user_type FROM users WHERE email = ?', [email]);
    await db.close();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type || 'customer' // Varsayılan olarak customer
      }
    });

  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, message: 'Token doğrulama hatası' },
      { status: 401 }
    );
  }
} 