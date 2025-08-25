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
    
    console.log('✅ 1 müşteri kullanıcısı oluşturuldu\n');

    // 2. Test işletmesi oluştur
    console.log('2️⃣ Test işletmeleri oluşturuluyor...');

    // Ek: Erkek Kuaförü kullanıcısı ve işletmesi
    const barberHashedPassword = hashedPassword; // aynı şifre
    await db.run(`
      INSERT INTO users (name, email, password, user_type)
      VALUES (?, ?, ?, ?)
    `, ['Berk Demir', 'kuafor@test.com', barberHashedPassword, 'business']);

    const barberUserId = await db.get('SELECT id FROM users WHERE email = ?', ['kuafor@test.com']);
    await db.run(`
      INSERT INTO businesses (user_id, name, description, address, phone)
      VALUES (?, ?, ?, ?, ?)
    `, [
      barberUserId.id,
      'Erkek Kuaförü',
      'Saç kesimi, sakal tıraşı ve bakım hizmetleri',
      'İstanbul, Beşiktaş, Barbaros Blv. No:45',
      '0212 444 0090'
    ]);
    console.log('✅ Erkek Kuaförü oluşturuldu');

    // Ek: Diş Kliniği kullanıcısı ve işletmesi
    await db.run(`
      INSERT INTO users (name, email, password, user_type)
      VALUES (?, ?, ?, ?)
    `, ['Deniz Aydın', 'dis@test.com', hashedPassword, 'business']);

    const dentistUserId = await db.get('SELECT id FROM users WHERE email = ?', ['dis@test.com']);
    await db.run(`
      INSERT INTO businesses (user_id, name, description, address, phone)
      VALUES (?, ?, ?, ?, ?)
    `, [
      dentistUserId.id,
      'Diş Kliniği',
      'Genel diş hekimliği, dolgu, kanal tedavisi ve diş taşı temizliği',
      'Ankara, Çankaya, Atatürk Blv. No:210',
      '0312 555 0020'
    ]);
    console.log('✅ Diş Kliniği oluşturuldu\n');

    // 3. Test randevuları oluştur
    console.log('3️⃣ Test randevuları oluşturuluyor...');
    
    const customerUserId = await db.get('SELECT id FROM users WHERE email = ?', ['ahmet@test.com']);
    const barberBusinessId = await db.get('SELECT id FROM businesses WHERE user_id = ?', [barberUserId.id]);
    const dentistBusinessId = await db.get('SELECT id FROM businesses WHERE user_id = ?', [dentistUserId.id]);
    
    // Erkek Kuaförü için randevu (yarından sonraki gün)
    const dayAfterTomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await db.run(`
      INSERT INTO appointments (customer_id, business_id, date, time, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      customerUserId.id,
      barberBusinessId.id,
      dayAfterTomorrow,
      '13:30',
      'pending',
      'Saç kesimi'
    ]);

    // Diş Kliniği için randevu (3 gün sonrası)
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await db.run(`
      INSERT INTO appointments (customer_id, business_id, date, time, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      customerUserId.id,
      dentistBusinessId.id,
      threeDaysLater,
      '10:00',
      'pending',
      'Kontrol ve diş taşı temizliği'
    ]);

    console.log('✅ 2 test randevusu oluşturuldu\n');

    // 4. Test çalışma saatleri oluştur
    console.log('4️⃣ Test çalışma saatleri oluşturuluyor...');
    
    // (Güzellik Salonu kaldırıldı)

    // Erkek Kuaförü için çalışma saatleri (Salı-Pazar, 10:00-20:00)
    const barberWorkingDays = [2, 3, 4, 5, 6, 0]; // Salı-Pazar (0=Pazar)
    for (const day of barberWorkingDays) {
      await db.run(`
        INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_working_day, slot_duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [barberBusinessId.id, day, '10:00', '20:00', 1, 30]);
    }
    console.log('✅ Erkek Kuaförü çalışma saatleri oluşturuldu');

    // Diş Kliniği için çalışma saatleri (Pazartesi-Cuma, 09:00-17:00)
    const dentistWorkingDays = [1, 2, 3, 4, 5];
    for (const day of dentistWorkingDays) {
      await db.run(`
        INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_working_day, slot_duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [dentistBusinessId.id, day, '09:00', '17:00', 1, 60]);
    }
    console.log('✅ Diş Kliniği çalışma saatleri oluşturuldu\n');

    // 5. Test çalışma saatleri detayları
    console.log('5️⃣ Test çalışma saatleri detayları...');
    
    // Farklı slot duration'lar ile test
    await db.run(`
      UPDATE business_hours 
      SET slot_duration = ? 
      WHERE business_id = ? AND day_of_week = ?
    `, [45, barberBusinessId.id, 2]); // Kuaför: Salı 45dk
    
    await db.run(`
      UPDATE business_hours 
      SET slot_duration = ? 
      WHERE business_id = ? AND day_of_week = ?
    `, [60, dentistBusinessId.id, 3]); // Diş: Çarşamba 60dk
    
    console.log('✅ Test çalışma saatleri detayları güncellendi\n');

    console.log('🎉 Tüm test verileri başarıyla eklendi!');
    console.log('\n📋 Test Hesapları:');
    console.log('   Müşteri:  ahmet@test.com   / 123456');
    console.log('   Kuaför:   kuafor@test.com  / 123456');
    console.log('   Diş:      dis@test.com     / 123456');
    console.log('\n🔧 İşletme ayarları sayfasından çalışma saatleri ve randevu süresi ayarlayabilirsiniz.');
    
  } catch (error) {
    console.error('❌ Test verisi eklenirken hata oluştu:', error.message);
    process.exit(1);
  } finally {
    await db.close();
  }
}

addTestData();
