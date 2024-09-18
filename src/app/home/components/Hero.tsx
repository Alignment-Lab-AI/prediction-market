// src/app/home/components/Hero.tsx
'use client';

import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Stack,
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
      <Container maxW="container.xl" py={{ base: 10, md: 20 }}>
        <VStack spacing={{ base: 6, md: 10 }} align="center" position="relative">
          <MotionBox
            initial={{ opacity: 0, y: -50 }}
            animate={controls}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MotionHeading
              as="h1"
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
              fontWeight="extrabold"
              textAlign="center"
              bgGradient={`linear(to-r, ${accentColor}, blue.400)`}
              bgClip="text"
              mb={{ base: 2, md: 4 }}
              lineHeight="shorter"
            >
              Predict the Future,<br />Profit Today
            </MotionHeading>
            <MotionText
              fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
              color={textColor}
              textAlign="center"
              maxW="3xl"
              mx="auto"
              px={{ base: 4, md: 0 }}
            >
              Welcome to PredictX, where your insights shape tomorrow&apos;s markets. 
              Harness the power of collective intelligence and turn your predictions into profitable opportunities.
            </MotionText>
          </MotionBox>

          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={{ base: 4, md: 6 }}
            justify="center"
            width="100%"
          >
            <MotionButton
              as={NextLink}
              href="/markets"
              colorScheme="purple"
              size="lg"
              rightIcon={<Icon as={FaRocket} />}
              px={{ base: 6, md: 8 }}
              py={{ base: 6, md: 7 }}
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="bold"
              borderRadius="full"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(138, 43, 226, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              animate={controls}
              transition={{ duration: 0.5, delay: 0.4 }}
              width={{ base: "full", md: "auto" }}
            >
              Explore Markets
            </MotionButton>
            <MotionButton
              as={NextLink}
              href="/create-market"
              colorScheme="blue"
              size="lg"
              rightIcon={<Icon as={FaChartLine} />}
              px={{ base: 6, md: 8 }}
              py={{ base: 6, md: 7 }}
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="bold"
              borderRadius="full"
              variant="outline"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(66, 153, 225, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              animate={controls}
              transition={{ duration: 0.5, delay: 0.5 }}
              width={{ base: "full", md: "auto" }}
            >
              Create Market
            </MotionButton>
          </Stack>
        </VStack>
      </Container>

      {/* Decorative elements */}
      <MotionBox
        position="absolute"
        top={{ base: "-10%", md: "-5%" }}
        left={{ base: "-20%", md: "-5%" }}
        w={{ base: "50%", md: "20%" }}
        h={{ base: "50%", md: "20%" }}
        borderRadius="full"
        bgGradient="linear(to-r, purple.200, blue.200)"
        filter="blur(60px)"
        opacity={0.4}
        animate={floatingAnimation}
        display={{ base: "none", md: "block" }}
      />
      <MotionBox
        position="absolute"
        bottom={{ base: "-10%", md: "-5%" }}
        right={{ base: "-20%", md: "-5%" }}
        w={{ base: "50%", md: "25%" }}
        h={{ base: "50%", md: "25%" }}
        borderRadius="full"
        bgGradient="linear(to-l, purple.200, blue.200)"
        filter="blur(80px)"
        opacity={0.3}
        animate={floatingAnimation}
        display={{ base: "none", md: "block" }}
      />
    </Box>
  );
}