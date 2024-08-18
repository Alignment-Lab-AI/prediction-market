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
} from '@chakra-ui/react';
import { FaChartLine, FaClock, FaUsers, FaChevronDown, FaChartBar } from 'react-icons/fa';
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

// Components
const MarketHeader = ({ market }: { market: Market }) => (
  <VStack align="stretch" spacing={4} mb={8}>
    <Heading size="2xl">{market.question}</Heading>
    <Text fontSize="lg" color="gray.600">{market.description}</Text>
    <HStack spacing={4}>
      <Badge colorScheme={market.status === 'ACTIVE' ? 'green' : 'red'}>{market.status}</Badge>
      <Text><Icon as={FaClock} mr={2} />Ends: {new Date(market.end_time).toLocaleString()}</Text>
      <Text><Icon as={FaUsers} mr={2} />1,234 participants</Text>
    </HStack>
    <Progress value={80} colorScheme="blue" size="sm" />
    <Text fontWeight="bold" fontSize="xl">
      Total Volume: {parseInt(market.collateral_amount).toLocaleString()} UCMDX
    </Text>
  </VStack>
);

const OrderBook = ({ type }: { type: string }) => (
  <Box mt={4}>
    <Heading size="md" mb={2}>Orderbook - {type}</Heading>
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th>PRICE</Th>
          <Th>SHARES</Th>
          <Th>TOTAL</Th>
        </Tr>
      </Thead>
      <Tbody>
        {[
          { price: 0.35, shares: 1000.00, total: 3939.54 },
          { price: 0.29, shares: 1222.00, total: 3589.54 },
          { price: 0.28, shares: 11195.92, total: 3235.16 },
          { price: 0.27, shares: 371.48, total: 100.30 },
        ].map((row, index) => (
          <Tr key={index}>
            <Td color={type === 'Yes' ? 'green.500' : 'red.500'}>{row.price.toFixed(2)}¢</Td>
            <Td>{row.shares.toFixed(2)}</Td>
            <Td>${row.total.toFixed(2)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Box>
);

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

const OptionsList = ({ options }: { options: string[] }) => (
  <Accordion allowMultiple>
    {options.map((option, index) => (
      <AccordionItem key={index}>
        <h2>
          <AccordionButton>
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
                    <OrderBook type="Yes" />
                  </Box>
                  <Box flex={1}>
                    <OrderBook type="No" />
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

const BettingInterface = ({ market }: { market: Market | null }) => (
  <Box bg="white" p={4} borderRadius="md" boxShadow="md" height="100%">
    <Tabs>
      <TabList>
        <Tab>Market Order</Tab>
        <Tab>Limit Order</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <VStack align="stretch" spacing={4}>
            <Select placeholder="Select option" icon={<FaChevronDown />}>
              {market?.options.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </Select>
            <Text fontWeight="bold">Outcome</Text>
            <HStack>
              <Button colorScheme="green" flex={1}>Yes 27¢</Button>
              <Button colorScheme="red" flex={1}>No 74¢</Button>
            </HStack>
            <Text fontWeight="bold">Amount</Text>
            <Input placeholder="$0" />
            <Button colorScheme="blue" isFullWidth>Log In</Button>
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
            <Select placeholder="Select option" icon={<FaChevronDown />}>
              {market?.options.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </Select>
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

// Main Component
const IndividualMarketPage = () => {
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const response = await axios.get<Market>('http://localhost:3001/api/market/1');
        setMarket(response.data);
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
        <Spinner size="xl" />
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
    <Box bg="gray.50" minHeight="100vh">
      <Container maxW="container.xl" py={8}>
        <Flex gap={8}>
          {/* Left Column - Main Content */}
          <Box flex={3} bg="white" p={6} borderRadius="md" boxShadow="lg">
            <MarketHeader market={market} />
            <OptionsList options={market.options} />
          </Box>

          {/* Right Column - Sidebar */}
          <Box flex={1}>
            <Box position="sticky" top={4} height="calc(100vh - 2rem)">
              <BettingInterface market={market} />
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default IndividualMarketPage;