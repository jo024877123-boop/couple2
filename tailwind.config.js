/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: { sans: ['Noto Sans KR', 'sans-serif'] },
            colors: {
                theme: {
                    50: 'var(--primary-50)',
                    100: 'var(--primary-100)',
                    200: 'var(--primary-200)',
                    300: 'var(--primary-300)',
                    400: 'var(--primary-400)',
                    500: 'var(--primary-500)',
                    600: 'var(--primary-600)',
                    700: 'var(--primary-700)',
                }
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
                'float': 'float 3s ease-in-out infinite',
                'scaleIn': 'scaleIn 0.2s ease-out',
                'fadeIn': 'fadeIn 0.3s ease-out',
                'slideUp': 'slideUp 0.3s ease-out',
                'slideInRight': 'slideInRight 0.3s ease-out',
                'slideInLeft': 'slideInLeft 0.3s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    from: { transform: 'translateY(100%)' },
                    to: { transform: 'translateY(0)' },
                },
                slideInRight: {
                    from: { transform: 'translateX(100%)', opacity: '0' },
                    to: { transform: 'translateX(0)', opacity: '1' },
                },
                slideInLeft: {
                    from: { transform: 'translateX(-100%)', opacity: '0' },
                    to: { transform: 'translateX(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
