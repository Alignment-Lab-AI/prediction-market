'use client';

import React from 'react';
import { Box, Container, Heading, Text, Button, VStack, HStack, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const HomeContent: React.FC = () => {
  const bgColor = useColorModeValue('rgba(247, 250, 252, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box position="relative" minHeight="200vh" overflow="hidden" bg={bgColor}>
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={8} height="100vh" justifyContent="center" alignItems="center">
          <MotionBox
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Heading as="h1" size="4xl" textAlign="center" color={textColor}>
              Predict the Future
            </Heading>
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Text fontSize="xl" textAlign="center" color={textColor}>
              Join our cutting-edge prediction market platform
            </Text>
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <HStack spacing={4}>
              <Button colorScheme="blue" size="lg">
                Explore Markets
              </Button>
              <Button colorScheme="green" size="lg">
                Create Market
              </Button>
            </HStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default HomeContent;