'use client';

import React from 'react';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-md border border-border">
                <h2 className="text-2xl font-semibold text-heading mb-6 text-center">
                    Giriş Yap
                </h2>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm text-text mb-1">
                            E-posta
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="ornek@mail.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm text-text mb-1">
                            Şifre
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-600 transition"
                    >
                        Giriş Yap
                    </button>
                </form>
                <p className="mt-4 text-sm text-center text-text">
                    Hesabınız yok mu? <a href="/register" className="text-primary hover:underline">Kayıt Ol</a>
                </p>
            </div>
        </div>
    );
}
