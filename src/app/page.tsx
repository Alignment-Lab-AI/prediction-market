'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Flex,
  Badge,
  Tooltip,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  useToken,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import NextLink from 'next/link';
import axios from 'axios';
import { FaChartLine, FaUsers, FaCoins, FaRocket } from 'react-icons/fa';

// Types remain the same

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const AnimatedNumber = ({ value, duration = 2 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString().replace(/[^\d]/g, ''));
    const timer = setInterval(() => {
      start += end / duration;
      setDisplayValue(Math.floor(start));
      if (start >= end) clearInterval(timer);
    }, 50);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const MarketCard = ({ market, config }) => {
  const [blue500] = useToken('colors', ['blue.500']);

  return (
    <MotionBox
      whileHover={{ y: -5, boxShadow: `0 4px 20px ${blue500}30` }}
      transition={{ duration: 0.2 }}
    >
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        p={4}
        bg="white"
        h="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <VStack align="stretch" spacing={3}>
          <Heading size="md" noOfLines={2}>
            {market.question}
          </Heading>
          <Text fontSize="sm" color="gray.600" noOfLines={2}>
            {market.description}
          </Text>
        </VStack>
        <Flex justify="space-between" align="center" mt={4}>
          <HStack>
            <Badge colorScheme={market.status === 'Active' ? 'green' : 'red'}>
              {market.status}
            </Badge>
            <Text fontSize="xs" color="gray.500">
              Volume: {parseInt(market.collateral_amount).toLocaleString()} {config?.coin_denom}
            </Text>
          </HStack>
          <Button size="sm" colorScheme="blue">
            Trade
          </Button>
        </Flex>
      </Box>
    </MotionBox>
  );
};

const StatCard = ({ icon, label, value }) => (
  <MotionBox
    whileHover={{ y: -5, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
    transition={{ duration: 0.2 }}
  >
    <VStack
      spacing={2}
      p={6}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      align="center"
      h="100%"
    >
      <Box fontSize="3xl" color="blue.500">
        {icon}
      </Box>
      <Text fontWeight="bold" fontSize="xl">
        <AnimatedNumber value={value} />
      </Text>
      <Text color="gray.500">{label}</Text>
    </VStack>
  </MotionBox>
);

export default function Home() {
  const [markets, setMarkets] = useState([]);
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketsResponse, configResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/markets'),
          axios.get('http://localhost:3001/api/config')
        ]);
        setMarkets(marketsResponse.data);
        setConfig(configResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalMarkets = markets.length;
  const totalVolume = markets.reduce((sum, market) =>
    sum + parseInt(market.collateral_amount), 0);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Center>
    );
  }

  return (
    <Box bg="gray.50" minHeight="100vh">
      <Container maxW="container.xl" py={10}>
        <VStack spacing={16} align="stretch">
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
          >
            <Heading as="h1" size="3xl" mb={4} bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Predict the Future, Shape Reality
            </Heading>
            <Text fontSize="xl" mb={8} color="gray.600">
              Explore markets, trade outcomes, and earn rewards in our decentralized prediction platform
            </Text>
            <HStack justifyContent="center" spacing={6}>
              <NextLink href="/markets" passHref legacyBehavior>
                <Button
                  as="a"
                  colorScheme="blue"
                  size="lg"
                  rightIcon={<FaRocket />}
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                >
                  Explore Markets
                </Button>
              </NextLink>
              <NextLink href="/create-market" passHref legacyBehavior>
                <Button
                  as="a"
                  colorScheme="purple"
                  size="lg"
                  rightIcon={<FaChartLine />}
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                >
                  Create Market
                </Button>
              </NextLink>
            </HStack>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <StatCard
              icon={<FaChartLine />}
              label="Total Markets"
              value={totalMarkets}
            />
            <StatCard
              icon={<FaCoins />}
              label={`Total Volume (${config?.coin_denom})`}
              value={totalVolume}
            />
            <StatCard
              icon={<FaUsers />}
              label="Platform Fee"
              value={`${((config?.platform_fee || 0) / 100).toFixed(2)}%`}
            />
          </SimpleGrid>

          <Box>
            <Heading as="h2" size="xl" mb={8} textAlign="center" color="gray.700">
              Featured Markets
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {markets.slice(0, 3).map((market) => (
                <MarketCard key={market.id} market={market} config={config} />
              ))}
            </SimpleGrid>
          </Box>

          <Box>
            <Heading as="h2" size="xl" mb={8} textAlign="center" color="gray.700">
              Recent Events
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {[1, 2, 3, 4].map((_, index) => (
                <MotionBox
                  key={index}
                  whileHover={{ y: -5, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    p={4}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="md"
                  >
                    <HStack spacing={4}>
                      <Box color="blue.500" fontSize="2xl">
                        <FaRocket />
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">New Market Created</Text>
                        <Text fontSize="sm" color="gray.600">
                          "Will humans establish a permanent base on Mars by 2030?"
                        </Text>
                        <Text fontSize="xs" color="gray.500">2 hours ago</Text>
                      </VStack>
                    </HStack>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}