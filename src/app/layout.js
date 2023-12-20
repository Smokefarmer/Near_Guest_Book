'use client';
import './globals.css';
import '@near-wallet-selector/modal-ui/styles.css';

import { Navigation } from '@/components/navigation';
import { AuthProvider } from './authContext';

export default function RootLayout({ children }) {


  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
