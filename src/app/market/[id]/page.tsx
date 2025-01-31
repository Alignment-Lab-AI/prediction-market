'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Progress,
  Badge,
  Icon,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Avatar,
  Textarea,
  useToast,
  FormControl,
  FormLabel,
  Tooltip,
  Input,
  Link,
  useBreakpointValue,
  Divider,
} from '@chakra-ui/react';
import { FaChartLine, FaClock, FaUsers, FaThumbsUp, FaThumbsDown, FaReply, FaCoins, FaExchangeAlt, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import NextLink from 'next/link';
import { encodeQuery } from '../../../utils/queryUtils';
import { useWeb3 } from '../../../contexts/Web3Context';
import { connectKeplr, broadcastTransaction } from '../../../utils/web3';

const MotionBox = motion(Box);

// Types
interface Market {
  id: number;
  creator: string;
  question: string;
  description: string;
  options: string[];
  category: string;
  start_time: number;
  end_time: number;
  status: string;
  resolution_bond: string;
  resolution_reward: string;
  result: null | string;
}

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

interface OrderBookData {
  buy_bets: [string, { total_unmatched_volume: string; bets: Bet[] }][];
  sell_bets: [string, { total_unmatched_volume: string; bets: Bet[] }][];
}

interface Comment {
  id: number;
  author: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  likes: number;
  dislikes: number;
}

interface UserOrder {
  id: number;
  market_id: number;
  creator: string;
  option_id: number;
  side: string;
  amount: string;
  odds: number;
  filled_amount: string;
  status: string;
  timestamp: number;
}

// Components
const MarketHeader = ({ market }: { market: Market }) => {
  const timeRemaining = getTimeRemaining(market.end_time);
  const statusColor = market.status === 'Active' ? 'green' : 'red';

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg={useColorModeValue('white', 'gray.800')}
      p={{ base: 4, md: 8 }}
      borderRadius="xl"
      boxShadow="xl"
      mb={8}
      width="100%"
    >
      <VStack align="stretch" spacing={6}>
        <Heading size={{ base: "xl", md: "2xl" }} bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">{market.question}</Heading>
        <Text fontSize={{ base: "md", md: "lg" }} color={useColorModeValue('gray.600', 'gray.300')}>{market.description}</Text>
        <Flex justify="space-between" flexWrap="wrap" gap={4}>
          <HStack>
            <Icon as={FaClock} color="blue.500" />
            <Text fontWeight="bold">{timeRemaining}</Text>
          </HStack>
          <HStack>
            <Icon as={FaUsers} color="purple.500" />
            <Text fontWeight="bold">1,234 participants</Text>
          </HStack>
          <HStack>
            <Icon as={FaCoins} color="yellow.500" />
            <Text fontWeight="bold">{(parseInt(market.resolution_bond) / 1000000).toLocaleString()} OSMO</Text>
          </HStack>
          <Badge colorScheme={statusColor} fontSize="md" px={3} py={1} borderRadius="full">
            {market.status}
          </Badge>
        </Flex>
        <Progress value={80} colorScheme="blue" size="sm" borderRadius="full" />
      </VStack>
    </MotionBox>
  );
};

const OrderBook = ({
  selectedOption,
  onSelectOdds,
  marketId,
  optionIndex
}: {
  selectedOption: string,
  onSelectOdds: (odds: number, betType: 'back' | 'lay') => void,
  marketId: number,
  optionIndex: number
}) => {
  const [backOrders, setBackOrders] = useState<any[]>([]);
  const [layOrders, setLayOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        const query = {
          market_orders: {
            market_id: marketId,
            start_after: 0,
            limit: 100 // Increase this if you expect more orders
          }
        };

        const encodedQuery = encodeQuery(query);

        const response = await axios.get(`${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`);

        const allOrders = response.data.data;

        // Filter orders for the specific option
        const filteredBackOrders = allOrders
          .filter(order => order.side === "Back" && order.option_id === optionIndex)
          .sort((a, b) => a.odds - b.odds);

        const filteredLayOrders = allOrders
          .filter(order => order.side === "Lay" && order.option_id === optionIndex)
          .sort((a, b) => b.odds - a.odds);

        setBackOrders(filteredBackOrders);
        setLayOrders(filteredLayOrders);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching order book:', error);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [marketId, optionIndex]);

  const getBackgroundColor = (index: number, isBack: boolean) => {
    const baseColor = isBack ? 'blue' : 'red';
    const intensity = 300 - index * 100; // Now 300, 200, 100
    return `${baseColor}.${intensity}`;
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Box mt={4} bg={bgColor} borderRadius="md" p={4} boxShadow="md" width="100%">
      <Heading size="md" mb={4}>{selectedOption} - Order Book</Heading>
      <Flex flexDirection={{ base: "column", md: "row" }} gap={4}>
        <VStack flex={1} spacing={2} align="stretch">
          <Flex fontWeight="bold" color={textColor}>
            <Box flex={1}>Amount</Box>
            <Box flex={1} textAlign="right">Back</Box>
          </Flex>
          {backOrders.slice(0, 3).map((order, index) => (
            <Tooltip key={order.id} label={`Click to place a back bet at ${(order.odds / 100).toFixed(2)}`} placement="left">
              <Flex
                bg={getBackgroundColor(index, true)}
                p={2}
                borderRadius="md"
                cursor="pointer"
                onClick={() => onSelectOdds(order.odds / 100, 'back')}
              >
                <Box flex={1}>{((Number(order.amount) - Number(order.filled_amount)) / 1000000).toFixed(2)}</Box>
                <Box flex={1} textAlign="right" fontWeight="bold">{(order.odds / 100).toFixed(2)}</Box>
              </Flex>
            </Tooltip>
          ))}
          {[...Array(3 - backOrders.length)].map((_, index) => (
            <Flex key={`empty-back-${index}`} bg="gray.100" p={2} borderRadius="md">
              <Box flex={1}>-</Box>
              <Box flex={1} textAlign="right">-</Box>
            </Flex>
          ))}
        </VStack>
        <VStack flex={1} spacing={2} align="stretch">
          <Flex fontWeight="bold" color={textColor}>
            <Box flex={1}>Lay</Box>
            <Box flex={1} textAlign="right">Amount</Box>
          </Flex>
          {layOrders.slice(0, 3).map((order, index) => (
            <Tooltip key={order.id} label={`Click to place a lay bet at ${(order.odds / 100).toFixed(2)}`} placement="right">
              <Flex
                bg={getBackgroundColor(index, false)}
                p={2}
                borderRadius="md"
                cursor="pointer"
                onClick={() => onSelectOdds(order.odds / 100, 'lay')}
              >
                <Box flex={1} fontWeight="bold">{(order.odds / 100).toFixed(2)}</Box>
                <Box flex={1} textAlign="right">{((Number(order.amount) - Number(order.filled_amount)) / 1000000).toFixed(2)}</Box>
              </Flex>
            </Tooltip>
          ))}
          {[...Array(3 - layOrders.length)].map((_, index) => (
            <Flex key={`empty-lay-${index}`} bg="gray.100" p={2} borderRadius="md">
              <Box flex={1}>-</Box>
              <Box flex={1} textAlign="right">-</Box>
            </Flex>
          ))}
        </VStack>
      </Flex>
    </Box>
  );
};

const OptionsList = ({ options, onSelectOption, market, onSelectOdds }: { options: string[], onSelectOption: (option: string, index: number) => void, market: Market, onSelectOdds: (odds: number, betType: 'back' | 'lay') => void }) => {
  const [orderBookData, setOrderBookData] = useState<{ [key: number]: OrderBookData | null }>({});

  const fetchOrderBookData = async (optionIndex: number) => {
    try {
      const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

      const query = {
        query_bets_by_market_and_option: {
          market_id: market.id,
          option_index: optionIndex
        }
      };
      const encodedQuery = encodeQuery(query);

      const response = await axios.get(
        `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
      );

      setOrderBookData(prevData => ({
        ...prevData,
        [optionIndex]: response.data.data
      }));
    } catch (error) {
      console.error('Error fetching order book data:', error);
    }
  };

  const handleAccordionChange = (optionIndex: number) => {
    if (!orderBookData[optionIndex]) {
      fetchOrderBookData(optionIndex);
    }
  };

  return (
    <Accordion allowMultiple onChange={(expandedIndexes: number[]) => {
      expandedIndexes.forEach(index => handleAccordionChange(index));
    }} width="100%">
      {options.map((option, index) => (
        <AccordionItem key={index}>
          <h2>
            <AccordionButton onClick={() => onSelectOption(option, index)}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="bold">{option}</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <OrderBook
              selectedOption={option}
              onSelectOdds={onSelectOdds}
              marketId={market.id}
              optionIndex={index}
            />
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const BettingInterface = ({ market, selectedOption, selectedOptionIndex, onBetPlaced }: { market: Market, selectedOption: string, selectedOptionIndex: number, onBetPlaced: () => void }) => {
  const [betAmount, setBetAmount] = useState(0);
  const [odds, setOdds] = useState(2.00);
  const [betType, setBetType] = useState<'back' | 'lay'>('back');
  const toast = useToast();
  const { isWalletConnected } = useWeb3();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const gradientColor = useColorModeValue("linear(to-r, blue.400, purple.500)", "linear(to-r, blue.200, purple.300)");

  const calculatePotentialWin = () => {
    if (betType === 'back') {
      return (betAmount * odds - betAmount).toFixed(2);
    } else {
      return betAmount.toFixed(2);
    }
  };

  const calculateLiability = () => {
    if (betType === 'lay') {
      return ((odds - 1) * betAmount).toFixed(2);
    }
    return '0.00';
  };

  const handlePlaceBet = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to place a bet.",
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
        place_order: {
          market_id: market.id,
          option_id: selectedOptionIndex,
          order_type: "limit",
          side: betType === 'back' ? "Back" : "Lay",
          amount: (betAmount * 1000000).toString(), // Convert to uosmo
          odds: Math.round(odds * 100) // Convert to integer representation
        }
      };

      // Calculate the amount to be sent
      const amountToSend = betType === 'back' ? betAmount : parseFloat(calculateLiability());
      const funds = [{ denom: "uosmo", amount: (amountToSend * 1000000).toString() }];

      console.log("Placing bet:", JSON.stringify(msg, null, 2));

      const result = await broadcastTransaction(chainId, contractAddress, msg, funds);

      console.log("Bet placed successfully:", result);

      toast({
        title: "Bet Placed",
        description: `You placed a ${betType} bet of ${betAmount} OSMO on "${selectedOption}" at ${odds} odds. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onBetPlaced();
    } catch (err) {
      console.error("Error placing bet:", err);
      toast({
        title: "Error",
        description: "Failed to place bet. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="xl"
      boxShadow="xl"
      border="1px solid"
      borderColor={borderColor}
      width="100%"
    >
      <Heading size="md" mb={4}>Betslip</Heading>
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold">{selectedOption}</Text>
        <HStack>
          <Button
            onClick={() => setBetType('back')}
            flex={1}
            bgGradient={betType === 'back' ? gradientColor : 'none'}
            color={betType === 'back' ? 'white' : 'current'}
            _hover={{
              bgGradient: betType === 'back' ? gradientColor : 'none',
              opacity: 0.8,
            }}
            borderRadius="full"
            boxShadow={betType === 'back' ? 'md' : 'none'}
            transition="all 0.2s"
          >
            Back
          </Button>
          <Button
            onClick={() => setBetType('lay')}
            flex={1}
            bgGradient={betType === 'lay' ? "linear(to-r, red.400, pink.500)" : 'none'}
            color={betType === 'lay' ? 'white' : 'current'}
            _hover={{
              bgGradient: betType === 'lay' ? "linear(to-r, red.400, pink.500)" : 'none',
              opacity: 0.8,
            }}
            borderRadius="full"
            boxShadow={betType === 'lay' ? 'md' : 'none'}
            transition="all 0.2s"
          >
            Lay
          </Button>
        </HStack>
        <FormControl>
          <FormLabel>Odds</FormLabel>
          <NumberInput
            value={odds}
            onChange={(valueString) => setOdds(Number(valueString))}
            step={0.01}
            precision={2}
            min={1.01}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel>{betType === 'back' ? 'Stake' : 'Liability'}</FormLabel>
          <NumberInput
            value={betAmount}
            onChange={(valueString) => setBetAmount(Number(valueString))}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <Box borderWidth={1} borderRadius="md" p={3}>
          <Text fontWeight="semibold">
            {betType === 'back' ? 'Potential profit:' : 'Potential liability:'}
          </Text>
          <Text fontSize="xl" fontWeight="bold" color={betType === 'back' ? 'green.500' : 'red.500'}>
            {betType === 'back' ? calculatePotentialWin() : calculateLiability()} OSMO
          </Text>
        </Box>
        <Button
          onClick={handlePlaceBet}
          bgGradient={betType === 'back' ? gradientColor : "linear(to-r, red.400, pink.500)"}
          color="white"
          _hover={{
            bgGradient: betType === 'back' ? "linear(to-r, blue.500, purple.600)" : "linear(to-r, red.500, pink.600)",
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          _active={{
            transform: 'translateY(0)',
            boxShadow: 'md',
          }}
          size="lg"
          fontWeight="bold"
          borderRadius="full"
          transition="all 0.2s"
        >
          Place Bet
        </Button>
      </VStack>
    </Box>
  );
};

const RecentOrders = ({ marketId }: { marketId: number }) => {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { walletAddress } = useWeb3();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.700', 'white');

  const fetchRecentOrders = async () => {
    try {
      const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
      const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

      const query = {
        market_orders: {
          market_id: marketId,
          start_after: 0,
          limit: 5
        }
      };
      const encodedQuery = encodeQuery(query);

      const response = await axios.get(
        `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
      );

      setOrders(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, [marketId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'green';
      case 'filled':
        return 'blue';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Box>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg={bgColor}
      borderRadius="xl"
      boxShadow="xl"
      p={6}
      border="1px solid"
      borderColor={borderColor}
      mt={8}
      width="100%"
    >
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading size="md" color={headingColor}>Recent Orders</Heading>
          <Icon as={FaExchangeAlt} color="blue.500" boxSize={6} />
        </HStack>

        {orders.length === 0 ? (
          <Text color={textColor} textAlign="center">No recent orders for this market.</Text>
        ) : (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Side</Th>
                <Th isNumeric>Amount</Th>
                <Th isNumeric>Odds</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order.id}>
                  <Td>
                    <Badge colorScheme={order.side === 'Back' ? 'green' : 'red'}>
                      {order.side}
                    </Badge>
                  </Td>
                  <Td isNumeric>
                    {((Number(order.amount) - Number(order.filled_amount)) / 1000000).toFixed(2)} OSMO
                  </Td>
                  <Td isNumeric>{(order.odds / 100).toFixed(2)}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        <Button
          as={NextLink}
          href="/my-bets"
          leftIcon={<Icon as={FaHistory} />}
          colorScheme="blue"
          variant="outline"
          size="sm"
          borderRadius="full"
          alignSelf="center"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'sm',
          }}
          transition="all 0.2s"
        >
          View All Bets
        </Button>
      </VStack>
    </MotionBox>
  );
};

const CommentSection = ({ marketId }: { marketId: number }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        // Implement the logic to add a new comment
        // This should include a call to your smart contract or API
        // For now, we'll just add it to the local state
        const newCommentObj: Comment = {
          id: comments.length + 1,
          author: 'You',
          content: newComment,
          sentiment: 'neutral', // You might want to implement sentiment analysis here
          likes: 0,
          dislikes: 0,
        };
        setComments([newCommentObj, ...comments]);
        setNewComment('');
        toast({
          title: 'Comment added',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error adding comment:', error);
        toast({
          title: 'Error',
          description: 'Failed to add comment. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleLike = (id: number) => {
    // Implement like functionality
  };

  const handleDislike = (id: number) => {
    // Implement dislike functionality
  };

  return (
    <Box bg={bgColor} p={6} borderRadius="xl" boxShadow="xl" mt={8} width="100%">
      <Heading size="md" mb={4}>Market Sentiment</Heading>
      <VStack spacing={4} align="stretch">
        <HStack>
          <Input
            placeholder="Add your market sentiment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            borderRadius="full"
          />
          <Button
            onClick={handleAddComment}
            colorScheme="blue"
            borderRadius="full"
          >
            Post
          </Button>
        </HStack>
        <AnimatePresence>
          {comments.map((comment) => (
            <MotionBox
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Box p={4} borderWidth={1} borderRadius="lg" borderColor={borderColor}>
                <HStack spacing={3} mb={2}>
                  <Avatar size="sm" name={comment.author} />
                  <Text fontWeight="bold">{comment.author}</Text>
                  <Badge colorScheme={comment.sentiment === 'positive' ? 'green' : comment.sentiment === 'negative' ? 'red' : 'gray'}>
                    {comment.sentiment}
                  </Badge>
                </HStack>
                <Text mb={3} color={textColor}>{comment.content}</Text>
                <HStack spacing={4}>
                  <Button leftIcon={<FaThumbsUp />} size="sm" variant="outline" borderRadius="full" onClick={() => handleLike(comment.id)}>
                    {comment.likes}
                  </Button>
                  <Button leftIcon={<FaThumbsDown />} size="sm" variant="outline" borderRadius="full" onClick={() => handleDislike(comment.id)}>
                    {comment.dislikes}
                  </Button>
                </HStack>
              </Box>
            </MotionBox>
          ))}
        </AnimatePresence>
      </VStack>
    </Box>
  );
};

const getTimeRemaining = (endTime: number) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = endTime - now;

  if (timeLeft <= 0) return 'Ended';

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

// Client Component
const MarketContent = ({ id }: { id: string }) => {
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [selectedOdds, setSelectedOdds] = useState(2.00);
  const [selectedBetType, setSelectedBetType] = useState<'back' | 'lay'>('back');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        const query = {
          market: {
            market_id: parseInt(id)
          }
        };
        const encodedQuery = encodeQuery(query);

        const response = await axios.get(
          `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
        );

        const marketData = response.data.data;
        setMarket(marketData);
        setSelectedOption(marketData.options[0]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching market:', error);
        setError('Failed to fetch market data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchMarket();
  }, [id]);

  const handleSelectOdds = (odds: number, betType: 'back' | 'lay') => {
    setSelectedOdds(odds);
    setSelectedBetType(betType);
  };

  const handleBetPlaced = () => {
    // Refresh the OrderBook data
    if (market) {
      const updatedMarket = { ...market };
      setMarket(null); // Force a re-render
      setTimeout(() => setMarket(updatedMarket), 0);
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

  if (!market) {
    return <Box>Market not found</Box>;
  }

  const renderContent = () => (
    <>
      <MarketHeader market={market} />
      <MotionBox
        bg={bgColor}
        p={6}
        borderRadius="xl"
        boxShadow="xl"
        mb={8}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        width="100%"
      >
        <Heading size="lg" mb={4}>Market Options</Heading>
        <OptionsList
          options={market.options}
          onSelectOption={(option, index) => {
            setSelectedOption(option);
            setSelectedOptionIndex(index);
          }}
          market={market}
          onSelectOdds={handleSelectOdds}
        />
      </MotionBox>
      <BettingInterface
        market={market}
        selectedOption={selectedOption}
        selectedOptionIndex={selectedOptionIndex}
        onBetPlaced={handleBetPlaced}
      />
      <RecentOrders marketId={market.id} />
      <CommentSection marketId={market.id} />
    </>
  );

  return (
    <Box bg={bgColor} minHeight="100vh">
      <Container maxW="container.xl" py={12}>
        {isMobile ? (
          <VStack spacing={8} width="100%">
            {renderContent()}
          </VStack>
        ) : (
          <Flex gap={8}>
            <MotionBox
              flex={3}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MarketHeader market={market} />
              <MotionBox
                bg={bgColor}
                p={6}
                borderRadius="xl"
                boxShadow="xl"
                mb={8}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Heading size="lg" mb={4}>Market Options</Heading>
                <OptionsList
                  options={market.options}
                  onSelectOption={(option, index) => {
                    setSelectedOption(option);
                    setSelectedOptionIndex(index);
                  }}
                  market={market}
                  onSelectOdds={handleSelectOdds}
                />
              </MotionBox>
              <CommentSection marketId={market.id} />
            </MotionBox>
            <MotionBox
              flex={1}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Box position="sticky" top={4}>
                <BettingInterface
                  market={market}
                  selectedOption={selectedOption}
                  selectedOptionIndex={selectedOptionIndex}
                  onBetPlaced={handleBetPlaced}
                />
                <RecentOrders marketId={market.id} />
              </Box>
            </MotionBox>
          </Flex>
        )}
      </Container>
    </Box>
  );
};

// Server Component
export default function IndividualMarketPage({ params }: { params: { id: string } }) {
  return <MarketContent id={params.id} />;
}