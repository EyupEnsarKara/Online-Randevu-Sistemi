import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Veritabanı migration utility'si
export async function runMigrations() {
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
    const migrations = [
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
      }
    ];

    // Migration'ları çalıştır
    for (const migration of migrations) {
      const exists = await db.get(
        'SELECT id FROM migrations WHERE name = ?',
        [migration.name]
      );

      if (!exists) {
        console.log(`Running migration: ${migration.name}`);
        
        // Migration'ı çalıştır
        await db.exec(migration.sql);
        
        // Migration kaydını ekle
        await db.run(
          'INSERT INTO migrations (name) VALUES (?)',
          [migration.name]
        );
        
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

// Veritabanı bağlantısını test et
export async function testConnection() {
  try {
    const db = await open({
      filename: './sqlite.db',
      driver: sqlite3.Database
    });

    const result = await db.get('SELECT 1 as test');
    await db.close();
    
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Veritabanı istatistiklerini getir
export async function getDatabaseStats() {
  const db = await open({
    filename: './sqlite.db',
    driver: sqlite3.Database
  });

  try {
    const stats = {};
    
    // Tablo sayıları
    const tables = ['users', 'businesses', 'appointments'];
    for (const table of tables) {
      const result = await db.get(`SELECT COUNT(*) as count FROM ${table}`);
      stats[table] = result.count;
    }
    
    // Migration sayısı
    const migrationResult = await db.get('SELECT COUNT(*) as count FROM migrations');
    stats.migrations = migrationResult.count;
    
    await db.close();
    return stats;
    
  } catch (error) {
    console.error('Error getting database stats:', error);
    await db.close();
    throw error;
  }
}

// Eğer bu dosya doğrudan çalıştırılırsa
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}
