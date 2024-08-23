// // src/app/layout.tsx
'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { Web3Provider } from '../contexts/Web3Context';
import { GlobalProvider } from '../contexts/GlobalContext';
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <GlobalProvider>
            <Web3Provider>
            <Header />
            {children}
            <Footer />
            </Web3Provider>
          </GlobalProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}