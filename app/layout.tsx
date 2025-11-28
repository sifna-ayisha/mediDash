import React from 'react';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediDash - Hospital Management System",
  description: "A modern, role-based hospital management system dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/vite.svg" />

        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    heading: ['Poppins', 'sans-serif'],
                  },
                  colors: {
                    slate: {
                      50: '#f8fafc',
                      100: '#f1f5f9',
                      200: '#e2e8f0',
                      300: '#cbd5e1',
                      400: '#94a3b8',
                      500: '#64748b',
                      600: '#475569',
                      700: '#334155',
                      800: '#1e293b',
                      900: '#0f172a',
                    },
                    blue: {
                      50: '#eff6ff',
                      100: '#dbeafe',
                      200: '#bfdbfe',
                      300: '#93c5fd',
                      400: '#60a5fa',
                      500: '#3b82f6',
                      600: '#2563eb',
                      700: '#1d4ed8',
                      800: '#1e40af',
                      900: '#1e3a8a',
                    },
                    violet: {
                      50: '#f5f3ff',
                      100: '#ede9fe',
                      200: '#ddd6fe',
                      300: '#c4b5fd',
                      400: '#a78bfa',
                      500: '#8b5cf6',
                      600: '#7c3aed',
                      700: '#6d28d9',
                      800: '#5b21b6',
                      900: '#4c1d95',
                    },
                    green: {
                       50: '#f0fdf4',
                      100: '#dcfce7',
                      200: '#bbf7d0',
                      300: '#86efac',
                      400: '#4ade80',
                      500: '#22c55e',
                      600: '#16a34a',
                      700: '#15803d',
                      800: '#166534',
                      900: '#14532d',
                    },
                    amber: {
                      50: '#fffbeb',
                      100: '#fef3c7',
                      500: '#f59e0b',
                      600: '#d97706',
                    },
                    red: {
                      50: '#fef2f2',
                      100: '#fee2e2',
                      500: '#ef4444',
                      600: '#dc2626',
                    }
                  },
                  borderRadius: {
                    'xl': '0.75rem',
                    '2xl': '1rem',
                  },
                  boxShadow: {
                    'smooth': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  },
                  keyframes: {
                    'fade-in-down': {
                      '0%': { opacity: '0', transform: 'translateY(-10px)' },
                      '100%': { opacity: '1', transform: 'translateY(0)' },
                    },
                  },
                  animation: {
                    'fade-in-down': 'fade-in-down 0.3s ease-out',
                  },
                }
              }
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
