#!/usr/bin/env node

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

console.log('🚀 Online Randevu Sistemi - Veritabanı Kurulumu');
console.log('================================================\n');

async function runMigrations() {
  const db = await open({
    filename: './sqlite.db',
    driver: sqlite3.Database
  });

  try {
    // Önce migrations tablosunu oluştur (eğer yoksa)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration'ları tanımla
    const migrations = [
      {
        name: '001_create_migrations_table',
        sql: `
          CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: '002_create_users_table',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'business')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: '003_create_businesses_table',
        sql: `
          CREATE TABLE IF NOT EXISTS businesses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            address TEXT,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          )
        `
      },
      {
        name: '004_create_appointments_table',
        sql: `
          CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            business_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
          )
        `
      },
      {
        name: '005_create_business_hours_table',
        sql: `
          CREATE TABLE IF NOT EXISTS business_hours (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_id INTEGER NOT NULL,
            day_of_week INTEGER NOT NULL,
            open_time TEXT NOT NULL,
            close_time TEXT NOT NULL,
            is_working_day BOOLEAN DEFAULT 1,
            slot_duration INTEGER DEFAULT 30,
            FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
          )
        `
      },
      {
        name: '006_create_business_hours_indexes',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_business_hours_business_id ON business_hours (business_id);
          CREATE INDEX IF NOT EXISTS idx_business_hours_day_time ON business_hours (day_of_week, open_time, close_time);
        `
      }
    ];

    // Migration'ları çalıştır
    for (const migration of migrations) {
      const existing = await db.get('SELECT * FROM migrations WHERE name = ?', [migration.name]);
      
      if (!existing) {
        console.log(`Running migration: ${migration.name}`);
        await db.exec(migration.sql);
        await db.run('INSERT INTO migrations (name) VALUES (?)', [migration.name]);
        console.log(`Migration completed: ${migration.name}`);
      } else {
        console.log(`Migration already exists: ${migration.name}`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await db.close();
  }
}

async function testConnection() {
  try {
    const db = await open({
      filename: './sqlite.db',
      driver: sqlite3.Database
    });
    
    await db.get('SELECT 1');
    await db.close();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

async function getDatabaseStats() {
  const db = await open({
    filename: './sqlite.db',
    driver: sqlite3.Database
  });

  try {
    const stats = {};
    
    // Tablo sayılarını al
    const tables = ['users', 'businesses', 'appointments', 'business_hours', 'migrations'];
    
    for (const table of tables) {
      try {
        const result = await db.get(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = result?.count || 0;
      } catch (error) {
        console.warn(`Table ${table} not found or error counting:`, error);
        stats[table] = 0;
      }
    }

    return stats;
  } catch (error) {
    console.error('Database stats error:', error);
    throw error;
  } finally {
    await db.close();
  }
}

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
    console.log(`   - Çalışma Saatleri: ${stats.business_hours || 0}`);
    console.log(`   - Migration'lar: ${stats.migrations || 0}\n`);

    console.log('🎉 Veritabanı kurulumu tamamlandı!');
    console.log('📝 Şimdi http://localhost:3000 adresinden uygulamayı kullanabilirsiniz.');
    console.log('🔧 İşletme ayarları sayfasından çalışma saatleri ve slot duration ayarlayabilirsiniz.');
    
  } catch (error) {
    console.error('❌ Veritabanı kurulumu sırasında hata oluştu:', error.message);
    process.exit(1);
  }
}

setupDatabase();
