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
  Image,
  Divider,
  Progress,
  Icon,
  CircularProgress,
  CircularProgressLabel,
  Wrap,
  WrapItem,
  keyframes,
  Circle,
  Link,
  IconButton,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import NextLink from 'next/link';
import axios from 'axios';
import { FaChartLine, FaUsers, FaCoins, FaRocket, FaBrain, FaTrophy, FaFireAlt, FaLightbulb, FaGlobe, FaClock } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.6); }
  50% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.8); }
  100% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.6); }
`;

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
        borderRadius="xl"
        overflow="hidden"
        bg="white"
        h="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        position="relative"
        boxShadow="lg"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'xl',
          padding: '2px',
          background: 'linear-gradient(45deg, #3182ce, #805ad5)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <Box 
          position="absolute" 
          top="0" 
          right="0" 
          bg={market.status === 'Active' ? 'green.500' : 'red.500'} 
          color="white" 
          px={3}
          py={1}
          borderBottomLeftRadius="md"
          fontWeight="bold"
          fontSize="sm"
        >
          {market.status}
        </Box>
        <VStack align="stretch" p={6} spacing={4}>
          <Heading size="md" noOfLines={2}>
            {market.question}
          </Heading>
          <Text fontSize="sm" color="gray.600" noOfLines={2}>
            {market.description}
          </Text>
          <HStack>
            <Icon as={FaGlobe} color="blue.500" />
            <Text fontSize="xs" color="blue.500" fontWeight="bold">
              {Math.floor(Math.random() * 1000) + 100} participants
            </Text>
          </HStack>
          <HStack>
            <Icon as={FaClock} color="purple.500" />
            <Text fontSize="xs" color="purple.500" fontWeight="bold">
              Ends in {Math.floor(Math.random() * 30) + 1} days
            </Text>
          </HStack>
        </VStack>
        <Divider />
        <Flex justify="space-between" align="center" p={4}>
          <HStack>
            <Icon as={FaCoins} color="yellow.500" />
            <Text fontSize="sm" fontWeight="bold">
              {(parseInt(market.collateral_amount) / 1000000).toLocaleString()} {config?.coin_denom}
            </Text>
          </HStack>
          <Button
            size="sm"
            colorScheme="blue"
            rightIcon={<FaRocket />}
            borderRadius="full"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'xl',
            }}
          >
            Trade Now
          </Button>
        </Flex>
      </Box>
    </MotionBox>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <MotionBox
    whileHover={{ y: -5, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
    transition={{ duration: 0.2 }}
  >
    <VStack
      spacing={4}
      p={6}
      bg="white"
      borderRadius="xl"
      boxShadow="lg"
      align="center"
      h="100%"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="4px"
        bgGradient={`linear(to-r, ${color}, ${color})`}
      />
        <Box fontSize="3xl" color={color}>
          {icon}
        </Box>
      <Text fontWeight="bold" fontSize="2xl">
        <AnimatedNumber value={value} />
      </Text>
      <Text color="gray.600" fontWeight="medium">{label}</Text>
    </VStack>
  </MotionBox>
);

const FeatureCard = ({ icon, title, description }) => (
  <MotionBox
    whileHover={{ y: -5, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
    transition={{ duration: 0.2 }}
  >
    <VStack
      spacing={4}
      p={6}
      bg="white"
      borderRadius="xl"
      boxShadow="lg"
      align="center"
      h="100%"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-20px"
        left="-20px"
        w="100px"
        h="100px"
        bg="blue.50"
        borderRadius="full"
        opacity="0.5"
      />
      <Box fontSize="4xl" color="blue.500" position="relative" zIndex={1}>
        {icon}
      </Box>
      <Text fontWeight="bold" fontSize="xl" position="relative" zIndex={1}>
        {title}
      </Text>
      <Text textAlign="center" color="gray.600" position="relative" zIndex={1}>
        {description}
      </Text>
      <Box
        position="absolute"
        bottom="-10px"
        right="-10px"
        w="80px"
        h="80px"
        bg="purple.50"
        borderRadius="full"
        opacity="0.5"
      />
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
        <Spinner size="xl" color="blue.500" thickness="4px" />
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
        <VStack spacing={20} align="stretch">
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
          >
            <Heading as="h1" size="4xl" mb={6} bgGradient="linear(to-r, blue.400, purple.500, pink.500)" bgClip="text" fontWeight="extrabold">
              Predict • Trade • Earn
            </Heading>
            <Text fontSize="2xl" mb={10} color="gray.600">
              Shape the future with your insights on our cutting-edge prediction platform
            </Text>
            <Wrap spacing={6} justify="center">
              <WrapItem>
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
                    borderRadius="full"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'xl',
                    }}
                    animation={`${glowAnimation} 2s infinite`}
                  >
                    Explore Markets
                  </Button>
                </NextLink>
              </WrapItem>
              <WrapItem>
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
                    borderRadius="full"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'xl',
                    }}
                  >
                    Create Market
                  </Button>
                </NextLink>
              </WrapItem>
            </Wrap>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={10}>
            <StatCard
              icon={<FaChartLine />}
              label="Total Markets"
              value={totalMarkets}
              color="blue.500"
            />
            <StatCard
              icon={<FaCoins />}
              label={`Total Volume`}
              value={(totalVolume / 1000000).toFixed(2)}
              color="yellow.500"
            />
            <StatCard
              icon={<FaUsers />}
              label="Active Users"
              value={1234}
              color="green.500"
            />
            <StatCard
              icon={<FaTrophy />}
              label="Total Rewards"
              value={(totalVolume / 20000000).toFixed(2)}
              color="purple.500"
            />
          </SimpleGrid>

          <Box>
            <Heading as="h2" size="2xl" mb={10} textAlign="center" color="gray.800">
              Featured Markets
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              {markets.slice(0, 3).map((market) => (
                <MarketCard key={market.id} market={market} config={config} />
              ))}
            </SimpleGrid>
          </Box>

          <Box>
            <Heading as="h2" size="2xl" mb={10} textAlign="center" color="gray.800">
              Why Your Opinion Shapes the Future
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              <FeatureCard 
                icon={<FaBrain />}
                title="Collective Intelligence"
                description="Your predictions contribute to a powerful swarm intelligence, shaping global outcomes."
              />
              <FeatureCard 
                icon={<FaFireAlt />}
                title="Earn Real Rewards"
                description="Convert your foresight into tangible cryptocurrency rewards. The more accurate, the more you earn."
              />
              <FeatureCard 
                icon={<FaLightbulb />}
                title="Influence Reality"
                description="Your insights don't just predict the future—they help create it. Be a part of shaping tomorrow."
              />
            </SimpleGrid>
          </Box>

          <Box 
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
            p={12} 
            borderRadius="2xl"
            boxShadow="2xl"
          >
            <VStack spacing={6} color="white">
              <Heading as="h2" size="2xl" textAlign="center">
                Start Your Prediction Journey
              </Heading>
              <Text fontSize="xl" textAlign="center" maxW="2xl">
                Join thousands of visionaries and start earning rewards for your insights today!
              </Text>
              <Button
                colorScheme="whiteAlpha"
                size="lg"
                rightIcon={<FaRocket />}
                px={10}
                py={7}
                fontSize="lg"
                fontWeight="bold"
                borderRadius="full"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'xl',
                }}
                transition="all 0.2s"
              >
                Sign Up Now
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>

      {/* New section: Latest Predictions */}
      <Box bg="white" py={20}>
        <Container maxW="container.xl">
          <Heading as="h2" size="2xl" mb={10} textAlign="center" color="gray.800">
            Latest Predictions
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            {[1, 2, 3, 4].map((_, index) => (
              <MotionBox
                key={index}
                whileHover={{ y: -5, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  p={6}
                  borderRadius="xl"
                  boxShadow="md"
                  bg="gray.50"
                  position="relative"
                  overflow="hidden"
                >
                  <Box
                    position="absolute"
                    top="-20px"
                    left="-20px"
                    w="100px"
                    h="100px"
                    bg="blue.50"
                    borderRadius="full"
                    opacity="0.5"
                  />
                  <Text fontWeight="bold" mb={2}>User{index + 1}</Text>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    Predicted: "Bitcoin will reach $100k by end of 2024"
                  </Text>
                  <HStack justify="space-between">
                    <Badge colorScheme="green">90% Confidence</Badge>
                    <Text fontSize="xs" color="gray.500">2 hours ago</Text>
                  </HStack>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* New section: How It Works */}
      <Box bg="gray.50" py={20}>
        <Container maxW="container.xl">
          <Heading as="h2" size="2xl" mb={10} textAlign="center" color="gray.800">
            How It Works
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {[
              { title: "Create or Join a Market", icon: FaChartLine, description: "Choose from existing markets or create your own prediction challenge." },
              { title: "Make Your Prediction", icon: FaBrain, description: "Use your knowledge and intuition to forecast the outcome." },
              { title: "Earn Rewards", icon: FaCoins, description: "Get rewarded for accurate predictions with cryptocurrency." }
            ].map((step, index) => (
              <VStack key={index} align="center" spacing={4}>
                <Circle size="100px" bg="blue.500" color="white">
                  <Icon as={step.icon} boxSize={10} />
                </Circle>
                <Text fontWeight="bold" fontSize="xl">{step.title}</Text>
                <Text textAlign="center" color="gray.600">{step.description}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
}