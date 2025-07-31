import { NextResponse } from 'next/server';
import { verifyJwtToken } from './lib/auth';



// src/middleware.js
export async function middleware(request) {
    const { url, nextUrl, cookies } = request;
    const { value: token } = cookies.get("token") ?? { value: null };
    const hasVerifiedToken = token && (await verifyJwtToken(token));
    
    // API route kontrolü
    if (nextUrl.pathname.startsWith('/api/')) {
        // Public API route'ları (herkes erişebilir)
        const publicApiRoutes = ['/api/login', '/api/register'];
        
        if (publicApiRoutes.includes(nextUrl.pathname)) {
            return NextResponse.next(); // Her zaman erişilebilir
        }
        
        // Protected API route'ları için token kontrolü
        if (!hasVerifiedToken) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        return NextResponse.next();
    }
    
    // Sayfa route'ları için mevcut logic
    const AUTH_PAGES = ["/login", "/register"];
    const isAuthPageRequested = AUTH_PAGES.some((page) => nextUrl.pathname.startsWith(page));
    
    if (isAuthPageRequested) {
        if (!hasVerifiedToken) {
            const response = NextResponse.next();
            response.cookies.delete("token");
            return response;
        }
        
        return NextResponse.redirect(new URL(`/`, url));
    }
    
    if (!hasVerifiedToken) {
        const searchParams = new URLSearchParams(nextUrl.searchParams);
        searchParams.set("next", nextUrl.pathname);
        
        const response = NextResponse.redirect(
            new URL(`/login?${searchParams}`, url)
        );
        response.cookies.delete("token");
        return response;
    }
    
    return NextResponse.next();
}

export const config = { 
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ]
};