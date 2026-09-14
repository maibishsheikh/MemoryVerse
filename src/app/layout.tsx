import type { Metadata } from 'next';
import { Baloo_2, Nunito } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-baloo',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MemoryVerse | Interactive Memory Learning for Kids',
  description: 'See it. Play with it. Remember it. Master memory palaces, visual pegs, Vedic maths, and mnemonics with interactive simulations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-bg text-ink flex flex-col font-body selection:bg-secondary-light selection:text-ink">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
