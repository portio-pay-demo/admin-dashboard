import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PortIOPay Admin',
  description: 'PortIOPay internal merchant operations portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
