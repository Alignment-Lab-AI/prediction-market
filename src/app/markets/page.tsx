'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Flex,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
  Spinner,
  Select,
  Tabs,
  TabList,
  Tab,
  IconButton,
  Tooltip,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { SearchIcon, StarIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaGift, FaChartLine, FaUsers, FaFootballBall, FaBitcoin, FaGlobeAmericas } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const MotionBox = motion(Box);

interface Market {
  id: number;
  creator: string;
  question: string;
  description: string;
  options: string[];
  start_time: string;
  end_time: string;
  status: string;
  collateral_amount: string;
  reward_amount: string;
}

const OptionButton = ({ option }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Flex
      justify="space-between"
      align="center"
      p={2}
      bg={bgColor}
      _hover={{ bg: hoverBgColor }}
      borderRadius="md"
      transition="all 0.2s"
    >
      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
        {option}
      </Text>
      <Text fontSize="xs" color="gray.500">
        50%
      </Text>
    </Flex>
  );
};

const MarketCard = ({ market }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Link href={`/market/${market.id}`} passHref>
      <MotionBox
        as="a"
        whileHover={{ y: -5, boxShadow: '2xl' }}
        transition={{ duration: 0.3 }}
        cursor="pointer"
      >
        <Box 
          borderWidth="1px" 
          borderRadius="lg" 
          overflow="hidden" 
          bg={cardBg}
          borderColor={borderColor}
          boxShadow="md"
          height="400px"
          display="flex"
          flexDirection="column"
        >
          <Box p={6}>
            <VStack align="stretch" spacing={4}>
              <Flex justify="space-between" align="center">
                <Heading size="md" noOfLines={2} color={textColor}>
                  {market.question}
                </Heading>
                <Icon as={FaChartLine} color="blue.500" boxSize={5} />
              </Flex>
              <Text fontSize="sm" color="gray.500" noOfLines={2}>
                {market.description}
              </Text>
              <Flex justify="space-between" align="center">
                <Badge colorScheme={market.status === 'Active' ? 'green' : 'red'} px={2} py={1} borderRadius="full">
                  {market.status}
                </Badge>
                <Text fontSize="sm" fontWeight="bold" color="purple.500">
                  Volume: {parseInt(market.collateral_amount).toLocaleString()} UCMDX
                </Text>
              </Flex>
            </VStack>
          </Box>
          <Divider />
          <Box flex={1} overflowY="auto" p={4}>
            <VStack align="stretch" spacing={2}>
              {market.options.map((option, index) => (
                <OptionButton key={index} option={option} />
              ))}
            </VStack>
          </Box>
          <Divider />
          <Flex justify="space-between" align="center" p={4}>
            <HStack spacing={2}>
              <Icon as={FaUsers} color="gray.500" />
              <Text fontSize="xs" color="gray.500">
                1,234 participants
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Tooltip label="Gift">
                <IconButton
                  aria-label="Gift"
                  icon={<FaGift />}
                  size="sm"
                  variant="ghost"
                  colorScheme="purple"
                  onClick={(e) => e.preventDefault()}
                />
              </Tooltip>
              <Tooltip label="Favorite">
                <IconButton
                  aria-label="Favorite"
                  icon={<StarIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="yellow"
                  onClick={(e) => e.preventDefault()}
                />
              </Tooltip>
            </HStack>
          </Flex>
        </Box>
      </MotionBox>
    </Link>
  );
};

const MarketsPage = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await axios.get<Market[]>('http://localhost:3001/api/markets');
        setMarkets(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching markets:', error);
        setError('Failed to fetch markets. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const filteredMarkets = markets.filter(market => 
    market.question.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filter === 'All' || market.status === filter)
  );

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50)',
    'linear(to-br, gray.900, purple.900)'
  );
  const textColor = useColorModeValue('gray.700', 'gray.200');

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bgGradient={bgGradient}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bgGradient={bgGradient}>
        <Text color="red.500" fontSize="xl" fontWeight="bold">{error}</Text>
      </Box>
    );
  }

  return (
    <Box bgGradient={bgGradient} minHeight="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack spacing={10} align="stretch">
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" wrap="wrap">
            <Heading size="2xl" mb={{ base: 4, md: 0 }} color={textColor}>
              Explore Markets
            </Heading>
            <HStack spacing={4}>
              <InputGroup maxW="md">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search markets" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg={useColorModeValue('white', 'gray.800')}
                  border="none"
                  _focus={{ boxShadow: 'outline' }}
                />
              </InputGroup>
              <Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                maxW="200px"
                bg={useColorModeValue('white', 'gray.800')}
                border="none"
                _focus={{ boxShadow: 'outline' }}
              >
                <option value="All">All Markets</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Settled">Settled</option>
                <option value="Disputed">Disputed</option>
              </Select>
            </HStack>
          </Flex>

          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList overflowX="auto" py={2}>
              <Tab><Icon as={FaGlobeAmericas} mr={2} /> Politics</Tab>
              <Tab><Icon as={FaFootballBall} mr={2} /> Sports</Tab>
              <Tab><Icon as={FaBitcoin} mr={2} /> Cryptocurrency</Tab>
              <Tab><Icon as={FaChartLine} mr={2} /> Random</Tab>
            </TabList>
          </Tabs>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {filteredMarkets.map(market => (
              <MarketCard key={market.id} market={market} />
            ))}
          </SimpleGrid>

          {filteredMarkets.length === 0 && (
            <Text textAlign="center" color={textColor} fontSize="xl">
              No markets found matching your criteria.
            </Text>
          )}

          {filteredMarkets.length > 0 && (
            <Flex justify="center" mt={8}>
              <Button colorScheme="blue" size="lg" rightIcon={<ChevronRightIcon />}>
                Load More
              </Button>
            </Flex>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default MarketsPage;