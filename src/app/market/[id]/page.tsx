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
  Input,
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
            <Text fontWeight="bold">{(parseInt(market.resolution_bond) / 1000000).toLocaleString()} CMDX</Text>
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

const OrderBook = ({ selectedOption, onSelectOdds }: { selectedOption: string, onSelectOdds: (odds: number, betType: 'back' | 'lay') => void }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  // Mock data for the order book
  const backOdds = [2.0, 1.9, 1.8];
  const layOdds = [2.1, 2.2, 2.3];

  return (
    <Box mt={4} bg={bgColor} borderRadius="md" p={4} boxShadow="md">
      <Heading size="md" mb={4}>{selectedOption} - Order Book</Heading>
      <Flex>
        <VStack flex={1} spacing={2} align="stretch">
          <Flex fontWeight="bold" color={textColor}>
            <Box flex={1}>Amount</Box>
            <Box flex={1} textAlign="right">Back</Box>
          </Flex>
          {backOdds.map((odds, index) => (
            <Flex key={index} bg="blue.100" p={2} borderRadius="md" cursor="pointer" onClick={() => onSelectOdds(odds, 'back')}>
              <Box flex={1}>{(Math.random() * 1000).toFixed(2)}</Box>
              <Box flex={1} textAlign="right" fontWeight="bold">{odds.toFixed(2)}</Box>
            </Flex>
          ))}
        </VStack>
        <VStack flex={1} spacing={2} align="stretch" ml={4}>
          <Flex fontWeight="bold" color={textColor}>
            <Box flex={1}>Lay</Box>
            <Box flex={1} textAlign="right">Amount</Box>
          </Flex>
          {layOdds.map((odds, index) => (
            <Flex key={index} bg="red.100" p={2} borderRadius="md" cursor="pointer" onClick={() => onSelectOdds(odds, 'lay')}>
              <Box flex={1} fontWeight="bold">{odds.toFixed(2)}</Box>
              <Box flex={1} textAlign="right">{(Math.random() * 1000).toFixed(2)}</Box>
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
    }}>
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
            <OrderBook selectedOption={option} onSelectOdds={onSelectOdds} />
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const BettingInterface = ({ market, selectedOption, selectedOptionIndex }: { market: Market, selectedOption: string, selectedOptionIndex: number }) => {
  const [betAmount, setBetAmount] = useState(0);
  const [odds, setOdds] = useState(2.00);
  const [betType, setBetType] = useState<'back' | 'lay'>('back');
  const [stake, setStake] = useState(0);
  const toast = useToast();
  const { isWalletConnected } = useWeb3();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const calculatePotentialWin = () => {
    if (betType === 'back') {
      return (stake * odds - stake).toFixed(2);
    } else {
      return stake.toFixed(2);
    }
  };

  const calculateLiability = () => {
    if (betType === 'lay') {
      return ((odds - 1) * stake).toFixed(2);
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

    // Implement bet placement logic here
    toast({
      title: "Bet Placed",
      description: `You placed a ${betType} bet of ${stake} CMDX on "${selectedOption}" at ${odds} odds.`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="xl"
      boxShadow="xl"
    >
      <Heading size="md" mb={4}>Betslip</Heading>
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold">{selectedOption}</Text>
        <HStack>
          <Button
            colorScheme={betType === 'back' ? 'blue' : 'gray'}
            onClick={() => setBetType('back')}
          >
            Back
          </Button>
          <Button
            colorScheme={betType === 'lay' ? 'red' : 'gray'}
            onClick={() => setBetType('lay')}
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
            value={stake}
            onChange={(valueString) => setStake(Number(valueString))}
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
            {betType === 'back' ? calculatePotentialWin() : calculateLiability()} CMDX
          </Text>
        </Box>
        <Button colorScheme={betType === 'back' ? 'blue' : 'red'} size="lg" onClick={handlePlaceBet}>
          Place Bet
        </Button>
      </VStack>
    </Box>
  );
};

const CommentSection = () => {
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, author: 'User1', content: 'I think this market will close positively!', sentiment: 'positive', likes: 5, dislikes: 1 },
    { id: 2, author: 'User2', content: 'Not sure about this one, could go either way.', sentiment: 'neutral', likes: 3, dislikes: 2 },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const sentiment = newComment.toLowerCase().includes('positive') ? 'positive' : 
                        newComment.toLowerCase().includes('negative') ? 'negative' : 'neutral';
      const comment: Comment = {
        id: comments.length + 1,
        author: 'You',
        content: newComment,
        sentiment,
        likes: 0,
        dislikes: 0,
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md" mt={8}>
      <Heading size="md" mb={4}>Market Sentiment</Heading>
      <VStack spacing={4} align="stretch">
        {comments.map((comment) => (
          <Box key={comment.id} p={3} borderWidth={1} borderRadius="md" borderColor={borderColor}>
            <HStack spacing={3} mb={2}>
              <Avatar size="sm" name={comment.author} />
              <Text fontWeight="bold">{comment.author}</Text>
              <Badge colorScheme={comment.sentiment === 'positive' ? 'green' : comment.sentiment === 'negative' ? 'red' : 'gray'}>
                {comment.sentiment}
              </Badge>
            </HStack>
            <Text mb={2}>{comment.content}</Text>
            <HStack spacing={4}>
              <Button leftIcon={<FaThumbsUp />} size="sm" variant="outline">
                {comment.likes}
              </Button>
              <Button leftIcon={<FaThumbsDown />} size="sm" variant="outline">
                {comment.dislikes}
              </Button>
            </HStack>
          </Box>
        ))}
        <HStack>
          <Input
            placeholder="Add your market sentiment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={handleAddComment}>Post</Button>
        </HStack>
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
                onSelectOdds={handleSelectOdds}
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