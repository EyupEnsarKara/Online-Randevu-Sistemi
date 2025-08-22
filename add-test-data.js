#!/usr/bin/env node

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

console.log('🧪 Test Verisi Ekleniyor...');
console.log('==========================\n');

async function openDb() {
  return await open({
    filename: './sqlite.db',
    driver: sqlite3.Database
  });
}

async function addTestData() {
  const db = await openDb();
  
  try {
    // 1. Test kullanıcıları oluştur
    console.log('1️⃣ Test kullanıcıları oluşturuluyor...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Müşteri kullanıcısı
    await db.run(`
      INSERT INTO users (name, email, password, user_type) 
      VALUES (?, ?, ?, ?)
    `, ['Ahmet Yılmaz', 'ahmet@test.com', hashedPassword, 'customer']);
    
    // İşletme kullanıcısı
    await db.run(`
      INSERT INTO users (name, email, password, user_type) 
      VALUES (?, ?, ?, ?)
    `, ['Ayşe Kaya', 'ayse@test.com', hashedPassword, 'business']);
    
    console.log('✅ 2 test kullanıcısı oluşturuldu\n');

    // 2. Test işletmesi oluştur
    console.log('2️⃣ Test işletmesi oluşturuluyor...');
    
    const businessUserId = await db.get('SELECT id FROM users WHERE email = ?', ['ayse@test.com']);
    
    await db.run(`
      INSERT INTO businesses (user_id, name, description, address, phone) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      businessUserId.id, 
      'Güzellik Salonu', 
      'Profesyonel saç ve makyaj hizmetleri', 
      'İstanbul, Kadıköy, Moda Caddesi No:123', 
      '0216 555 0123'
    ]);
    
    console.log('✅ Test işletmesi oluşturuldu\n');

    // 3. Test randevuları oluştur
    console.log('3️⃣ Test randevuları oluşturuluyor...');
    
    const customerUserId = await db.get('SELECT id FROM users WHERE email = ?', ['ahmet@test.com']);
    const businessId = await db.get('SELECT id FROM businesses WHERE user_id = ?', [businessUserId.id]);
    
    // Bugün için randevu
    const today = new Date().toISOString().split('T')[0];
    await db.run(`
      INSERT INTO appointments (customer_id, business_id, date, time, status, notes) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      customerUserId.id, 
      businessId.id, 
      today, 
      '14:00', 
      'approved', 
      'Saç kesimi ve boya'
    ]);
    
    // Yarın için randevu
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await db.run(`
      INSERT INTO appointments (customer_id, business_id, date, time, status, notes) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      customerUserId.id, 
      businessId.id, 
      tomorrow, 
      '16:00', 
      'pending', 
      'Makyaj'
    ]);
    
    console.log('✅ 2 test randevusu oluşturuldu\n');

    // 4. Test çalışma saatleri oluştur
    console.log('4️⃣ Test çalışma saatleri oluşturuluyor...');
    
    // Güzellik salonu için çalışma saatleri (Pazartesi-Cumartesi, 09:00-18:00)
    const workingDays = [1, 2, 3, 4, 5, 6]; // Pazartesi-Cumartesi
    
    for (const day of workingDays) {
      await db.run(`
        INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_working_day, slot_duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [businessId.id, day, '09:00', '18:00', 1, 30]);
    }
    
    console.log('✅ Test çalışma saatleri oluşturuldu\n');

    // 5. Test çalışma saatleri detayları
    console.log('5️⃣ Test çalışma saatleri detayları...');
    
    // Farklı slot duration'lar ile test
    await db.run(`
      UPDATE business_hours 
      SET slot_duration = ? 
      WHERE business_id = ? AND day_of_week = ?
    `, [45, businessId.id, 2]); // Salı günü 45dk slot
    
    await db.run(`
      UPDATE business_hours 
      SET slot_duration = ? 
      WHERE business_id = ? AND day_of_week = ?
    `, [60, businessId.id, 3]); // Çarşamba günü 60dk slot
    
    console.log('✅ Test çalışma saatleri detayları güncellendi\n');

    console.log('🎉 Tüm test verileri başarıyla eklendi!');
    console.log('\n📋 Test Hesapları:');
    console.log('   Müşteri: ahmet@test.com / 123456');
    console.log('   İşletme: ayse@test.com / 123456');
    console.log('\n🔧 İşletme ayarları sayfasından çalışma saatleri ve slot duration ayarlayabilirsiniz.');
    
  } catch (error) {
    console.error('❌ Test verisi eklenirken hata oluştu:', error.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

addTestData();
