import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Başarıyla çıkış yapıldı' },
      { status: 200 }
    );

    // Token cookie'sini temizle
    response.cookies.set({
      name: 'token',
      value: '',
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Çıkış yapılırken hata oluştu' },
      { status: 500 }
    );
  }
} 