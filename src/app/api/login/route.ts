import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite.js';
import bcrypt from 'bcrypt';
import { getJwtSecretKey } from "@/lib/auth";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    const db = await openDb();

    // Kullanıcıyı email ile ara
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    console.log("user",user);
    if (!user) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);



    if (!isPasswordValid) {
      await db.close();
      return NextResponse.json(
        { success: false, message: 'Geçersiz şifre' },
        { status: 401 }
      );
    }

    await db.close();
    // JWT oluştur
    // Kullanıcı bilgilerini JWT içinde sakla
   
    const token = await new SignJWT({
      email: user.email,
    
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("3600s")
      .sign(getJwtSecretKey());

    const response = NextResponse.json(
      { success: true },
      { status: 200, headers: { "content-type": "application/json" } }
    );

    response.cookies.set({
      name: "token",
      value: token,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error('Login hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 