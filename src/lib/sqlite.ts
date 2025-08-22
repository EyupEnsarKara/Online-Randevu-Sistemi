import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

// Veritabanı dosya yolu
const DB_PATH = './sqlite.db';

// SQLite bağlantısı açan fonksiyon
export async function openDb(): Promise<Database> {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}
