import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgeOfDevs Token - Community Cryptocurrency',
  description: 'The cryptocurrency powering the developer community. Claim your free tokens, earn rewards, and help shape the future of development education.',
  keywords: 'AgeOfDevs, AOD, token, cryptocurrency, Stacks, blockchain, developer community',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}