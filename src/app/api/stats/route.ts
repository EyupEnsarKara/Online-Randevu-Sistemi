import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';
import { getJwtSecretKey } from '@/lib/auth';
import { jwtVerify } from 'jose';

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

    let stats;

    if (user.user_type === 'customer') {
      // Müşteri istatistikleri
      const totalAppointments = await db.get(
        'SELECT COUNT(*) as count FROM appointments WHERE customer_id = ?',
        [user.id]
      );

      const confirmedAppointments = await db.get(
        'SELECT COUNT(*) as count FROM appointments WHERE customer_id = ? AND status = "approved"',
        [user.id]
      );

      const pendingAppointments = await db.get(
        'SELECT COUNT(*) as count FROM appointments WHERE customer_id = ? AND status = "pending"',
        [user.id]
      );

      const cancelledAppointments = await db.get(
        'SELECT COUNT(*) as count FROM appointments WHERE customer_id = ? AND status = "cancelled"',
        [user.id]
      );

      stats = {
        total: totalAppointments.count,
        confirmed: confirmedAppointments.count,
        pending: pendingAppointments.count,
        cancelled: cancelledAppointments.count
      };
    } else {
      // İşletme istatistikleri
      const business = await db.get('SELECT id FROM businesses WHERE user_id = ?', [user.id]);
      if (!business) {
        await db.close();
        return NextResponse.json({
          success: true,
                  stats: {
          total: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0
        }
        });
      }

      const totalAppointments = await db.get(
        'SELECT COUNT(*) as count FROM appointments WHERE business_id = ?',
        [business.id]
      );

      const confirmedAppointments = await db.get(
        'SELECT COUNT(*) as count FROM appointments WHERE business_id = ? AND status = "approved"',
        [business.id]
      );

      const pendingAppointments = await db.get(
        'SELECT COUNT(*) as count FROM appointments WHERE business_id = ? AND status = "pending"',
        [business.id]
      );

      const cancelledAppointments = await db.get(
        'SELECT COUNT(*) as count FROM appointments WHERE business_id = ? AND status = "cancelled"',
        [business.id]
      );

      stats = {
        total: totalAppointments.count,
        confirmed: confirmedAppointments.count,
        pending: pendingAppointments.count,
        cancelled: cancelledAppointments.count
      };
    }

    await db.close();

    return NextResponse.json({
      success: true,
      stats: stats
    });

  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'İstatistikler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 