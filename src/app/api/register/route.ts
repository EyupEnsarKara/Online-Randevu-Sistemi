import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      email, 
      password, 
      user_type,
      // İşletme bilgileri
      businessName,
      businessDescription,
      businessAddress,
      businessPhone
    } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Ad, email ve şifre gerekli' },
        { status: 400 }
      );
    }

    // İşletme seçildiyse işletme bilgilerini kontrol et
    if (user_type === 'business') {
      if (!businessName || !businessAddress || !businessPhone) {
        return NextResponse.json(
          { success: false, message: 'İşletme bilgileri eksik' },
          { status: 400 }
        );
      }
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
    
    // Transaction başlat
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Yeni kullanıcıyı ekle
      const userResult = await db.run(
        'INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, user_type || 'customer']
      );

      // Eğer işletme ise işletme kaydı da oluştur
      if (user_type === 'business') {
        await db.run(
          'INSERT INTO businesses (user_id, name, description, address, phone) VALUES (?, ?, ?, ?, ?)',
          [userResult.lastID, businessName, businessDescription || '', businessAddress, businessPhone]
        );
      }

      // Transaction'ı commit et
      await db.run('COMMIT');

      await db.close();

      return NextResponse.json({
        success: true,
        message: user_type === 'business' ? 'İşletme başarıyla oluşturuldu' : 'Kullanıcı başarıyla oluşturuldu',
        userId: userResult.lastID
      });

    } catch (error) {
      // Hata durumunda rollback yap
      await db.run('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('Register hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 