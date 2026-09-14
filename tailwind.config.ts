import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#FBF8F3', lavender: '#F3F0FB', blue: '#EFF6FC' },
        primary: { DEFAULT: '#6C9BD8', light: '#8FB8E8', dark: '#4E7FBE' },
        secondary: { DEFAULT: '#B79FE0', light: '#D2C3EE', dark: '#9A7DC9' },
        accent: { DEFAULT: '#FFC85C', light: '#FFDA8F', dark: '#E8AC2E' },
        success: { DEFAULT: '#7BC9A0', light: '#A6DEC1', dark: '#57A87E' },
        attention: { DEFAULT: '#FFB27A', light: '#FFCBA3', dark: '#E8935A' },
        error: { DEFAULT: '#FF8A80', light: '#FFB0A8', dark: '#E85F53' },
        ink: { DEFAULT: '#2E2A4A', muted: '#6B6580', light: '#9D97B2' },
      },
      fontFamily: {
        heading: ['var(--font-baloo)', 'Baloo 2', 'cursive', 'sans-serif'],
        body: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(46, 42, 74, 0.06)',
        'float': '0 14px 35px rgba(108, 155, 216, 0.18)',
        'card': '0 10px 25px -5px rgba(46, 42, 74, 0.08), 0 8px 10px -6px rgba(46, 42, 74, 0.04)',
        'pop': '0 6px 0 0 rgba(46, 42, 74, 0.12)',
        'glow-accent': '0 0 25px rgba(255, 200, 92, 0.5)',
        'glow-primary': '0 0 25px rgba(108, 155, 216, 0.45)',
      },
      animation: {
        'bounce-soft': 'bounceSoft 2s infinite ease-in-out',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
