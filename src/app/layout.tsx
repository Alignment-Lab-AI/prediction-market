// app/layout.tsx
'use client';

import React from 'react';
import { ChakraProvider, Box, useColorModeValue } from '@chakra-ui/react';
import { Global, css } from '@emotion/react';
import { Web3Provider } from '../contexts/Web3Context';
import { GlobalProvider } from '../contexts/GlobalContext';
import Header from '../components/Header'
import Footer from '../components/Footer'

const GlobalStyles = () => (
  <Global
    styles={css`
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
      #__next {
        height: 100%;
      }
    `}
  />
);

const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  return (
    <Box
      minHeight="100vh"
      bg={bgColor}
      backgroundImage="url('https://www.transparenttextures.com/patterns/cubes.png')"
      backgroundAttachment="fixed"
      backgroundRepeat="repeat"
      position="relative"
      zIndex={0}
    >
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Box>
  );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <GlobalProvider>
            <Web3Provider>
              <GlobalStyles />
              <BackgroundWrapper>
                <Header />
                {children}
                <Footer />
              </BackgroundWrapper>
            </Web3Provider>
          </GlobalProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}