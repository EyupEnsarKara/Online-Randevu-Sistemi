import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite.js';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    // Kullanıcıyı email ile ara
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Geçersiz şifre' },
        { status: 401 }
      );
    }

    await db.close();

    // Başarılı giriş - kullanıcı bilgilerini döndür (şifre hariç)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      user: userWithoutPassword
    });

  } catch (error: any) {
    console.error('Login hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 