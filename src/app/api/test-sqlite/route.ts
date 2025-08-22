import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';
import { runMigrations, testDatabaseConnection, getDatabaseStats } from '@/lib/sqlite-migrate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'migrate':
        // Migration'ları çalıştır
        await runMigrations();
        return NextResponse.json({
          success: true,
          message: 'Migrations completed successfully'
        });

      case 'test':
        // Veritabanı bağlantısını test et
        const isConnected = await testDatabaseConnection();
        return NextResponse.json({
          success: true,
          connected: isConnected,
          message: isConnected ? 'Database connection successful' : 'Database connection failed'
        });

      case 'stats':
        // Veritabanı istatistiklerini getir
        const stats = await getDatabaseStats();
        return NextResponse.json({
          success: true,
          stats: stats
        });

      case 'tables':
        // Tablo yapılarını getir
        const db = await openDb();
        const tables = await db.all(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `);
        
        const tableSchemas = {};
        for (const table of tables) {
          const schema = await db.all(`PRAGMA table_info(${table.name})`);
          tableSchemas[table.name] = schema;
        }
        
        await db.close();
        
        return NextResponse.json({
          success: true,
          tables: tableSchemas
        });

      case 'business-hours':
        // Business hours test
        const db2 = await openDb();
        const businessHoursTest = await db2.all(`
          SELECT * FROM business_hours 
          ORDER BY business_id, day_of_week
        `);
        await db2.close();
        
        return NextResponse.json({
          success: true,
          business_hours: businessHoursTest
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'SQLite test endpoint',
          availableActions: ['migrate', 'test', 'stats', 'tables', 'business-hours'],
          usage: 'Add ?action=action_name to test different functions'
        });
    }

  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Test failed',
        error: error.message 
      },
      { status: 500 }
    );
  }
}