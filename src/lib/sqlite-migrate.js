import { openDb } from './sqlite.js';

async function migrate() {
  const db = await openDb();

  // 1. USERS tablosu
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      user_type TEXT NOT NULL CHECK(user_type IN ('customer', 'business')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. BUSINESSES tablosu
  await db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      address TEXT,
      phone TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // 3. APPOINTMENTS tablosu
  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      business_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'denied')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(business_id) REFERENCES businesses(id)
    );
  `);

  await db.close();
  console.log('Migration tamamlandı: users, businesses ve appointments tabloları oluşturuldu.');
}

migrate().catch((err) => {
  console.error('Migration hatası:', err);
});
