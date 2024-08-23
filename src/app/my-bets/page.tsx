'use client';

import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  extendTheme,
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Avatar,
  AvatarBadge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  Icon,
  Progress,
  Tooltip,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { FaCoins, FaTrophy, FaHistory, FaChartLine, FaExchangeAlt, FaStar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      500: '#319795',
      900: '#234E52',
    },
  },
});

const MotionBox = motion(Box);

interface Bet {
  id: number;
  bettor: string;
  market_id: number;
  option_index: number;
  position: string;
  amount: string;
  matched_amount: string;
  odds: string;
  redeemed: boolean;
}

interface Market {
  id: number;
  question: string;
  status: string;
}

const userProfile = {
  name: "Crypto Enthusiast",
  walletAddress: "comdex1nh4gxgzq7hw8fvtkxjg4kpfqmsq65szqxxdqye",
  joinDate: "Nov 2023",
  avatar: "https://bit.ly/broken-link",
  level: 5,
  xp: 750,
  nextLevelXp: 1000,
};

const MyBetsPage = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [markets, setMarkets] = useState<{ [key: number]: Market }>({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const betsResponse = await axios.get<Bet[]>('http://localhost:3001/api/user-bets/comdex1nh4gxgzq7hw8fvtkxjg4kpfqmsq65szqxxdqye');
        setBets(betsResponse.data);

        const marketIds = [...new Set(betsResponse.data.map(bet => bet.market_id))];
        const marketPromises = marketIds.map(id => axios.get<Market>(`http://localhost:3001/api/market/${id}`));
        const marketResponses = await Promise.all(marketPromises);
        const marketData = marketResponses.reduce((acc, response) => {
          acc[response.data.id] = response.data;
          return acc;
        }, {} as { [key: number]: Market });
        setMarkets(marketData);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast({
          title: "Error fetching data",
          description: "There was an error loading your bets. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const activeBets = bets.filter(bet => !bet.redeemed);
  const pastBets = bets.filter(bet => bet.redeemed);

  const totalBets = bets.length;
  const currentBalance = bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
  const profitLoss = pastBets.reduce((sum, bet) => sum + (parseFloat(bet.amount) * parseFloat(bet.odds) - parseFloat(bet.amount)), 0);

  const cancelBet = async (betId: number) => {
    toast({
      title: "Bet Cancelled",
      description: `Bet ${betId} has been cancelled.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setBets(bets.filter(bet => bet.id !== betId));
  };

  const redeemBet = async (betId: number) => {
    toast({
      title: "Bet Redeemed",
      description: `Bet ${betId} has been redeemed.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setBets(bets.map(bet => bet.id === betId ? {...bet, redeemed: true} : bet));
  };

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Box>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box bg={bgColor} minHeight="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            {/* User Profile Header */}
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" bg={cardBgColor} p={6} borderRadius="lg" boxShadow="xl">
                <HStack spacing={4}>
                  <Avatar size="xl" name={userProfile.name} src={userProfile.avatar}>
                    <AvatarBadge boxSize="1.25em" bg="green.500" />
                  </Avatar>
                  <VStack align="start" spacing={1}>
                    <Heading size="xl" color={textColor}>{userProfile.name}</Heading>
                    <Text color="gray.500" fontSize="sm">{userProfile.walletAddress}</Text>
                    <Text color="gray.500" fontSize="sm">Joined {userProfile.joinDate}</Text>
                    <HStack>
                      <Badge colorScheme="purple">Level {userProfile.level}</Badge>
                      {[...Array(3)].map((_, i) => (
                        <Icon key={i} as={FaStar} color="yellow.400" />
                      ))}
                    </HStack>
                  </VStack>
                </HStack>
                <VStack align="end" spacing={2}>
                  <CircularProgress value={(userProfile.xp / userProfile.nextLevelXp) * 100} color="green.400" size="100px">
                    <CircularProgressLabel>{userProfile.level}</CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="sm" color="gray.500">XP: {userProfile.xp} / {userProfile.nextLevelXp}</Text>
                </VStack>
              </Flex>
            </MotionBox>

            {/* Statistics Grid */}
            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={6}>
              {[
                { label: 'Positions value', icon: FaChartLine, value: `$${(currentBalance / 1000000).toFixed(2)}`, color: 'blue.500' },
                { label: 'Profit/loss', icon: FaExchangeAlt, value: `$${(profitLoss / 1000000).toFixed(2)}`, color: profitLoss >= 0 ? 'green.500' : 'red.500', percentage: ((profitLoss / currentBalance) * 100).toFixed(2) },
                { label: 'Volume traded', icon: FaCoins, value: `$${(currentBalance / 1000000).toFixed(2)}`, color: 'yellow.500' },
                { label: 'Markets traded', icon: FaHistory, value: Object.keys(markets).length, color: 'purple.500' },
              ].map((stat, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Stat px={4} py={5} height="150px" shadow="xl" border="1px solid" borderColor={borderColor} rounded="lg" bg={cardBgColor}>
                    <StatLabel fontWeight="medium" isTruncated color={textColor}>
                      <HStack spacing={2}>
                        <Icon as={stat.icon} color={stat.color} />
                        <Text>{stat.label}</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="medium" color={stat.color}>
                      {typeof stat.value === 'number' ? stat.value : stat.value}
                    </StatNumber>
                    {stat.percentage && (
                      <StatHelpText>
                        <StatArrow type={parseFloat(stat.percentage) >= 0 ? 'increase' : 'decrease'} />
                        {stat.percentage}%
                      </StatHelpText>
                    )}
                  </Stat>
                </MotionBox>
              ))}
            </Grid>

            {/* Bets Tabs */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Tabs variant="soft-rounded" colorScheme="blue" bg={cardBgColor} borderRadius="lg" boxShadow="xl" p={4}>
                <TabList mb={4}>
                  <Tab>Active Bets</Tab>
                  <Tab>Past Bets</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Market</Th>
                          <Th>Amount</Th>
                          <Th>Odds</Th>
                          <Th>Potential Winnings</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {activeBets.map((bet) => (
                          <Tr key={bet.id}>
                            <Td>{markets[bet.market_id]?.question}</Td>
                            <Td>{(parseFloat(bet.amount) / 1000000).toFixed(2)} UCMDX</Td>
                            <Td>{bet.odds}</Td>
                            <Td>{((parseFloat(bet.amount) / 1000000) * parseFloat(bet.odds)).toFixed(2)} UCMDX</Td>
                            <Td>
                              <HStack spacing={2}>
                                <Tooltip label="Cancel this bet">
                                  <Button colorScheme="red" size="sm" onClick={() => cancelBet(bet.id)}>
                                    <Icon as={FaTimesCircle} mr={2} />
                                    Cancel
                                  </Button>
                                </Tooltip>
                                <Tooltip label={markets[bet.market_id]?.status === 'Settled' ? 'Redeem your winnings!' : 'Market not yet settled'}>
                                  <Button
                                    colorScheme="green"
                                    size="sm"
                                    onClick={() => redeemBet(bet.id)}
                                    isDisabled={markets[bet.market_id]?.status !== 'Settled'}
                                    opacity={markets[bet.market_id]?.status === 'Settled' ? 1 : 0.5}
                                  >
                                    <Icon as={FaCheckCircle} mr={2} />
                                    Redeem
                                  </Button>
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TabPanel>

                  <TabPanel>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Market</Th>
                          <Th>Amount</Th>
                          <Th>Odds</Th>
                          <Th>Outcome</Th>
                          <Th>Winnings</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {pastBets.map((bet) => (
                          <Tr key={bet.id}>
                            <Td>{markets[bet.market_id]?.question}</Td>
                            <Td>{(parseFloat(bet.amount) / 1000000).toFixed(2)} UCMDX</Td>
                            <Td>{bet.odds}</Td>
                            <Td>
                              <Badge colorScheme={bet.redeemed ? 'green' : 'red'}>
                                {bet.redeemed ? 'Won' : 'Lost'}
                              </Badge>
                            </Td>
                            <Td>{bet.redeemed ? ((parseFloat(bet.amount) / 1000000) * parseFloat(bet.odds)).toFixed(2) : '0'} UCMDX</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </MotionBox>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default MyBetsPage;