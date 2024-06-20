import type { Metadata } from 'next';
import { UnitSettingsProvider } from '@/features/units/UnitSettingsProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'PlanTopo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white lg:bg-zinc-100 h-full max-h-full">
      <body className="h-full max-h-full">
        <UnitSettingsProvider>{children}</UnitSettingsProvider>
      </body>
    </html>
  );
}
