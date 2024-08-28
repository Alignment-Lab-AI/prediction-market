'use client';

import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { FaChartLine, FaClock, FaUsers, FaThumbsUp, FaThumbsDown, FaReply, FaCoins, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';
import { encodeQuery } from '../../../utils/queryUtils';
import { useWeb3 } from '../../../contexts/Web3Context';
import { connectKeplr, broadcastTransaction } from '../../../utils/web3';

const MotionBox = motion(Box);

// Types
interface Market {
  id: number;
  question: string;
  description: string;
  options: string[];
  start_time: string;
  end_time: string;
  status: string;
  collateral_amount: string;
  reward_amount: string;
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
  timestamp: string;
  upvotes: number;
  downvotes: number;
  replies: Comment[];
}

// Components
const MarketHeader = ({ market }: { market: Market }) => {
  const timeRemaining = getTimeRemaining(parseInt(market.end_time));
  const statusColor = market.status === 'Active' ? 'green' : 'red';

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      bg={useColorModeValue('white', 'gray.800')}
      p={8}
      borderRadius="xl"
      boxShadow="xl"
      mb={8}
    >
      <VStack align="stretch" spacing={6}>
        <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">{market.question}</Heading>
        <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')}>{market.description}</Text>
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
            <Text fontWeight="bold">{(parseInt(market.collateral_amount) / 1000000).toLocaleString()} CMDX</Text>
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

const OrderBook = ({ type, selectedOption, orderBookData }: { type: 'Yes' | 'No', selectedOption: string, orderBookData: OrderBookData }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const barColor = type === 'Yes' ? 'green.200' : 'red.200';

  const bets = type === 'Yes' ? orderBookData.buy_bets : orderBookData.sell_bets;
  const maxVolume = Math.max(...bets.map(([_, data]) => parseInt(data.total_unmatched_volume)));

  return (
    <Box mt={4} bg={bgColor} borderRadius="md" p={4} boxShadow="md">
      <Heading size="md" mb={4}>{selectedOption} - {type}</Heading>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>ODDS</Th>
            <Th>AMOUNT (CMDX)</Th>
            <Th>TOTAL ($)</Th>
          </Tr>
        </Thead>
        <Tbody>
          {bets.map(([odds, data], index) => {
            const unmatchedAmount = parseInt(data.total_unmatched_volume) / 1000000; // Convert to CMDX
            const totalInUSD = unmatchedAmount * 1; // Assuming 1 CMDX = $1 USD for simplicity
            return (
              <Tr key={index} position="relative">
                <Td color={type === 'Yes' ? 'green.500' : 'red.500'} fontWeight="bold">{odds}</Td>
                <Td>{unmatchedAmount.toFixed(2)}</Td>
                <Td>${totalInUSD.toFixed(2)}</Td>
                <Box
                  position="absolute"
                  right="0"
                  top="0"
                  bottom="0"
                  width={`${(parseInt(data.total_unmatched_volume) / maxVolume) * 100}%`}
                  bg={barColor}
                  opacity="0.3"
                  zIndex="0"
                />
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

const OptionsList = ({ options, onSelectOption, market }: { options: string[], onSelectOption: (option: string, index: number) => void, market: Market }) => {
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
      }}>
        {options.map((option, index) => (
          <AccordionItem key={index}>
            <h2>
              <AccordionButton onClick={() => onSelectOption(option, index)}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">{option}</Text>
                </Box>
                <HStack spacing={2}>
                  <Button colorScheme="green" size="sm">Yes</Button>
                  <Button colorScheme="red" size="sm">No</Button>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {orderBookData[index] && (
                <Flex>
                  <Box flex={1} mr={4}>
                    <OrderBook type="Yes" selectedOption={option} orderBookData={orderBookData[index]!} />
                  </Box>
                  <Box flex={1}>
                    <OrderBook type="No" selectedOption={option} orderBookData={orderBookData[index]!} />
                  </Box>
                </Flex>
              )}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  const BettingInterface = ({ market, selectedOption, selectedOptionIndex }: { market: Market, selectedOption: string, selectedOptionIndex: number }) => {
    const [betAmount, setBetAmount] = useState(0);
    const [odds, setOdds] = useState(2.00);
    const [betType, setBetType] = useState<'Yes' | 'No'>('Yes');
    const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
    const [currentMarketOdds, setCurrentMarketOdds] = useState<{ yes: number | null, no: number | null }>({ yes: null, no: null });
    const toast = useToast();
    const { isWalletConnected } = useWeb3();
  
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const activeColor = useColorModeValue('blue.500', 'blue.300');
  
    useEffect(() => {
      fetchCurrentOdds();
    }, [selectedOptionIndex, betType]);
  
    const fetchCurrentOdds = async () => {
      try {
        const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
        const query = {
          query_bets_by_market_and_option: {
            market_id: market.id,
            option_index: selectedOptionIndex
          }
        };
        const encodedQuery = encodeQuery(query);
  
        const response = await axios.get(
          `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
        );
  
        const orderBookData = response.data.data;
        
        // Extract the best odds for Yes and No
        const bestYesOdds = orderBookData.buy_bets.length > 0 ? parseFloat(orderBookData.buy_bets[0][0]) : null;
        const bestNoOdds = orderBookData.sell_bets.length > 0 ? parseFloat(orderBookData.sell_bets[0][0]) : null;
  
        setCurrentMarketOdds({ yes: bestYesOdds, no: bestNoOdds });
      } catch (error) {
        console.error('Error fetching current odds:', error);
        setCurrentMarketOdds({ yes: null, no: null });
      }
    };
  
    const calculatePotentialPayout = (amount: number, odds: number) => {
      return amount * odds;
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
          create_bet: {
            market_id: market.id,
            option_index: selectedOptionIndex,
            position: betType === 'Yes' ? 'Buy' : 'Sell',
            amount: (betAmount * 1000000).toString(), // Convert to ucmdx
            odds: orderType === 'Market' ? '0' : odds.toString()
          }
        };
  
        const message = {
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: {
            sender: senderAddress,
            contract: contractAddress,
            msg: Buffer.from(JSON.stringify(msg)).toString('base64'),
            funds: [{ denom: "ucmdx", amount: (betAmount * 1000000).toString() }]
          }
        };
  
        const result = await broadcastTransaction(chainId, [message]);
  
        console.log("Bet placed successfully:", result);
  
        toast({
          title: "Bet Placed",
          description: `You placed a ${betType} bet of ${betAmount} CMDX on "${selectedOption}" at ${orderType === 'Market' ? 'market' : odds} odds. Transaction hash: ${result.transactionHash}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
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

    const getDisplayOdds = () => {
        if (orderType === 'Market') {
          return betType === 'Yes' ? currentMarketOdds.no : currentMarketOdds.yes;
        }
        return odds;
      };
  
      return (
        <Box
          bg={bgColor}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor={borderColor}
          p={6}
        >
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center" mb={2} bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Place Your Bet
            </Heading>
    
            <HStack spacing={4} justify="center">
              {['Market', 'Limit'].map((type) => (
                <Button
                  key={type}
                  onClick={() => setOrderType(type as 'Market' | 'Limit')}
                  variant="ghost"
                  fontWeight="medium"
                  color={orderType === type ? activeColor : 'inherit'}
                  borderBottom={orderType === type ? `2px solid ${activeColor}` : 'none'}
                  borderRadius="none"
                  _hover={{ bg: 'transparent' }}
                >
                  {type} Order
                </Button>
              ))}
            </HStack>
    
            <Text fontWeight="bold" fontSize="lg">
              {selectedOption}
            </Text>
    
            <HStack spacing={4}>
              {['Yes', 'No'].map((type) => (
                <Button
                  key={type}
                  onClick={() => setBetType(type as 'Yes' | 'No')}
                  colorScheme={betType === type ? (type === 'Yes' ? 'green' : 'red') : 'gray'}
                  variant={betType === type ? 'solid' : 'outline'}
                  flex={1}
                  size="lg"
                >
                  {type}
                </Button>
              ))}
            </HStack>
    
            <Box borderWidth={1} borderRadius="md" p={3}>
              <Text fontWeight="semibold" mb={2}>Current Odds:</Text>
              <Text fontSize="xl" fontWeight="bold" color={betType === 'Yes' ? 'green.500' : 'red.500'}>
                {getDisplayOdds() || 'N/A'}
              </Text>
            </Box>
    
            {orderType === 'Limit' && (
              <FormControl>
                <FormLabel fontWeight="medium">Odds</FormLabel>
                <NumberInput 
                  value={odds} 
                  onChange={(valueString) => setOdds(Number(valueString))}
                  min={1.01}
                  step={0.01}
                  precision={2}
                  size="lg"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            )}
    
            <FormControl>
              <FormLabel fontWeight="medium">Amount (CMDX)</FormLabel>
              <NumberInput 
                value={betAmount} 
                onChange={(valueString) => setBetAmount(Number(valueString))}
                min={0}
                size="lg"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
    
            <Tooltip
              label={orderType === 'Market' && !getDisplayOdds() ? "No available bets on opposite side" : ""}
              placement="top"
              hasArrow
            >
              <Button
                colorScheme="blue"
                onClick={handlePlaceBet}
                size="lg"
                isFullWidth
                fontWeight="bold"
                py={6}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
                isDisabled={orderType === 'Market' && !getDisplayOdds()}
              >
                Place {orderType} Order
              </Button>
            </Tooltip>
    
            <Box borderWidth={1} borderRadius="md" p={4} bg={useColorModeValue('gray.50', 'gray.700')}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Potential Payout:</Text>
                <Text fontWeight="bold" fontSize="lg" color={useColorModeValue('green.600', 'green.300')}>
                  {calculatePotentialPayout(betAmount, getDisplayOdds() || 0).toFixed(2)} CMDX
                </Text>
              </HStack>
            </Box>
          </VStack>
        </Box>
      );
    };

const CommentSection = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        author: 'Current User',
        content: newComment,
        timestamp: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        replies: [],
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      borderWidth={1}
      borderRadius="lg"
      p={4}
      mb={4}
      boxShadow="md"
    >
      <HStack spacing={4} mb={2}>
        <Avatar size="sm" name={comment.author} />
        <Text fontWeight="bold">{comment.author}</Text>
        <Text fontSize="sm" color="gray.500">{new Date(comment.timestamp).toLocaleString()}</Text>
      </HStack>
      <Text mb={4}>{comment.content}</Text>
      <HStack spacing={4}>
        <Button leftIcon={<FaThumbsUp />} size="sm" variant="outline" colorScheme="blue">
          {comment.upvotes}
        </Button>
        <Button leftIcon={<FaThumbsDown />} size="sm" variant="outline" colorScheme="red">
          {comment.downvotes}
        </Button>
        <Button leftIcon={<FaReply />} size="sm" variant="outline" colorScheme="gray">
          Reply
        </Button>
      </HStack>
    </MotionBox>
  );

  return (
    <Box bg={useColorModeValue('white', 'gray.800')} p={6} borderRadius="xl" boxShadow="xl" mt={8}>
      <Heading size="lg" mb={6}>Discussion</Heading>
      <VStack spacing={4} align="stretch" mb={8}>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          borderRadius="md"
        />
        <Button colorScheme="blue" onClick={handleAddComment} leftIcon={<FaReply />}>
          Post Comment
        </Button>
      </VStack>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
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

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

        const query = {
          query_market: {
            id: parseInt(id)
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

  return (
    <Box bg={bgColor} minHeight="100vh">
      <Container maxW="container.xl" py={12}>
        <Flex gap={8} flexDirection={{ base: 'column', lg: 'row' }}>
          {/* Left Column - Main Content */}
          <MotionBox
            flex={3}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MarketHeader market={market} />
            <MotionBox
              bg={useColorModeValue('white', 'gray.800')}
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
              />
            </MotionBox>
            <CommentSection />
          </MotionBox>

          {/* Right Column - Sidebar */}
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
              />
            </Box>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  );
};

// Server Component
export default function IndividualMarketPage({ params }: { params: { id: string } }) {
  return <MarketContent id={params.id} />;
}