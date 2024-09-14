'use client';

import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  extendTheme,
  Box,
  Container,
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  Icon,
  Tooltip,
  useColorModeValue,
  Text,
  Heading,
} from '@chakra-ui/react';
import { FaCoins, FaTrophy, FaHistory, FaChartLine, FaExchangeAlt, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useWeb3 } from '../../contexts/Web3Context';
import { connectKeplr, broadcastTransaction } from '../../utils/web3';
import { encodeQuery } from '../../utils/queryUtils';

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

interface Order {
  id: number;
  market_id: number;
  creator: string;
  option_id: number;
  side: 'Back' | 'Lay';
  amount: string;
  odds: number;
  filled_amount: string;
  status: string;
  timestamp: number;
}

interface MatchedBet {
  id: number;
  market_id: number;
  option_id: number;
  amount: string;
  odds: number;
  timestamp: number;
  back_user: string;
  lay_user: string;
  redeemed: boolean;
}

interface Market {
  id: number;
  question: string;
  status: string;
}

const MyBetsPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [matchedBets, setMatchedBets] = useState<MatchedBet[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startAfter, setStartAfter] = useState(0);
  const toast = useToast();
  const { isWalletConnected, walletAddress } = useWeb3();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const gradientColor = useColorModeValue("linear(to-r, blue.400, purple.500)", "linear(to-r, blue.200, purple.300)");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const Pagination = ({ items, currentPage, itemsPerPage, setCurrentPage }) => {
    const pageCount = Math.ceil(items.length / itemsPerPage);

    return (
      <Flex justifyContent="space-between" mt={4} alignItems="center">
        <Text>
          Showing {Math.min(currentPage * itemsPerPage, items.length)} of {items.length} items
        </Text>
        <HStack>
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            size="sm"
          >
            Previous
          </Button>
          <Text>{currentPage} / {pageCount}</Text>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
            disabled={currentPage === pageCount}
            size="sm"
          >
            Next
          </Button>
        </HStack>
      </Flex>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isWalletConnected || !walletAddress) {
        console.log("Wallet not connected");
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to view your bets.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching data...");
        const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        if (!REAL_BASE_URL || !CONTRACT_ADDRESS) {
          throw new Error("REST URL or Contract Address not defined in environment variables");
        }

        // Fetch all markets
        const marketsQuery = {
          markets: {
            status: "Active",
            start_after: startAfter,
            limit: 10
          }
        };
        const encodedMarketsQuery = encodeQuery(marketsQuery);
        console.log("Fetching markets with query:", encodedMarketsQuery);
        const marketsResponse = await axios.get(`${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedMarketsQuery}`);
        console.log("Markets response:", marketsResponse.data);
        const allMarkets: Market[] = marketsResponse.data.data;
        setMarkets(allMarkets);

        let allOrders: Order[] = [];
        let allMatchedBets: MatchedBet[] = [];

        // Fetch user orders and matched bets for each market
        for (const market of allMarkets) {
          const orderQuery = {
            user_orders: {
              user: walletAddress,
              market_id: market.id,
              start_after: 0,
              limit: 100
            }
          };
          const encodedOrderQuery = encodeQuery(orderQuery);
          console.log(`Fetching orders for market ${market.id} with query:`, encodedOrderQuery);
          
          const matchedBetQuery = {
            matched_bets: {
              market_id: market.id,
              user: walletAddress,
              start_after: 0,
              limit: 100
            }
          };
          const encodedMatchedBetQuery = encodeQuery(matchedBetQuery);
          console.log(`Fetching matched bets for market ${market.id} with query:`, encodedMatchedBetQuery);

          const [orderResponse, matchedBetResponse] = await Promise.all([
            axios.get(`${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedOrderQuery}`),
            axios.get(`${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedMatchedBetQuery}`)
          ]);

          console.log(`Orders response for market ${market.id}:`, orderResponse.data);
          console.log(`Matched bets response for market ${market.id}:`, matchedBetResponse.data);

          allOrders = [...allOrders, ...orderResponse.data.data];
          allMatchedBets = [...allMatchedBets, ...matchedBetResponse.data.data];
        }

        setOrders(allOrders);
        setMatchedBets(allMatchedBets);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError("There was an error loading your bets. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, isWalletConnected, walletAddress, startAfter]);

  const activeOrders = orders.filter(order => order.status === 'Open' || order.status === 'PartiallyFilled');
  const pastOrders = orders.filter(order => order.status !== 'Open' && order.status !== 'PartiallyFilled');

  const totalBets = orders.length + matchedBets.length;
  const currentBalance = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0) +
                         matchedBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
  const profitLoss = matchedBets.reduce((sum, bet) => {
    if (bet.redeemed) {
      return sum + (parseFloat(bet.amount) * (bet.odds / 100) - parseFloat(bet.amount));
    }
    return sum;
  }, 0);

  const cancelOrder = async (orderId: number) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to cancel an order.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!chainId || !contractAddress) {
        throw new Error("Chain ID or Contract address not defined in environment variables");
      }

      const msg = {
        cancel_order: {
          order_id: orderId
        }
      };

      console.log("Cancelling order with message:", msg);
      const result = await broadcastTransaction(chainId, contractAddress, msg, []);

      console.log("Order cancelled successfully:", result);

      toast({
        title: "Order Cancelled",
        description: `Order ${orderId} has been cancelled. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Update the local state to reflect the cancellation
      setOrders(orders.map(order => order.id === orderId ? {...order, status: 'Cancelled'} : order));
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast({
        title: "Error",
        description: "Failed to cancel order. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const redeemWinnings = async (matchedBetId: number) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to redeem winnings.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!chainId || !contractAddress) {
        throw new Error("Chain ID or Contract address not defined in environment variables");
      }

      const msg = {
        redeem_winnings: {
          matched_bet_id: matchedBetId
        }
      };

      console.log("Redeeming winnings with message:", msg);
      const result = await broadcastTransaction(chainId, contractAddress, msg, []);

      console.log("Winnings redeemed successfully:", result);

      toast({
        title: "Winnings Redeemed",
        description: `Winnings for matched bet ${matchedBetId} have been redeemed. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Update the local state to reflect the redemption
      setMatchedBets(matchedBets.map(bet => bet.id === matchedBetId ? {...bet, redeemed: true} : bet));
    } catch (err) {
      console.error("Error redeeming winnings:", err);
      toast({
        title: "Error",
        description: "Failed to redeem winnings. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Text color="red.500" fontSize="xl" fontWeight="bold">{error}</Text>
      </Box>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box bg="transparent" minHeight="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Heading textAlign="center" bgGradient={gradientColor} bgClip="text" fontSize="4xl" fontWeight="extrabold" mb={8}>
              My Bets Dashboard
            </Heading>
            
            {/* Statistics Grid */}
            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={6}>
              {[
                { label: 'Positions value', icon: FaChartLine, value: `$${(currentBalance / 1000000).toFixed(2)}`, color: 'blue.500' },
                { label: 'Profit/loss', icon: FaExchangeAlt, value: `$${(profitLoss / 1000000).toFixed(2)}`, color: profitLoss >= 0 ? 'green.500' : 'red.500', percentage: currentBalance > 0 ? ((profitLoss / currentBalance) * 100).toFixed(2) : '0' },
                { label: 'Volume traded', icon: FaCoins, value: `$${(currentBalance / 1000000).toFixed(2)}`, color: 'yellow.500' },
                { label: 'Markets traded', icon: FaHistory, value: new Set(orders.map(o => o.market_id)).size, color: 'purple.500' },
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
              <Tabs variant="soft-rounded" colorScheme="blue" bg={cardBgColor} borderRadius="xl" boxShadow="xl" p={6} onChange={() => setCurrentPage(1)}>
                <TabList mb={6}>
                  <Tab fontWeight="semibold">Active Orders</Tab>
                  <Tab fontWeight="semibold">Matched Bets</Tab>
                  <Tab fontWeight="semibold">Past Orders</Tab>
                </TabList>

                <TabPanels>
                <TabPanel>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Market</Th>
                        <Th>Side</Th>
                        <Th>Amount</Th>
                        <Th>Odds</Th>
                        <Th>Filled Amount</Th>
                        <Th>Timestamp</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                    {activeOrders
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((order) => (
                          <Tr key={order.id}>
                            <Td>{markets.find(m => m.id === order.market_id)?.question}</Td>
                            <Td>
                              <Badge colorScheme={order.side === 'Back' ? 'green' : 'red'}>
                                {order.side}
                              </Badge>
                            </Td>
                            <Td>{(parseFloat(order.amount) / 1000000).toFixed(2)} CMDX</Td>
                            <Td>{(order.odds / 100).toFixed(2)}</Td>
                            <Td>{(parseFloat(order.filled_amount) / 1000000).toFixed(2)} CMDX</Td>
                            <Td>{new Date(order.timestamp * 1000).toLocaleString()}</Td>
                            <Td>
                              <Button
                                onClick={() => cancelOrder(order.id)}
                                bgGradient="linear(to-r, red.400, pink.500)"
                                color="white"
                                _hover={{
                                  bgGradient: "linear(to-r, red.500, pink.600)",
                                  transform: 'translateY(-2px)',
                                  boxShadow: 'lg',
                                }}
                                _active={{
                                  transform: 'translateY(0)',
                                  boxShadow: 'md',
                                }}
                                size="sm"
                                fontWeight="bold"
                                borderRadius="full"
                                leftIcon={<FaTimesCircle />}
                              >
                                Cancel
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                  <Pagination 
                    items={activeOrders}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    setCurrentPage={setCurrentPage}
                  />
                </TabPanel>

                <TabPanel>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Market</Th>
                        <Th>Amount</Th>
                        <Th>Odds</Th>
                        <Th>Role</Th>
                        <Th>Status</Th>
                        <Th>Timestamp</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                    {matchedBets
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((bet) => {
                          const isBackUser = bet.back_user === walletAddress;
                          const market = markets.find(m => m.id === bet.market_id);
                          const marketResolved = market?.status === 'Resolved';
                          return (
                            <Tr key={bet.id}>
                              <Td>{market?.question}</Td>
                              <Td>{(parseFloat(bet.amount) / 1000000).toFixed(2)} CMDX</Td>
                              <Td>{(bet.odds / 100).toFixed(2)}</Td>
                              <Td>
                                <Badge colorScheme={isBackUser ? 'green' : 'red'}>
                                  {isBackUser ? 'Back' : 'Lay'}
                                </Badge>
                              </Td>
                              <Td>
                                {bet.redeemed ? (
                                  <Badge colorScheme="green">Redeemed</Badge>
                                ) : marketResolved ? (
                                  <Badge colorScheme="yellow">Ready to Redeem</Badge>
                                ) : (
                                  <Badge colorScheme="blue">Active</Badge>
                                )}
                              </Td>
                              <Td>{new Date(bet.timestamp * 1000).toLocaleString()}</Td>
                              <Td>
                                <Tooltip label={!marketResolved ? "Market not yet resolved" : bet.redeemed ? "Already redeemed" : "Redeem your winnings"}>
                                  <Button
                                    onClick={() => redeemWinnings(bet.id)}
                                    isDisabled={!marketResolved || bet.redeemed}
                                    bgGradient="linear(to-r, green.400, teal.500)"
                                    color="white"
                                    _hover={{
                                      bgGradient: "linear(to-r, green.500, teal.600)",
                                      transform: 'translateY(-2px)',
                                      boxShadow: 'lg',
                                    }}
                                    _active={{
                                      transform: 'translateY(0)',
                                      boxShadow: 'md',
                                    }}
                                    size="sm"
                                    fontWeight="bold"
                                    borderRadius="full"
                                    leftIcon={<FaCheckCircle />}
                                  >
                                    Redeem
                                  </Button>
                                </Tooltip>
                              </Td>
                            </Tr>
                          );
                        })}
                    </Tbody>
                  </Table>
                  <Pagination 
                    items={matchedBets}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    setCurrentPage={setCurrentPage}
                  />
                </TabPanel>

                <TabPanel>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Market</Th>
                      <Th>Side</Th>
                      <Th>Amount</Th>
                      <Th>Odds</Th>
                      <Th>Filled Amount</Th>
                      <Th>Status</Th>
                      <Th>Timestamp</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                  {pastOrders
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((order) => (
                        <Tr key={order.id}>
                          <Td>{markets.find(m => m.id === order.market_id)?.question}</Td>
                          <Td>
                            <Badge colorScheme={order.side === 'Back' ? 'green' : 'red'}>
                              {order.side}
                            </Badge>
                          </Td>
                          <Td>{(parseFloat(order.amount) / 1000000).toFixed(2)} CMDX</Td>
                          <Td>{(order.odds / 100).toFixed(2)}</Td>
                          <Td>{(parseFloat(order.filled_amount) / 1000000).toFixed(2)} CMDX</Td>
                          <Td>
                            <Badge colorScheme={order.status === 'Filled' ? 'green' : 'gray'}>
                              {order.status}
                            </Badge>
                          </Td>
                          <Td>{new Date(order.timestamp * 1000).toLocaleString()}</Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
                <Pagination 
                  items={pastOrders}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  setCurrentPage={setCurrentPage}
                />
                </TabPanel>
                </TabPanels>
              </Tabs>
            </MotionBox>

            {/* Informational Section */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Box bg={cardBgColor} borderRadius="xl" boxShadow="xl" p={6}>
                <Heading size="md" mb={4}>Understanding Your Bets</Heading>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Icon as={FaInfoCircle} color="blue.500" />
                    <Text><strong>Active Orders:</strong> These are your open orders that have not been fully matched yet. You can cancel these at any time.</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaInfoCircle} color="green.500" />
                    <Text><strong>Matched Bets:</strong> These are bets that have been matched with other users. You cannot cancel these, but you can redeem winnings once the market is resolved.</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaInfoCircle} color="purple.500" />
                    <Text><strong>Past Orders:</strong> These are your completed or cancelled orders. They show your betting history.</Text>
                  </HStack>
                </VStack>
              </Box>
            </MotionBox>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default MyBetsPage;