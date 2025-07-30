/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#3B82F6',
                secondary: '#60A5FA',
                background: '#F9FAFB',
                card: '#FFFFFF',
                border: '#E5E7EB',
                heading: '#111827',
                text: '#4B5563',
                success: '#10B981',
                danger: '#EF4444',
                muted: '#D1D5DB',
            },
        },
    },
    plugins: [],
};
