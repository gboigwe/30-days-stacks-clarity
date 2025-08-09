import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Task Ecosystem - Multi-User Blockchain Task Management',
  description: 'Advanced multi-user task management system built on Stacks blockchain with Clarity 3.0 smart contracts',
  keywords: ['stacks', 'blockchain', 'task management', 'clarity', 'multi-user', 'ecosystem'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          {children}
        </div>
      </body>
    </html>
  );
}