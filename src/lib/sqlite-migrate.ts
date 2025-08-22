import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// Migration tip tanımları
interface Migration {
  name: string;
  sql: string;
}

// Veritabanı migration utility'si
export async function runMigrations(): Promise<void> {
  const db = await open({
    filename: './sqlite.db',
    driver: sqlite3.Database
  });

  try {
    // Migration tablosunu oluştur
    await db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration'ları tanımla
    const migrations: Migration[] = [
      {
        name: '001_create_users_table',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            user_type TEXT NOT NULL DEFAULT 'customer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: '002_create_businesses_table',
        sql: `
          CREATE TABLE IF NOT EXISTS businesses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            address TEXT NOT NULL,
            phone TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          )
        `
      },
      {
        name: '003_create_appointments_table',
        sql: `
          CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            business_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
          )
        `
      },
      {
        name: '004_create_indexes',
        sql: `
          CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
          CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses (user_id);
          CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments (customer_id);
          CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON appointments (business_id);
          CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments (date, time);
          CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);
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
      },
      {
        name: '007_add_slot_duration_to_business_hours',
        sql: `
          ALTER TABLE business_hours ADD COLUMN slot_duration INTEGER DEFAULT 30;
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

// Veritabanı istatistiklerini getir
export async function getDatabaseStats(): Promise<Record<string, number>> {
  const db = await open({
    filename: './sqlite.db',
    driver: sqlite3.Database
  });

  try {
    const stats: Record<string, number> = {};
    
    // Tablo sayılarını al
    const tables = ['users', 'businesses', 'appointments', 'business_hours'];
    
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

// Veritabanı bağlantısını test et
export async function testDatabaseConnection(): Promise<boolean> {
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
