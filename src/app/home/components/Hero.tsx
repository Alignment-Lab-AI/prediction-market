// src/app/home/components/Hero.tsx
'use client';

import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Container,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import NextLink from 'next/link';
import { FaRocket, FaChartLine } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const floatingAnimation = {
  y: ['0%', '-5%', '0%'],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export default function Hero() {
  const controls = useAnimation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('purple.500', 'purple.300');

  React.useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <Box bg={bgColor} position="relative" overflow="hidden">
      <Container maxW="container.xl" py={20}>
        <VStack spacing={10} align="center" position="relative">
          <MotionBox
            initial={{ opacity: 0, y: -50 }}
            animate={controls}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MotionHeading
              as="h1"
              size="4xl"
              fontWeight="extrabold"
              textAlign="center"
              bgGradient={`linear(to-r, ${accentColor}, blue.400)`}
              bgClip="text"
              mb={4}
            >
              Build your AI Prediction Market
            </MotionHeading>
            <MotionText
              fontSize="2xl"
              color={textColor}
              textAlign="center"
              maxW="3xl"
              mx="auto"
            >
              Shape the future with your insights on our cutting-edge prediction platform.
              Grow your influence, not your overhead.
            </MotionText>
          </MotionBox>

          <HStack spacing={6} justify="center">
            <MotionButton
              as={NextLink}
              href="/markets"
              colorScheme="purple"
              size="lg"
              rightIcon={<Icon as={FaRocket} />}
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="bold"
              borderRadius="full"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(138, 43, 226, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              animate={controls}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Explore Markets
            </MotionButton>
            <MotionButton
              as={NextLink}
              href="/create-market"
              colorScheme="blue"
              size="lg"
              rightIcon={<Icon as={FaChartLine} />}
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="bold"
              borderRadius="full"
              variant="outline"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(66, 153, 225, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              animate={controls}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Create Market
            </MotionButton>
          </HStack>
        </VStack>
      </Container>

      {/* Decorative elements */}
      <MotionBox
        position="absolute"
        top="-5%"
        left="-5%"
        w="20%"
        h="20%"
        borderRadius="full"
        bgGradient="linear(to-r, purple.200, blue.200)"
        filter="blur(60px)"
        opacity={0.4}
        animate={floatingAnimation}
      />
      <MotionBox
        position="absolute"
        bottom="-5%"
        right="-5%"
        w="25%"
        h="25%"
        borderRadius="full"
        bgGradient="linear(to-l, purple.200, blue.200)"
        filter="blur(80px)"
        opacity={0.3}
        animate={floatingAnimation}
      />
    </Box>
  );
}