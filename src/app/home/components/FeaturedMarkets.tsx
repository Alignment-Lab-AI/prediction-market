// src/app/home/components/FeaturedMarkets.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Flex,
  useColorModeValue,
  Badge,
  chakra,
  Spinner,
} from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { FaGlobe, FaClock, FaCoins, FaRocket } from 'react-icons/fa';
import { useGlobalContext } from '../../../contexts/GlobalContext';
import Link from 'next/link';
import axios from 'axios';
import { encodeQuery } from '../../../utils/queryUtils';


const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const GlassBox = chakra(Box, {
  baseStyle: {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 'xl',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
  },
});

const getTimeRemaining = (endTime) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = parseInt(endTime) - now;
  
  if (timeLeft <= 0) return 'Ended';
  
  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  
  if (days > 0) return `${days} days remaining`;
  if (hours > 0) return `${hours} hours remaining`;
  return 'Ending soon';
};

const MarketCard = ({ market }) => {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = React.useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('gray.50', 'white');

  React.useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  const timeInfo = getTimeRemaining(market.end_time);

  return (
    <Link href={`/market/${market.id}`} passHref>
      <MotionBox
        as="a"
        whileHover={{ 
          y: -10, 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          transition: { duration: 0.3, ease: 'easeOut' }
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        transition={{ duration: 0.5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <GlassBox
          h="310px"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          position="relative"
          overflow="hidden"
          bg={cardBg}
          _hover={{
            transform: 'translateY(-10px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          }}
        >
          <VStack align="stretch" p={6} spacing={4}>
            <MotionHeading 
              size="md" 
              noOfLines={2}
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
              fontWeight="extrabold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {market.question}
            </MotionHeading>
            <MotionText 
              fontSize="sm" 
              color={mutedTextColor}
              noOfLines={2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {market.description}
            </MotionText>
            <HStack spacing={4} justifyContent="space-between">
              <HStack>
                <Icon as={FaGlobe} color="blue.500" />
                <Text fontSize="xs" color="blue.500" fontWeight="bold">
                  {market.options.length} options
                </Text>
              </HStack>
              <HStack>
                <Icon as={FaClock} color="purple.500" />
                <Text fontSize="xs" color="purple.500" fontWeight="bold">
                  {timeInfo}
                </Text>
              </HStack>
            </HStack>
          </VStack>
          
          <Flex direction="column" justify="flex-end" p={4} bg={useColorModeValue('gray.50', 'gray.700')} mt="auto">
            <HStack justify="space-between" mb={4}>
              <HStack>
                <Icon as={FaCoins} color="yellow.500" />
                <Text fontSize="sm" fontWeight="bold" color={textColor}>
                  {(parseInt(market.resolution_bond) / 1000000).toLocaleString()} CMDX
                </Text>
              </HStack>
              <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2}>
                Active
              </Badge>
            </HStack>
            <MotionButton
              as={MotionButton}
              size="md"
              colorScheme="blue"
              rightIcon={<FaRocket />}
              borderRadius="full"
              fontWeight="bold"
              boxShadow="md"
              width="100%"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 6px 20px rgba(66, 153, 225, 0.4)',
              }}
              whileTap={{ scale: 0.95 }}
              animate={isHovered ? { y: [-2, 2, -2], transition: { repeat: Infinity, duration: 1 } } : {}}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/market/${market.id}`;
              }}
            >
              Trade Now
            </MotionButton>
          </Flex>
        </GlassBox>
      </MotionBox>
    </Link>
  );
};

export default function FeaturedMarkets() {
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const controls = useAnimation();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white'); // Changed this line

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
        const query = {
          markets: {
            status: "Active",
            start_after: 0,
            limit: 3
          }
        };
        const encodedQuery = encodeQuery(query);
  
        const response = await axios.get(
          `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
        );
        setMarkets(response.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching markets:", error);
        setError("Failed to fetch markets. Please try again later.");
        setIsLoading(false);
      }
    };
  
    fetchMarkets();
  }, []);

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  // Even if there's an error or no markets, we'll still render the component
  // This ensures the homepage doesn't break
  return (
    <Box py={20} bg="transparent">
       <MotionHeading
        as="h2"
        size="2xl"
        mb={10}
        textAlign="center"
        bgGradient="linear(to-r, blue.400, purple.500)"
        bgClip="text"
        fontWeight="extrabold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        >
        Featured Markets
        </MotionHeading>
      {error ? (
        <Text textAlign="center" color="gray.600">
          {error}
        </Text>
      ) : markets.length === 0 ? (
        <Text textAlign="center" color="gray.600">
          No markets available at the moment.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {markets.map((market, index) => (
            <MotionBox
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MarketCard market={market} />
            </MotionBox>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}