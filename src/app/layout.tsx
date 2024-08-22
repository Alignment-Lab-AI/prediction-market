// import { ChakraProvider } from '@chakra-ui/react'
// import Header from '../components/Header'
// import Footer from '../components/Footer'

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <ChakraProvider>
//           <Header />
//           <main>{children}</main>
//           <Footer />
//         </ChakraProvider>
//       </body>
//     </html>
//   )
// }

// // src/app/layout.tsx
'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { GlobalProvider } from '../contexts/GlobalContext';
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <GlobalProvider>
            <Header />
            {children}
            <Footer />
          </GlobalProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}