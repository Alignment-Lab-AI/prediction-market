// src/app/page.tsx
'use client';

import React from 'react';
import { Box, Container, Center, Spinner, Alert, AlertIcon, Button } from '@chakra-ui/react';
import { useGlobalContext } from '../contexts/GlobalContext';
import Hero from './home/components/Hero';
import Stats from './home/components/Stats';
import FeaturedMarkets from './home/components/FeaturedMarkets';
import WhyUs from './home/components/WhyUs';
import CallToAction from './home/components/CallToAction';

export default function Home() {
  const { isInitialLoading, isRefreshing, error, refreshData } = useGlobalContext();

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
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
            <Button ml={4} onClick={refreshData} isLoading={isRefreshing}>
              Retry
            </Button>
          </Alert>
        )}
        
        <Box mb={0}>  {/* Adjust this value to change space after Hero */}
          <Hero />
        </Box>

        <Box mb={0}>  {/* Adjust this value to change space after Stats */}
          <Stats />
        </Box>

        <Box mb={0}>  {/* Adjust this value to change space after FeaturedMarkets */}
          <FeaturedMarkets />
        </Box>

        <Box mb={0}>  {/* Adjust this value to change space after WhyUs */}
          <WhyUs />
        </Box>

        <Box mb={0}>  {/* Adjust this value to change space after CallToAction */}
          <CallToAction />
        </Box>
      </Container>
    </Box>
  );
}