import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

// Belirli bir tarih için müsait saatleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const date = searchParams.get('date');

    if (!businessId || !date) {
      return NextResponse.json({
        success: false,
        message: 'İşletme ID ve tarih gerekli'
      }, { status: 400 });
    }

    const db = await openDb();

    // Tarihin hangi gün olduğunu bul (0=Pazar, 1=Pazartesi, ...)
    const dayOfWeek = new Date(date).getDay();

    // İşletmenin o günkü çalışma saatlerini getir
    const businessHours = await db.get(`
      SELECT * FROM business_hours 
      WHERE business_id = ? AND day_of_week = ? AND is_working_day = 1
    `, [businessId, dayOfWeek]);

    if (!businessHours) {
      await db.close();
      return NextResponse.json({
        success: true,
        available_slots: [],
        message: 'Bu gün çalışma saati yok'
      });
    }

    // O gün için mevcut randevuları getir
    const existingAppointments = await db.all(`
      SELECT time FROM appointments 
      WHERE business_id = ? AND date = ? AND status != 'cancelled'
    `, [businessId, date]);

    await db.close();

    // Müsait saatleri hesapla (slot_duration dakikalık aralıklarla)
    const availableSlots = [];
    const startTime = businessHours.open_time;
    const endTime = businessHours.close_time;
    const slotDuration = businessHours.slot_duration || 30; // Varsayılan 30 dakika
    
    // Başlangıç ve bitiş saatlerini dakikaya çevir
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    // Slot duration dakikalık aralıklarla slot'ları oluştur
    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      const timeSlot = minutesToTime(minutes);
      
      // Bu saatte randevu var mı kontrol et
      const isBooked = existingAppointments.some(apt => apt.time === timeSlot);
      
      if (!isBooked) {
        availableSlots.push({
          time: timeSlot,
          available: true
        });
      } else {
        availableSlots.push({
          time: timeSlot,
          available: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      available_slots: availableSlots,
      business_hours: {
        open: startTime,
        close: endTime,
        slot_duration: slotDuration
      }
    });

  } catch (error: any) {
    console.error('Available slots error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Müsait saatler alınırken hata oluştu',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Saati dakikaya çevir (örn: "14:30" -> 870)
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Dakikayı saate çevir (örn: 870 -> "14:30")
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
