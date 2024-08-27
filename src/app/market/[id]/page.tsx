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
} from '@chakra-ui/react';
import { FaChartLine, FaClock, FaUsers, FaThumbsUp, FaThumbsDown, FaReply, FaCoins, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';
import { encodeQuery } from '../../../utils/queryUtils';


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
            <Text fontWeight="bold">{(parseInt(market.collateral_amount) / 1000000).toLocaleString()} UCMDX</Text>
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

const OrderBook = ({ type, selectedOption }: { type: 'Yes' | 'No', selectedOption: string }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const barColor = type === 'Yes' ? 'green.200' : 'red.200';

  const orders = [
    { odds: 2.85, shares: 1000.00, total: 3939.54 },
    { odds: 3.45, shares: 1222.00, total: 3589.54 },
    { odds: 3.57, shares: 11195.92, total: 3235.16 },
    { odds: 3.70, shares: 371.48, total: 100.30 },
  ];

  const maxTotal = Math.max(...orders.map(o => o.total));

  return (
    <Box mt={4} bg={bgColor} borderRadius="md" p={4} boxShadow="md">
      <Heading size="md" mb={4}>{selectedOption} - {type}</Heading>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>ODDS</Th>
            <Th>SHARES</Th>
            <Th>TOTAL</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((row, index) => (
            <Tr key={index} position="relative">
              <Td color={type === 'Yes' ? 'green.500' : 'red.500'} fontWeight="bold">{row.odds.toFixed(2)}</Td>
              <Td>{row.shares.toFixed(2)}</Td>
              <Td>${row.total.toFixed(2)}</Td>
              <Box
                position="absolute"
                right="0"
                top="0"
                bottom="0"
                width={`${(row.total / maxTotal) * 100}%`}
                bg={barColor}
                opacity="0.3"
                zIndex="0"
              />
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

const OptionsList = ({ options, onSelectOption }: { options: string[], onSelectOption: (option: string) => void }) => (
  <Accordion allowMultiple>
    {options.map((option, index) => (
      <AccordionItem key={index}>
        <h2>
          <AccordionButton onClick={() => onSelectOption(option)}>
            <Box flex="1" textAlign="left">
              <Text fontWeight="bold">{option}</Text>
            </Box>
            <HStack spacing={2}>
              <Button colorScheme="green" size="sm">Yes (2.00)</Button>
              <Button colorScheme="red" size="sm">No (2.00)</Button>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Flex>
            <Box flex={1} mr={4}>
              <OrderBook type="Yes" selectedOption={option} />
            </Box>
            <Box flex={1}>
              <OrderBook type="No" selectedOption={option} />
            </Box>
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    ))}
  </Accordion>
);

const BettingInterface = ({ market, selectedOption }: { market: Market | null, selectedOption: string }) => {
    const [betAmount, setBetAmount] = useState(0);
    const [odds, setOdds] = useState(2.00);
    const [betType, setBetType] = useState<'Yes' | 'No'>('Yes');
    const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
    const toast = useToast();
  
    const calculatePotentialPayout = (amount: number, odds: number) => {
      return amount * odds;
    };
  
    const handlePlaceBet = () => {
      toast({
        title: "Bet Placed",
        description: `You placed a ${betType} bet of ${betAmount} UCMDX on "${selectedOption}" at ${odds} odds.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    };
  
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const activeColor = useColorModeValue('blue.500', 'blue.300');
  
    return (
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor={borderColor}
        p={6}
      >
        <VStack spacing={6} align="stretch">
          <Heading size="md" textAlign="center" mb={2}>
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
              >
                {type}
              </Button>
            ))}
          </HStack>
  
          {orderType === 'Limit' && (
            <FormControl>
              <FormLabel fontWeight="medium">Odds</FormLabel>
              <NumberInput 
                value={odds} 
                onChange={(valueString) => setOdds(Number(valueString))}
                min={1.01}
                step={0.01}
                precision={2}
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
            <FormLabel fontWeight="medium">Amount (UCMDX)</FormLabel>
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
  
          <Button
            colorScheme="blue"
            onClick={handlePlaceBet}
            size="lg"
          >
            Place {orderType} Order
          </Button>
  
          <HStack justify="space-between">
            <Text fontWeight="medium">Potential Payout:</Text>
            <Text fontWeight="bold" color={useColorModeValue('green.600', 'green.300')}>
              {calculatePotentialPayout(betAmount, odds).toFixed(2)} UCMDX
            </Text>
          </HStack>
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

      console.log('Encoded query:', encodedQuery); // For debugging

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
            <OptionsList options={market.options} onSelectOption={setSelectedOption} />
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
            <BettingInterface market={market} selectedOption={selectedOption} />
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