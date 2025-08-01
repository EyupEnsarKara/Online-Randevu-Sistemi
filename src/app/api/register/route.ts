import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite.js';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, user_type } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Ad, email ve şifre gerekli' },
        { status: 400 }
      );
    }

    const db = await openDb();
    
    // Email zaten kullanımda mı kontrol et
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Bu email zaten kullanımda' },
        { status: 409 }
      );
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Yeni kullanıcıyı ekle
    const result = await db.run(
      'INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, user_type || 'customer']
    );

    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      userId: result.lastID
    });

  } catch (error: any) {
    console.error('Register hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 