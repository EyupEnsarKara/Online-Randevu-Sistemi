#!/usr/bin/env node

import { openDb } from './src/lib/sqlite.js';
import bcrypt from 'bcrypt';

console.log('🧪 Test Verisi Ekleniyor...');
console.log('==========================\n');

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
      'confirmed', 
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

    // 4. Sonuçları göster
    console.log('📊 Test Verisi Özeti:');
    console.log('   👤 Kullanıcılar: 2 (1 müşteri, 1 işletme)');
    console.log('   🏢 İşletmeler: 1');
    console.log('   📅 Randevular: 2 (1 onaylı, 1 bekleyen)\n');
    
    console.log('🔑 Test Giriş Bilgileri:');
    console.log('   Müşteri: ahmet@test.com / 123456');
    console.log('   İşletme: ayse@test.com / 123456\n');
    
    console.log('🎉 Test verisi başarıyla eklendi!');
    console.log('📝 http://localhost:3000 adresinden test edebilirsiniz.');
    
  } catch (error) {
    console.error('❌ Test verisi eklenirken hata oluştu:', error.message);
  } finally {
    await db.close();
  }
}

addTestData();
