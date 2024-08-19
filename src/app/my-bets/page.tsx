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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Progress,
  Tooltip,
} from '@chakra-ui/react';
import { FaCoins, FaTrophy, FaTimesCircle, FaHistory, FaChartLine, FaExchangeAlt, FaFire, FaStar } from 'react-icons/fa';
import axios from 'axios';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

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
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Box>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box bg="gray.50" minHeight="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            {/* User Profile Header */}
            <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" bg="white" p={6} borderRadius="lg" boxShadow="md">
              <HStack spacing={4}>
                <Avatar size="xl" name={userProfile.name} src={userProfile.avatar}>
                  <AvatarBadge boxSize="1.25em" bg="green.500" />
                </Avatar>
                <VStack align="start" spacing={1}>
                  <Heading size="xl">{userProfile.name}</Heading>
                  <Text color="gray.500" fontSize="sm">{userProfile.walletAddress}</Text>
                  <Text color="gray.500" fontSize="sm">Joined {userProfile.joinDate}</Text>
                  <HStack>
                    <Badge colorScheme="purple">Level {userProfile.level}</Badge>
                    <Icon as={FaStar} color="yellow.400" />
                    <Icon as={FaStar} color="yellow.400" />
                    <Icon as={FaStar} color="yellow.400" />
                  </HStack>
                </VStack>
              </HStack>
              <VStack align="end" spacing={2}>
                <Button colorScheme="blue" size="lg" leftIcon={<FaFire />} onClick={onOpen}>
                  Edit profile
                </Button>
                <Progress value={(userProfile.xp / userProfile.nextLevelXp) * 100} size="sm" width="200px" colorScheme="green" />
                <Text fontSize="sm" color="gray.500">XP: {userProfile.xp} / {userProfile.nextLevelXp}</Text>
              </VStack>
            </Flex>

            {/* Statistics Grid */}
            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={6}>
              {[
                { label: 'Positions value', icon: FaChartLine, value: `$${(currentBalance / 1000000).toFixed(2)}`, color: 'blue.500' },
                { label: 'Profit/loss', icon: FaExchangeAlt, value: `$${(profitLoss / 1000000).toFixed(2)}`, color: profitLoss >= 0 ? 'green.500' : 'red.500', percentage: ((profitLoss / currentBalance) * 100).toFixed(2) },
                { label: 'Volume traded', icon: FaCoins, value: `$${(currentBalance / 1000000).toFixed(2)}`, color: 'yellow.500' },
                { label: 'Markets traded', icon: FaHistory, value: Object.keys(markets).length, color: 'purple.500' },
              ].map((stat, index) => (
                <GridItem key={index}>
                  <Stat px={4} py={5} height="150px" shadow="xl" border="1px solid" borderColor="gray.200" rounded="lg" bg="white">
                    <StatLabel fontWeight="medium" isTruncated>
                      <HStack spacing={2}>
                        <Icon as={stat.icon} color={stat.color} />
                        <Text>{stat.label}</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="medium">
                      {typeof stat.value === 'number' ? stat.value : stat.value}
                    </StatNumber>
                    {stat.percentage && (
                      <StatHelpText>
                        <StatArrow type={parseFloat(stat.percentage) >= 0 ? 'increase' : 'decrease'} />
                        {stat.percentage}%
                      </StatHelpText>
                    )}
                  </Stat>
                </GridItem>
              ))}
            </Grid>

            {/* Bets Tabs */}
            <Tabs variant="enclosed" colorScheme="blue" bg="white" borderRadius="lg" boxShadow="md">
              <TabList>
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
                              <Button colorScheme="red" size="sm" onClick={() => cancelBet(bet.id)}>
                                Cancel
                              </Button>
                              <Tooltip label={markets[bet.market_id]?.status === 'Settled' ? 'Redeem your winnings!' : 'Market not yet settled'}>
                                <Button
                                  colorScheme="green"
                                  size="sm"
                                  onClick={() => redeemBet(bet.id)}
                                  isDisabled={markets[bet.market_id]?.status !== 'Settled'}
                                  opacity={markets[bet.market_id]?.status === 'Settled' ? 1 : 0.5}
                                >
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
          </VStack>
        </Container>
      </Box>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>This feature is not yet implemented. In a real application, you would be able to edit your profile details here.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default MyBetsPage;