import type { Metadata } from 'next';
import { Rubik, Nunito_Sans } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rubik',
  display: 'swap',
});

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Trocalia — Marketplace de intercambio Argentina',
  description:
    'Comprá, vendé y trocá entre vecinos en toda Argentina. Lo que ya no usás se transforma en algo que sí.',
  metadataBase: new URL('https://trocalia.com.ar'),
  openGraph: {
    title: 'Trocalia',
    description: 'Marketplace argentino de intercambio C2C',
    type: 'website',
    locale: 'es_AR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${rubik.variable} ${nunito.variable}`}>
      <body className="bg-trocalia-bg text-trocalia-text font-sans antialiased min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
