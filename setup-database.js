#!/usr/bin/env node

import { runMigrations, testConnection, getDatabaseStats } from './src/lib/sqlite-migrate.js';

console.log('🚀 Online Randevu Sistemi - Veritabanı Kurulumu');
console.log('================================================\n');

async function setupDatabase() {
  try {
    console.log('1️⃣ Veritabanı migration\'ları çalıştırılıyor...');
    await runMigrations();
    console.log('✅ Migration\'lar başarıyla tamamlandı!\n');

    console.log('2️⃣ Veritabanı bağlantısı test ediliyor...');
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('✅ Veritabanı bağlantısı başarılı!\n');
    } else {
      console.log('❌ Veritabanı bağlantısı başarısız!');
      return;
    }

    console.log('3️⃣ Veritabanı istatistikleri alınıyor...');
    const stats = await getDatabaseStats();
    console.log('📊 Veritabanı İstatistikleri:');
    console.log(`   - Kullanıcılar: ${stats.users || 0}`);
    console.log(`   - İşletmeler: ${stats.businesses || 0}`);
    console.log(`   - Randevular: ${stats.appointments || 0}`);
    console.log(`   - Migration'lar: ${stats.migrations || 0}\n`);

    console.log('🎉 Veritabanı kurulumu tamamlandı!');
    console.log('📝 Şimdi http://localhost:3000 adresinden uygulamayı kullanabilirsiniz.');
    
  } catch (error) {
    console.error('❌ Veritabanı kurulumu sırasında hata oluştu:', error.message);
    process.exit(1);
  }
}

setupDatabase();
