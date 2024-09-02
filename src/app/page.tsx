// src/app/page.tsx
'use client';

import React from 'react';
import { Box, Container, Center, Spinner } from '@chakra-ui/react';
import { useGlobalContext } from '../contexts/GlobalContext';
import Hero from './home/components/Hero';
import Stats from './home/components/Stats';
import FeaturedMarkets from './home/components/FeaturedMarkets';
import WhyUs from './home/components/WhyUs';
import CallToAction from './home/components/CallToAction';

export default function Home() {
  const { isInitialLoading } = useGlobalContext();

  if (isInitialLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box bg="gray.50" minHeight="100vh">
      <Container maxW="container.xl" py={20}>
        <Box mb={0}>
          <Hero />
        </Box>

        <Box mb={0}>
          <Stats />
        </Box>

        <Box mb={0}>
          <FeaturedMarkets />
        </Box>

        <Box mb={0}>
          <WhyUs />
        </Box>

        <Box mb={0}>
          <CallToAction />
        </Box>
      </Container>
    </Box>
  );
}