
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        // Enhanced teen-friendly neon color scheme
        neon: {
          blue: '#4DEEEA',
          purple: '#A566FF', 
          pink: '#F768A1',
          green: '#4AFF91',
          yellow: '#FDDA16',
          red: '#FF6B6B',
          cyan: '#00FFFF',
          magenta: '#FF00FF',
          lime: '#32CD32',
          orange: '#FF8C00',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(155, 135, 245, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(155, 135, 245, 0.8)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'rotate-glow': {
          '0%': { transform: 'rotate(0deg)', boxShadow: '0 0 15px rgba(155, 135, 245, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(155, 135, 245, 0.5)' },
          '100%': { transform: 'rotate(360deg)', boxShadow: '0 0 15px rgba(155, 135, 245, 0.3)' },
        },
        'hover-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'background-pulse': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'bounce-light': {
          '0%, 100%': {
            transform: 'translateY(-8px)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        'fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(155, 135, 245, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(155, 135, 245, 0.8)',
          },
        }
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'rotate-glow': 'rotate-glow 10s linear infinite',
        'hover-bounce': 'hover-bounce 2s ease-in-out infinite',
        'background-pulse': 'background-pulse 5s ease infinite',
        'shimmer': 'shimmer 3s infinite linear',
        'gradient-flow': 'gradient-flow 3s ease-in-out infinite',
        'bounce-light': 'bounce-light 4s infinite',
        'fade-in': 'fade-in 0.8s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
