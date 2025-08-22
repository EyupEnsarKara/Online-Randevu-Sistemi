#!/usr/bin/env node

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

console.log('🕐 Çalışma Saatleri Ekleniyor...');
console.log('================================\n');

async function openDb() {
  return await open({
    filename: './sqlite.db',
    driver: sqlite3.Database
  });
}

async function addBusinessHours() {
  const db = await openDb();
  
  try {
    // Mevcut işletmeyi bul
    const business = await db.get('SELECT id FROM businesses LIMIT 1');
    
    if (!business) {
      console.log('❌ Hiç işletme bulunamadı!');
      return;
    }

    console.log(`🏢 İşletme ID: ${business.id} için çalışma saatleri ekleniyor...`);

    // Mevcut çalışma saatlerini kontrol et
    const existingHours = await db.get('SELECT COUNT(*) as count FROM business_hours WHERE business_id = ?', [business.id]);
    
    if (existingHours.count > 0) {
      console.log('✅ Çalışma saatleri zaten mevcut!');
      return;
    }

    // Güzellik salonu için çalışma saatleri (Pazartesi-Cumartesi, 09:00-18:00)
    const workingDays = [1, 2, 3, 4, 5, 6]; // Pazartesi-Cumartesi
    
    for (const day of workingDays) {
      await db.run(`
        INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_working_day, slot_duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [business.id, day, '09:00', '18:00', 1, 30]);
      
      const dayNames = ['Pazar', 'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      console.log(`   ✅ ${dayNames[day]}: 09:00 - 18:00 (Slot: 30dk)`);
    }
    
    console.log('\n🎉 Çalışma saatleri başarıyla eklendi!');
    console.log('📝 Artık randevu oluştururken çalışma saatleri ve slot duration dikkate alınacak.');
    console.log('🔧 İşletme ayarları sayfasından slot duration\'ları özelleştirebilirsiniz.');
    
  } catch (error) {
    console.error('❌ Çalışma saatleri eklenirken hata oluştu:', error.message);
  } finally {
    await db.close();
  }
}

addBusinessHours();
