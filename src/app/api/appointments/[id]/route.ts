import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';
import { getJwtSecretKey } from '@/lib/auth';
import { jwtVerify } from 'jose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: appointmentId } = await params;

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: 'Randevu ID gerekli' },
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

    let appointment;

    if (user.user_type === 'customer') {
      // Müşteri ise kendi randevusunu getir
      appointment = await db.get(`
        SELECT 
          a.id,
          a.date,
          a.time,
          a.status,
          a.notes,
          a.created_at,
          b.name as business_name,
          b.address as business_address,
          b.phone as business_phone
        FROM appointments a
        JOIN businesses b ON a.business_id = b.id
        WHERE a.id = ? AND a.customer_id = ?
      `, [appointmentId, user.id]);
    } else {
      // İşletme ise kendi işletmesine gelen randevuyu getir
      const business = await db.get('SELECT id FROM businesses WHERE user_id = ?', [user.id]);
      if (!business) {
        await db.close();
        return NextResponse.json(
          { success: false, message: 'İşletme bulunamadı' },
          { status: 404 }
        );
      }

      appointment = await db.get(`
        SELECT 
          a.id,
          a.date,
          a.time,
          a.status,
          a.notes,
          a.created_at,
          u.name as customer_name,
          u.email as customer_email
        FROM appointments a
        JOIN users u ON a.customer_id = u.id
        WHERE a.id = ? AND a.business_id = ?
      `, [appointmentId, business.id]);
    }

    await db.close();

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Randevu bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: appointment
    });

  } catch (error: any) {
    console.error('Appointment fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Randevu yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Randevu durumunu güncelle (işletme sahipleri için) veya randevuyu iptal et (müşteriler için)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: appointmentId } = await params;
    const { status } = await request.json();

    if (!appointmentId || !status) {
      return NextResponse.json(
        { success: false, message: 'Randevu ID ve durum gerekli' },
        { status: 400 }
      );
    }

    // Geçerli durumlar - veritabanı şemasına uygun
    const validStatuses = ['pending', 'approved', 'denied', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz durum' },
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

    // İşletme sahipleri randevu durumunu güncelleyebilir, müşteriler sadece iptal edebilir
    if (user.user_type === 'business') {
      // İşletme sahibi işlemleri
      const business = await db.get('SELECT id FROM businesses WHERE user_id = ?', [user.id]);
      if (!business) {
        await db.close();
        return NextResponse.json(
          { success: false, message: 'İşletme bulunamadı' },
          { status: 404 }
        );
      }

      // Randevuyu bul ve güncelle
      const result = await db.run(`
        UPDATE appointments 
        SET status = ? 
        WHERE id = ? AND business_id = ?
      `, [status, appointmentId, business.id]);

      await db.close();

      if (result.changes === 0) {
        return NextResponse.json(
          { success: false, message: 'Randevu bulunamadı veya güncellenemedi' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Randevu durumu başarıyla güncellendi'
      });
    } else {
      // Müşteri işlemleri - sadece iptal edebilir
      if (status !== 'cancelled') {
        await db.close();
        return NextResponse.json(
          { success: false, message: 'Müşteriler sadece randevularını iptal edebilir' },
          { status: 403 }
        );
      }

      // Randevuyu bul ve iptal et
      const result = await db.run(`
        UPDATE appointments 
        SET status = 'cancelled' 
        WHERE id = ? AND customer_id = ?
      `, [appointmentId, user.id]);

      await db.close();

      if (result.changes === 0) {
        return NextResponse.json(
          { success: false, message: 'Randevu bulunamadı veya iptal edilemedi' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Randevu başarıyla iptal edildi'
      });
    }

  } catch (error: any) {
    console.error('Appointment update error:', error);
    return NextResponse.json(
      { success: false, message: 'Randevu güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 