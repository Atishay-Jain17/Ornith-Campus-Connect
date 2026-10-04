import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ORNITH Brand Palette
        ornith: {
          grey: '#1E1E24',
          'grey-light': '#2A2A33',
          'grey-muted': '#3A3A45',
          apricot: '#EDCB96',
          'apricot-light': '#F5E4BF',
          'apricot-dark': '#D4A855',
          coral: '#ED6A5A',
          'coral-light': '#F5948A',
          'coral-dark': '#D4503F',
          teal: '#57886C',
          'teal-light': '#7AAF8F',
          'teal-dark': '#3D6450',
          lavender: '#D8D8F6',
          'lavender-dark': '#A0A0E8',
          'lavender-deep': '#6B6BC4',
        },
        // Neutral surfaces
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FAFAF8',
          warm: '#F7F5F0',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)',
        'modal': '0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)',
        'coral': '0 4px 12px rgba(237,106,90,0.25)',
        'teal': '0 4px 12px rgba(87,136,108,0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
