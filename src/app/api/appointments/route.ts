import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';
import { getJwtSecretKey } from '@/lib/auth';
import { jwtVerify } from 'jose';

export async function POST(request: NextRequest) {
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

    const { business_id, date, time, notes } = await request.json();

    // Validasyon
    if (!business_id || !date || !time) {
      return NextResponse.json(
        { success: false, message: 'İşletme, tarih ve saat gerekli' },
        { status: 400 }
      );
    }

    const db = await openDb();

    // Kullanıcıyı bul
    const user = await db.get('SELECT id FROM users WHERE email = ?', [userEmail]);
    if (!user) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // İşletmenin var olduğunu kontrol et
    const business = await db.get('SELECT id FROM businesses WHERE id = ?', [business_id]);
    if (!business) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'İşletme bulunamadı' },
        { status: 404 }
      );
    }

    // Aynı tarih ve saatte başka randevu var mı kontrol et
    const existingAppointment = await db.get(`
      SELECT id FROM appointments 
      WHERE business_id = ? AND date = ? AND time = ? AND status != 'denied'
    `, [business_id, date, time]);

    if (existingAppointment) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Bu tarih ve saatte başka bir randevu bulunmaktadır' },
        { status: 409 }
      );
    }

    // Randevuyu oluştur
    const result = await db.run(`
      INSERT INTO appointments (customer_id, business_id, date, time, status, notes) 
      VALUES (?, ?, ?, ?, 'pending', ?)
    `, [user.id, business_id, date, time, notes || '']);

    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Randevu başarıyla oluşturuldu',
      appointmentId: result.lastID
    });

  } catch (error: any) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Randevu oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

// Kullanıcının randevularını getir
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

    // URL parametrelerini al
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const dateFilter = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let appointments;

    if (user.user_type === 'customer') {
      // Müşteri ise kendi randevularını getir
      let query = `
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
        WHERE a.customer_id = ?
      `;
      
      const params = [user.id];
      
      if (statusFilter) {
        query += ' AND a.status = ?';
        params.push(statusFilter);
      }
      
      if (dateFilter) {
        query += ' AND a.date = ?';
        params.push(dateFilter);
      }
      
      query += ' ORDER BY a.date DESC, a.time DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      appointments = await db.all(query, params);
    } else {
      // İşletme ise kendi işletmesine gelen randevuları getir
      const business = await db.get('SELECT id FROM businesses WHERE user_id = ?', [user.id]);
      if (!business) {
        await db.close();
        return NextResponse.json({
          success: true,
          appointments: []
        });
      }

      let query = `
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
        WHERE a.business_id = ?
      `;
      
      const params = [business.id];
      
      if (statusFilter) {
        query += ' AND a.status = ?';
        params.push(statusFilter);
      }
      
      if (dateFilter) {
        query += ' AND a.date = ?';
        params.push(dateFilter);
      }
      
      query += ' ORDER BY a.date DESC, a.time DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      appointments = await db.all(query, params);
    }

    await db.close();

    // Toplam sayıyı hesapla (sayfalama için)
    const totalCount = appointments.length;

    return NextResponse.json({
      success: true,
      appointments: appointments,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error: any) {
    console.error('Appointments fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Randevular yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 