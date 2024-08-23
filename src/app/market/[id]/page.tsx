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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Select,
  Progress,
  Divider,
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
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Avatar,
  Textarea,
  IconButton,
} from '@chakra-ui/react';
import { FaChartLine, FaClock, FaUsers, FaChevronDown, FaChartBar, FaThumbsUp, FaThumbsDown, FaReply } from 'react-icons/fa';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
const MarketHeader = ({ market }: { market: Market }) => (
  <VStack align="stretch" spacing={4} mb={8} bg={useColorModeValue('white', 'gray.800')} p={6} borderRadius="lg" boxShadow="md">
    <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">{market.question}</Heading>
    <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.300')}>{market.description}</Text>
    <HStack spacing={4} wrap="wrap">
      <Badge colorScheme={market.status === 'ACTIVE' ? 'green' : 'red'} fontSize="md" px={3} py={1}>{market.status}</Badge>
      <Text><Icon as={FaClock} mr={2} />Ends: {new Date(market.end_time).toLocaleString()}</Text>
      <Text><Icon as={FaUsers} mr={2} />1,234 participants</Text>
    </HStack>
    <Progress value={80} colorScheme="blue" size="sm" borderRadius="full" />
    <Text fontWeight="bold" fontSize="xl">
      Total Volume: {parseInt(market.collateral_amount).toLocaleString()} UCMDX
    </Text>
  </VStack>
);

const OrderBook = ({ type, selectedOption }: { type: 'Yes' | 'No', selectedOption: string }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const barColor = type === 'Yes' ? 'green.200' : 'red.200';

  const orders = [
    { price: 0.35, shares: 1000.00, total: 3939.54 },
    { price: 0.29, shares: 1222.00, total: 3589.54 },
    { price: 0.28, shares: 11195.92, total: 3235.16 },
    { price: 0.27, shares: 371.48, total: 100.30 },
  ];

  const maxTotal = Math.max(...orders.map(o => o.total));

  return (
    <Box mt={4} bg={bgColor} borderRadius="md" p={4}>
      <Heading size="md" mb={2}>{selectedOption} - {type}</Heading>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>PRICE</Th>
            <Th>SHARES</Th>
            <Th>TOTAL</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((row, index) => (
            <Tr key={index} position="relative">
              <Td color={type === 'Yes' ? 'green.500' : 'red.500'}>{row.price.toFixed(2)}¢</Td>
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

const HistoricalGraph = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Price',
        data: [0.3, 0.5, 0.2, 0.8, 0.4, 0.6, 0.7],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Historical Price Chart'
      }
    }
  };

  return <Line data={data} options={options} />;
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
              <Button colorScheme="green" size="sm">Yes (50%)</Button>
              <Button colorScheme="red" size="sm">No (50%)</Button>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Tabs>
            <TabList>
              <Tab>Order Book</Tab>
              <Tab>Graph</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Flex>
                  <Box flex={1} mr={4}>
                    <OrderBook type="Yes" selectedOption={option} />
                  </Box>
                  <Box flex={1}>
                    <OrderBook type="No" selectedOption={option} />
                  </Box>
                </Flex>
              </TabPanel>
              <TabPanel>
                <HistoricalGraph />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </AccordionPanel>
      </AccordionItem>
    ))}
  </Accordion>
);

const BettingInterface = ({ market, selectedOption }: { market: Market | null, selectedOption: string }) => (
  <Box bg={useColorModeValue('white', 'gray.800')} p={6} borderRadius="lg" boxShadow="lg" height="100%">
    <Tabs>
      <TabList>
        <Tab>Market Order</Tab>
        <Tab>Limit Order</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold" fontSize="xl">{selectedOption}</Text>
            <Text fontWeight="bold">Outcome</Text>
            <HStack>
              <Button colorScheme="green" flex={1}>Yes 27¢</Button>
              <Button colorScheme="red" flex={1}>No 74¢</Button>
            </HStack>
            <Text fontWeight="bold">Amount</Text>
            <Input placeholder="$0" />
            <Button colorScheme="blue" isFullWidth>Place Market Order</Button>
            <HStack justify="space-between">
              <Text>Avg price</Text>
              <Text fontWeight="bold" color="blue.500">0¢</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Shares</Text>
              <Text fontWeight="bold">0.00</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Potential return</Text>
              <Text fontWeight="bold" color="green.500">$0.00 (0.00%)</Text>
            </HStack>
          </VStack>
        </TabPanel>
        <TabPanel>
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold" fontSize="xl">{selectedOption}</Text>
            <Text fontWeight="bold">Order Type</Text>
            <HStack>
              <Button colorScheme="green" flex={1}>Buy</Button>
              <Button colorScheme="red" flex={1}>Sell</Button>
            </HStack>
            <Text fontWeight="bold">Limit Price</Text>
            <Input placeholder="0.00" />
            <Text fontWeight="bold">Shares</Text>
            <Input placeholder="0" />
            <Button colorScheme="blue" isFullWidth>Place Limit Order</Button>
          </VStack>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Box>
);

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
    <Box borderWidth={1} borderRadius="md" p={4} mb={4}>
      <HStack spacing={4} mb={2}>
        <Avatar size="sm" name={comment.author} />
        <Text fontWeight="bold">{comment.author}</Text>
        <Text fontSize="sm" color="gray.500">{new Date(comment.timestamp).toLocaleString()}</Text>
      </HStack>
      <Text mb={4}>{comment.content}</Text>
      <HStack spacing={4}>
        <Button leftIcon={<FaThumbsUp />} size="sm" variant="outline">
          {comment.upvotes}
        </Button>
        <Button leftIcon={<FaThumbsDown />} size="sm" variant="outline">
          {comment.downvotes}
        </Button>
        <Button leftIcon={<FaReply />} size="sm" variant="outline">
          Reply
        </Button>
      </HStack>
    </Box>
  );

  return (
    <Box bg={useColorModeValue('white', 'gray.800')} p={6} borderRadius="lg" boxShadow="md" mt={8}>
      <Heading size="lg" mb={6}>Comments</Heading>
      <VStack spacing={4} align="stretch" mb={8}>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <Button colorScheme="blue" onClick={handleAddComment}>
          Post Comment
        </Button>
      </VStack>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </Box>
  );
};

// Main Component
const IndividualMarketPage = () => {
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const response = await axios.get<Market>('http://localhost:3001/api/market/1');
        setMarket(response.data);
        setSelectedOption(response.data.options[0]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching market:', error);
        setError('Failed to fetch market data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchMarket();
  }, []);

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text color="red.500" fontSize="xl" fontWeight="bold">{error}</Text>
      </Box>
    );
  }

  if (!market) {
    return <Box>Market not found</Box>;
  }

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minHeight="100vh">
      <Container maxW="container.xl" py={8}>
        <Flex gap={8} flexDirection={{ base: 'column', lg: 'row' }}>
          {/* Left Column - Main Content */}
          <Box flex={3}>
            <MarketHeader market={market} />
            <OptionsList options={market.options} onSelectOption={setSelectedOption} />
            <CommentSection />
          </Box>

          {/* Right Column - Sidebar */}
          <Box flex={1}>
            <Box position="sticky" top={4}>
              <BettingInterface market={market} selectedOption={selectedOption} />
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default IndividualMarketPage;