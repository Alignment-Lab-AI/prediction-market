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
} from '@chakra-ui/react';
import { FaCoins, FaTrophy, FaHistory, FaChartLine, FaExchangeAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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

interface Bet {
  id: number;
  bettor: string;
  market_id: number;
  option_index: number;
  position: string;
  amount: string;
  matched_amount: string;
  unmatched_amount: string;
  odds: string;
  redeemed: boolean;
}

interface Market {
  id: number;
  question: string;
  status: string;
}

const MyBetsPage = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [markets, setMarkets] = useState<{ [key: number]: Market }>({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const { isWalletConnected, walletAddress } = useWeb3();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchData = async () => {
      if (!isWalletConnected || !walletAddress) {
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
        const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        const query = {
          query_user_bets: {
            user_addr: walletAddress
          }
        };
        const encodedQuery = encodeQuery(query);

        const betsResponse = await axios.get(
          `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
        );
        setBets(betsResponse.data.data);

        const marketIds = [...new Set(betsResponse.data.data.map((bet: Bet) => bet.market_id))];
        const marketPromises = marketIds.map(id => axios.get<Market>(`${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodeQuery({ query_market: { id } })}`));
        const marketResponses = await Promise.all(marketPromises);
        const marketData = marketResponses.reduce((acc, response) => {
          acc[response.data.data.id] = response.data.data;
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
  }, [toast, isWalletConnected, walletAddress]);

  const activeBets = bets.filter(bet => !bet.redeemed);
  const pastBets = bets.filter(bet => bet.redeemed);

  const totalBets = bets.length;
  const currentBalance = bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
  const profitLoss = pastBets.reduce((sum, bet) => sum + (parseFloat(bet.matched_amount) * parseFloat(bet.odds) - parseFloat(bet.amount)), 0);

  const cancelBet = async (betId: number) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to cancel a bet.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
      if (!chainId) {
        throw new Error("Chain ID not defined in environment variables");
      }

      const { accounts } = await connectKeplr(chainId);
      const senderAddress = accounts[0].address;

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("Contract address not defined in environment variables");
      }

      const msg = {
        cancel_bet: {
          bet_id: betId
        }
      };

      const message = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: {
          sender: senderAddress,
          contract: contractAddress,
          msg: Buffer.from(JSON.stringify(msg)).toString('base64'),
          funds: []
        }
      };

      const result = await broadcastTransaction(chainId, [message]);

      console.log("Bet cancelled successfully:", result);

      toast({
        title: "Bet Cancelled",
        description: `Bet ${betId} has been cancelled. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Update the local state to reflect the cancellation
      setBets(bets.filter(bet => bet.id !== betId));
    } catch (err) {
      console.error("Error cancelling bet:", err);
      toast({
        title: "Error",
        description: "Failed to cancel bet. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const redeemBet = async (betId: number) => {
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
      if (!chainId) {
        throw new Error("Chain ID not defined in environment variables");
      }

      const { accounts } = await connectKeplr(chainId);
      const senderAddress = accounts[0].address;

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("Contract address not defined in environment variables");
      }

      const msg = {
        redeem_winnings: {
          bet_id: betId
        }
      };

      const message = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: {
          sender: senderAddress,
          contract: contractAddress,
          msg: Buffer.from(JSON.stringify(msg)).toString('base64'),
          funds: []
        }
      };

      const result = await broadcastTransaction(chainId, [message]);

      console.log("Winnings redeemed successfully:", result);

      toast({
        title: "Winnings Redeemed",
        description: `Winnings for bet ${betId} have been redeemed. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Update the local state to reflect the redemption
      setBets(bets.map(bet => bet.id === betId ? {...bet, redeemed: true} : bet));
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

  return (
    <ChakraProvider theme={theme}>
      <Box bg={bgColor} minHeight="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
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
                          <Th>Matched</Th>
                          <Th>Unmatched</Th>
                          <Th>Odds</Th>
                          <Th>Potential Winnings</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {activeBets.map((bet) => {
                          const totalAmount = parseFloat(bet.amount);
                          const matchedAmount = parseFloat(bet.matched_amount);
                          const unmatchedAmount = totalAmount - matchedAmount;
                          
                          return (
                            <Tr key={bet.id}>
                              <Td>{markets[bet.market_id]?.question}</Td>
                              <Td>{(totalAmount / 1000000).toFixed(2)} CMDX</Td>
                              <Td>{(matchedAmount / 1000000).toFixed(2)} CMDX</Td>
                              <Td>{(unmatchedAmount / 1000000).toFixed(2)} CMDX</Td>
                              <Td>{bet.odds}</Td>
                              <Td>{((matchedAmount / 1000000) * parseFloat(bet.odds)).toFixed(2)} CMDX</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button 
                                    colorScheme="red" 
                                    size="sm" 
                                    onClick={() => cancelBet(bet.id)}
                                    isDisabled={unmatchedAmount === 0}
                                  >
                                    <Icon as={FaTimesCircle} mr={2} />
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
                                      <Icon as={FaCheckCircle} mr={2} />
                                      Redeem
                                    </Button>
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TabPanel>

                  <TabPanel>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Market</Th>
                          <Th>Amount</Th>
                          <Th>Matched</Th>
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
                            <Td>{(parseFloat(bet.matched_amount) / 1000000).toFixed(2)} UCMDX</Td>
                            <Td>{bet.odds}</Td>
                            <Td>
                              <Badge colorScheme={bet.redeemed ? 'green' : 'red'}>
                                {bet.redeemed ? 'Won' : 'Lost'}
                              </Badge>
                            </Td>
                            <Td>
                              {bet.redeemed 
                                ? ((parseFloat(bet.matched_amount) / 1000000) * parseFloat(bet.odds)).toFixed(2) 
                                : '0'
                              } UCMDX
                            </Td>
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