// src/app/home/components/CallToAction.tsx
'use client';

import React from 'react';
import { Box, VStack, Heading, Text, Button, Icon, useColorModeValue } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { FaRocket, FaChartLine } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

export default function CallToAction() {
  const controls = useAnimation();
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.500, purple.600)',
    'linear(to-br, blue.700, purple.800)'
  );
  const textColor = useColorModeValue('purple.800', 'gray.100');
  const buttonBgGradient = useColorModeValue(
    'linear(to-r, blue.400, purple.500)',
    'linear(to-r, blue.500, purple.600)'
  );
  const buttonHoverBgGradient = useColorModeValue(
    'linear(to-r, blue.500, purple.600)',
    'linear(to-r, blue.600, purple.700)'
  );


  React.useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
      bg={bgGradient}
      p={{ base: 10, md: 20 }}
      borderRadius="3xl"
      boxShadow="2xl"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-50%"
        left="-10%"
        w="120%"
        h="200%"
        bg="rgba(255,255,255,0.1)"
        transform="rotate(-12deg)"
        zIndex={0}
      />
      <VStack spacing={10} color={textColor} position="relative" zIndex={1}>
        <MotionHeading
          as="h2"
          size="3xl"
          textAlign="center"
          fontWeight="extrabold"
          bgGradient="linear(to-r, purple.500, blue.500)"
          bgClip="text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
            Unleash Your Predictive Power
        </MotionHeading>
        <MotionText
          fontSize="xl"
          textAlign="center"
          maxW="2xl"
          color={textColor}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Join PredictX today and transform your foresight into tangible rewards. Our AI-driven platform empowers you to make informed predictions and profit from your knowledge.        </MotionText>
        <MotionButton
          as={MotionButton}
          size="lg"
          leftIcon={<Icon as={FaRocket} />}
          rightIcon={<Icon as={FaChartLine} />}
          px={10}
          py={7}
          fontSize="xl"
          fontWeight="bold"
          borderRadius="full"
          color="white"
          bgGradient={buttonBgGradient}
          _hover={{
            bgGradient: buttonHoverBgGradient,
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px rgba(0, 0, 255, 0.2)',
          }}
          _active={{
            transform: 'translateY(0)',
            boxShadow: '0 5px 10px rgba(0, 0, 255, 0.2)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Launch Your Trading Journey
        </MotionButton>
      </VStack>
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        w="30%"
        h="40%"
        bgGradient="radial(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)"
        zIndex={0}
      />
      <MotionBox
        position="absolute"
        top="10%"
        left="5%"
        w="20px"
        h="20px"
        borderRadius="full"
        bg="blue.300"
        initial={{ opacity: 0.5 }}
        animate={{ 
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <MotionBox
        position="absolute"
        bottom="15%"
        right="10%"
        w="15px"
        h="15px"
        borderRadius="full"
        bg="purple.300"
        initial={{ opacity: 0.5 }}
        animate={{ 
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
    </MotionBox>
  );
}