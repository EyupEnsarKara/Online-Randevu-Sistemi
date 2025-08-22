#!/usr/bin/env node

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function testBusinessHours() {
  console.log('🔍 Business Hours Test Başlatılıyor...\n');

  try {
    // Veritabanına bağlan
    const db = await open({
      filename: './sqlite.db',
      driver: sqlite3.Database
    });

    console.log('✅ Veritabanına bağlandı\n');

    // Business hours tablosunu kontrol et
    console.log('📋 Business Hours Tablosu Kontrol Ediliyor...');
    const tableInfo = await db.all("PRAGMA table_info(business_hours)");
    
    if (tableInfo.length === 0) {
      console.log('❌ Business hours tablosu bulunamadı!');
      console.log('💡 Migration çalıştırmanız gerekiyor:');
      console.log('   npm run setup-db');
      return;
    }

    console.log('✅ Business hours tablosu mevcut');
    console.log('📊 Tablo yapısı:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });

    // Mevcut business hours kayıtlarını kontrol et
    console.log('\n📅 Mevcut Business Hours Kayıtları:');
    const businessHours = await db.all('SELECT * FROM business_hours ORDER BY business_id, day_of_week');
    
    if (businessHours.length === 0) {
      console.log('ℹ️  Henüz business hours kaydı yok');
    } else {
      businessHours.forEach(hour => {
        const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        console.log(`   - ${dayNames[hour.day_of_week]}: ${hour.open_time} - ${hour.close_time} (Slot: ${hour.slot_duration}dk, Açık: ${hour.is_working_day ? 'Evet' : 'Hayır'})`);
      });
    }

    // Test verisi ekle (isteğe bağlı)
    console.log('\n🧪 Test Verisi Ekleniyor...');
    
    // Önce mevcut test verilerini temizle
    await db.run('DELETE FROM business_hours WHERE business_id = 999');
    
    // Test business hours ekle
    const testHours = [
      { day: 1, open: '09:00', close: '18:00', isWorking: 1, slotDuration: 30 }, // Pazartesi
      { day: 2, open: '09:00', close: '18:00', isWorking: 1, slotDuration: 45 }, // Salı
      { day: 3, open: '09:00', close: '18:00', isWorking: 1, slotDuration: 60 }, // Çarşamba
      { day: 4, open: '09:00', close: '18:00', isWorking: 1, slotDuration: 30 }, // Perşembe
      { day: 5, open: '09:00', close: '18:00', isWorking: 1, slotDuration: 30 }, // Cuma
      { day: 6, open: '10:00', close: '16:00', isWorking: 1, slotDuration: 45 }, // Cumartesi
      { day: 0, open: '10:00', close: '16:00', isWorking: 0, slotDuration: 30 }  // Pazar (kapalı)
    ];

    for (const hour of testHours) {
      await db.run(`
        INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_working_day, slot_duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [999, hour.day, hour.open, hour.close, hour.isWorking, hour.slotDuration]);
    }

    console.log('✅ Test verisi eklendi (Business ID: 999)');

    // Test verilerini kontrol et
    console.log('\n📋 Test Verileri Kontrol Ediliyor...');
    const testBusinessHours = await db.all('SELECT * FROM business_hours WHERE business_id = 999 ORDER BY day_of_week');
    
    testBusinessHours.forEach(hour => {
      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      console.log(`   - ${dayNames[hour.day_of_week]}: ${hour.open_time} - ${hour.close_time} (Slot: ${hour.slot_duration}dk, Açık: ${hour.is_working_day ? 'Evet' : 'Hayır'})`);
    });

    // Slot duration test
    console.log('\n⏰ Slot Duration Test...');
    const testDate = '2024-01-15'; // Pazartesi
    const dayOfWeek = new Date(testDate).getDay();
    
    const testHour = await db.get(`
      SELECT * FROM business_hours 
      WHERE business_id = 999 AND day_of_week = ? AND is_working_day = 1
    `, [dayOfWeek]);

    if (testHour) {
      console.log(`✅ ${testDate} tarihi için çalışma saati bulundu:`);
      console.log(`   Açılış: ${testHour.open_time}`);
      console.log(`   Kapanış: ${testHour.close_time}`);
      console.log(`   Slot Duration: ${testHour.slot_duration} dakika`);
      
      // Slot hesaplama test
      const startMinutes = timeToMinutes(testHour.open_time);
      const endMinutes = timeToMinutes(testHour.close_time);
      const slotDuration = testHour.slot_duration;
      
      console.log(`\n📊 Slot Hesaplama Test:`);
      console.log(`   Başlangıç: ${startMinutes} dakika`);
      console.log(`   Bitiş: ${endMinutes} dakika`);
      console.log(`   Slot Duration: ${slotDuration} dakika`);
      
      let slotCount = 0;
      for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
        const timeSlot = minutesToTime(minutes);
        console.log(`   Slot ${++slotCount}: ${timeSlot}`);
      }
    } else {
      console.log(`❌ ${testDate} tarihi için çalışma saati bulunamadı`);
    }

    await db.close();
    console.log('\n✅ Test tamamlandı!');

  } catch (error) {
    console.error('❌ Test hatası:', error);
  }
}

// Yardımcı fonksiyonlar
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Test'i çalıştır
testBusinessHours();
