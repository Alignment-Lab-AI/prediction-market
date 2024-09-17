'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box, Container, Input, InputGroup, InputLeftElement, Button, Flex, Text,
  SimpleGrid, VStack, HStack, Badge, Icon, useColorModeValue, Spinner,
  Tabs, TabList, Tab, IconButton, Tooltip, Heading, chakra, Table,
  Thead, Tbody, Tr, Th, Td, useTheme, Alert, AlertIcon, Divider,
  useBreakpointValue
} from '@chakra-ui/react';
import { SearchIcon, ViewIcon } from '@chakra-ui/icons';
import { FaUsers, FaClock, FaCoins, FaRocket, FaList, FaChartLine } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { encodeQuery } from '../../utils/queryUtils';

const MotionBox = motion(Box);

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

const GlassBox = chakra(Box, {
  baseStyle: {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2xl',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
  },
});

const getTimeRemaining = (endTime: number) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = endTime - now;

  if (timeLeft <= 0) return 'Ended';

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return 'Ending soon';
};

const MarketCard = ({ market }: { market: Market }) => {
    const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
    const textColor = useColorModeValue('gray.800', 'white');
    const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
    const timeRemaining = getTimeRemaining(market.end_time);
    const theme = useTheme();
  
    const scrollbarStyles = {
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        width: '8px',
        background: useColorModeValue('rgba(0,0,0,0)', 'rgba(255,255,255,0.1)'),
        borderRadius: '24px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.2)'),
        borderRadius: '24px',
        '&:hover': {
          background: useColorModeValue('rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)'),
        },
      },
    };
  
    return (
      <GlassBox
        bg="transparent"
        height="400px"
        display="flex"
        flexDirection="column"
        position="relative"
        transition="all 0.3s"
        _hover={{
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        <VStack align="stretch" p={6} spacing={4} flex={1} overflowY="hidden">
          <Heading size="md" color={textColor} fontWeight="bold">
            {market.question}
          </Heading>
          <Text fontSize="sm" color={mutedTextColor} noOfLines={2}>
            {market.description}
          </Text>
          <Box overflowY="auto" flex={1} css={scrollbarStyles}>
            {market.options.map((option, index) => (
              <React.Fragment key={index}>
                <Text fontSize="sm" fontWeight="medium" color={textColor} py={2}>
                  {option}
                </Text>
                {index < market.options.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        </VStack>
        <Flex direction="column" p={6} bg="transparent" mt="auto">
          <HStack justify="space-between" mb={4}>
            <HStack>
              <Icon as={FaChartLine} color="blue.500" />
              <Text fontSize="xs" color="blue.500" fontWeight="bold">
                {Math.floor(Math.random() * 1000) + 100} participants
              </Text>
            </HStack>
            <HStack>
              <Icon as={FaClock} color="green.500" />
              <Text fontSize="xs" color="green.500" fontWeight="bold">
                {timeRemaining}
              </Text>
            </HStack>
          </HStack>
          <HStack justify="space-between" mb={4}>
            <Badge colorScheme={market.status === 'Active' ? 'green' : 'red'} px={2} py={1} borderRadius="full">
              {market.status}
            </Badge>
            <HStack>
              <Icon as={FaCoins} color="yellow.500" />
              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                ${(parseInt(market.resolution_bond) / 1000000).toLocaleString()}
              </Text>
            </HStack>
          </HStack>
          <Button
            as={Link}
            href={`/market/${market.id}`}
            colorScheme="blue"
            rightIcon={<FaRocket />}
            borderRadius="full"
            fontWeight="bold"
            width="100%"
            bgGradient={`linear(to-r, ${theme.colors.blue[400]}, ${theme.colors.purple[500]})`}
            _hover={{
              bgGradient: `linear(to-r, ${theme.colors.blue[500]}, ${theme.colors.purple[600]})`,
            }}
          >
            Trade Now
          </Button>
        </Flex>
      </GlassBox>
    );
};

const MarketListItem = ({ market }: { market: Market }) => {
  const textColor = useColorModeValue('gray.700', 'white');
  const timeRemaining = getTimeRemaining(market.end_time);

  return (
    <Tr _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
      <Td>
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold" color={textColor}>{market.question}</Text>
          <Text fontSize="sm" color="gray.500" noOfLines={1}>{market.description}</Text>
        </VStack>
      </Td>
      <Td isNumeric>${(parseInt(market.resolution_bond) / 1000000).toLocaleString()}</Td>
      <Td>
        <Badge colorScheme={market.status === 'Active' ? 'green' : 'red'}>
          {market.status}
        </Badge>
      </Td>
      <Td>{timeRemaining}</Td>
      <Td>
        <Button
          as={Link}
          href={`/market/${market.id}`}
          size="sm"
          colorScheme="blue"
          borderRadius="full"
        >
          Trade
        </Button>
      </Td>
    </Tr>
  );
};

const MarketsPage = () => {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isListView, setIsListView] = useState(false);
    const [startAfter, setStartAfter] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const isMobile = useBreakpointValue({ base: true, md: false });
  
    const fetchMarkets = async () => {
      try {
        const REAL_BASE_URL = process.env.NEXT_PUBLIC_REST_URL;
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
        if (!REAL_BASE_URL || !CONTRACT_ADDRESS) {
          throw new Error("REST URL or Contract Address not defined in environment variables");
        }
  
        const query = {
          markets: {
            status: "Active",
            start_after: startAfter,
            limit: 10
          }
        };
        const encodedQuery = encodeQuery(query);
  
        const response = await axios.get(
          `${REAL_BASE_URL}/cosmwasm/wasm/v1/contract/${CONTRACT_ADDRESS}/smart/${encodedQuery}`
        );
  
        const newMarkets = response.data.data;
        setMarkets(prevMarkets => [...prevMarkets, ...newMarkets]);
        setStartAfter(newMarkets[newMarkets.length - 1]?.id || 0);
        setHasMore(newMarkets.length === 10);
        setIsLoading(false);
  
        console.log("Fetched markets:", newMarkets); // Debug log
      } catch (error) {
        console.error('Error fetching markets:', error);
        setError('Failed to fetch markets. Please try again later.');
        setIsLoading(false);
      }
    };
  
    useEffect(() => {
      fetchMarkets();
    }, []);
  
    const loadMore = () => {
      fetchMarkets();
    };
  
    const filteredMarkets = markets.filter(market => 
      market.question.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (activeCategory === 'All' || market.category.toLowerCase() === activeCategory.toLowerCase())
    );
  
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Box bg="transparent" minHeight="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center" mb={8} flexDirection={isMobile ? 'column' : 'row'}>
            <Heading 
              fontSize={{ base: "3xl", md: "4xl" }}
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
              fontWeight="extrabold"
              mb={isMobile ? 4 : 0}
            >
              Explore Markets
            </Heading>
            <HStack spacing={4} width={isMobile ? "100%" : "auto"}>
              <InputGroup maxW={isMobile ? "100%" : "md"}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search markets" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg={useColorModeValue('white', 'gray.800')}
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
                  borderRadius="full"
                />
              </InputGroup>
              <Tooltip label={isListView ? "Grid View" : "List View"}>
                <IconButton
                  aria-label="Toggle view"
                  icon={isListView ? <ViewIcon /> : <Icon as={FaList} />}
                  onClick={() => setIsListView(!isListView)}
                  borderRadius="full"
                />
              </Tooltip>
            </HStack>
          </Flex>

          <Tabs 
            variant="soft-rounded" 
            colorScheme="blue" 
            onChange={(index) => setActiveCategory(['All', 'Sports', 'Politics', 'Entertainment', 'Technology', 'Finance', 'Other'][index])}
          >
            <TabList overflowX="auto" py={2} mb={6}>
              <Tab>All</Tab>
              <Tab>Sports</Tab>
              <Tab>Politics</Tab>
              <Tab>Entertainment</Tab>
              <Tab>Technology</Tab>
              <Tab>Finance</Tab>
              <Tab>Other</Tab>
            </TabList>
          </Tabs>

          {isLoading && markets.length === 0 ? (
            <Flex justify="center" align="center" height="200px">
              <Spinner size="xl" color="blue.500" thickness="4px" />
            </Flex>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <>
              {isListView ? (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Market</Th>
                        <Th isNumeric>Volume</Th>
                        <Th>Status</Th>
                        <Th>Time Remaining</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredMarkets.map(market => (
                        <MarketListItem key={market.id} market={market} />
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} minHeight="400px">
                  <AnimatePresence>
                    {filteredMarkets.map(market => (
                      <MotionBox
                        key={market.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <MarketCard market={market} />
                      </MotionBox>
                    ))}
                  </AnimatePresence>
                </SimpleGrid>
              )}

              {filteredMarkets.length === 0 && (
                <Text textAlign="center" color={textColor} fontSize="xl">
                  No markets found matching your criteria.
                </Text>
              )}

{hasMore && (
                <Flex justify="center" mt={12}>
                  <Button
                    onClick={loadMore}
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    colorScheme="blue"
                    size="lg"
                    borderRadius="full"
                    px={8}
                    bgGradient="linear(to-r, blue.400, purple.500)"
                    _hover={{
                      bgGradient: "linear(to-r, blue.500, purple.600)",
                    }}
                    isLoading={isLoading}
                  >
                    Load More
                  </Button>
                </Flex>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default MarketsPage;