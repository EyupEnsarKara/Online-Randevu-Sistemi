import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await openDb();
    
    let query = `
      SELECT 
        b.id,
        b.name,
        b.description,
        b.address,
        b.phone,
        u.name as owner_name
      FROM businesses b
      JOIN users u ON b.user_id = u.id
    `;
    
    const params: any[] = [];
    
    // Arama filtresi
    if (search.trim()) {
      query += ` WHERE (
        b.name LIKE ? OR 
        b.description LIKE ? OR 
        b.address LIKE ? OR
        u.name LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Sıralama ve limit
    query += ` ORDER BY b.name ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    // İşletmeleri getir
    const businesses = await db.all(query, params);
    
    // Toplam sayıyı getir (sayfalama için)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM businesses b
      JOIN users u ON b.user_id = u.id
    `;
    
    const countParams: any[] = [];
    if (search.trim()) {
      countQuery += ` WHERE (
        b.name LIKE ? OR 
        b.description LIKE ? OR 
        b.address LIKE ? OR
        u.name LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const totalResult = await db.get(countQuery, countParams);
    const total = totalResult.total;
    
    await db.close();

    return NextResponse.json({
      success: true,
      businesses: businesses,
      pagination: {
        total: total,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error: any) {
    console.error('Business search error:', error);
    return NextResponse.json(
      { success: false, message: 'İşletme araması yapılırken hata oluştu' },
      { status: 500 }
    );
  }
}
