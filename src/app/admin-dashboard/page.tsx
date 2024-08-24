'use client';

import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  extendTheme,
  Box,
  Container,
  Heading,
  Text,
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
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  GridItem,
  Icon,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Tooltip,
} from '@chakra-ui/react';
import { FaChartLine, FaUsers, FaCoins, FaGavel, FaSearch, FaExclamationTriangle, FaPause, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';
import { getRealConfig, getWhitelistedAddresses } from '../../utils/api';
import { broadcastTransaction, connectKeplr } from '../../utils/web3';
import { DeliverTxResponse } from "@cosmjs/stargate";

const theme = extendTheme({
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
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

interface Market {
  id: number;
  question: string;
  status: string;
}

interface Config {
  admin: string;
  coin_denom: string;
  platform_fee: number;
  protocol_treasury_account: string;
  challenging_time: number;
  voting_time: number;
}

const AdminDashboard = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = "blue.400";
  const gradientColor = "linear(to-r, blue.400, purple.500)";

  const fetchWhitelistedAddresses = async () => {
    try {
      const addresses = await getWhitelistedAddresses();
      setWhitelistedAddresses(addresses || []);
    } catch (error) {
      console.error('Error fetching whitelisted addresses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch whitelisted addresses.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketsResponse, configResponse] = await Promise.all([
          axios.get<Market[]>('http://localhost:3001/api/markets'),
          getRealConfig(),
        ]);

        setMarkets(marketsResponse.data);
        setConfig(configResponse);
        await fetchWhitelistedAddresses();
      } catch (err) {
        console.error('Error fetching data:', err);
        toast({
          title: "Error fetching data",
          description: "There was an error loading the dashboard data. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleAddToWhitelist = async () => {
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
        add_to_whitelist: {
          address: newAddress
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

      const safeStringify = (obj: any) => {
        return JSON.stringify(obj, (key, value) =>
          typeof value === 'bigint'
            ? value.toString()
            : value
        );
      };
  
      console.log("Sending transaction to add to whitelist:", safeStringify(message));
  
      const result = await broadcastTransaction(chainId, [message]);
  
      console.log("Add to whitelist result:", safeStringify(result));
  
      // Update the UI state immediately
      setWhitelistedAddresses(prevAddresses => [...prevAddresses, newAddress]);
      setNewAddress(''); // Clear the input field
  
      toast({
        title: "Address Added",
        description: `${newAddress} has been added to the whitelist. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
    } catch (err) {
      console.error("Error adding address to whitelist:", err);
      toast({
        title: "Error",
        description: "Failed to add address to whitelist. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveFromWhitelist = async (address: string) => {
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
        remove_from_whitelist: {
          address: address
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

      const safeStringify = (obj: any) => {
        return JSON.stringify(obj, (key, value) =>
          typeof value === 'bigint'
            ? value.toString()
            : value
        );
      };
  
      console.log("Sending transaction to remove from whitelist:", safeStringify(message));
  
      const result = await broadcastTransaction(chainId, [message]);
  
      console.log("Remove from whitelist result:", safeStringify(result));
  
      // Update the UI state immediately
      setWhitelistedAddresses(prevAddresses => prevAddresses.filter(a => a !== address));
      
      toast({
        title: "Address Removed",
        description: `${address} has been removed from the whitelist. Transaction hash: ${result.transactionHash}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
    } catch (err) {
      console.error("Error removing address from whitelist:", err);
      toast({
        title: "Error",
        description: "Failed to remove address from whitelist. " + (err instanceof Error ? err.message : "Unknown error occurred"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleMarketAction = async (marketId: number, action: 'pause' | 'close' | 'cancel') => {
    try {
      await axios.post(`http://localhost:3001/api/market-action`, { marketId, action });
      setMarkets(markets.map(market => 
        market.id === marketId 
          ? { ...market, status: action === 'pause' ? 'Paused' : action === 'close' ? 'Closed' : 'Cancelled' }
          : market
      ));
      toast({
        title: "Market Updated",
        description: `Market ${marketId} has been ${action}ed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${action} market.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg={bgColor}>
        <Spinner size="xl" color={accentColor} thickness="4px" />
      </Box>
    );
  }

  const filteredMarkets = markets.filter(market => 
    filter === 'All' || market.status === filter
  );

  return (
    <ChakraProvider theme={theme}>
      <Box bg={bgColor} minHeight="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack spacing={10} align="stretch">
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Flex 
                justifyContent="space-between" 
                alignItems="center" 
                bg={cardBgColor} 
                p={8} 
                borderRadius="2xl" 
                boxShadow="xl"
                bgGradient={gradientColor}
              >
                <VStack align="start" spacing={1}>
                  <Heading size="2xl" color="white">Admin Dashboard</Heading>
                  <Text color="whiteAlpha.800">Manage markets, whitelist, and platform settings</Text>
                </VStack>
                <Avatar size="xl" icon={<Icon as={FaUsers} fontSize="3rem" />} bg="white" color={accentColor} />
              </Flex>
            </MotionBox>

            <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={8}>
              {[
                { label: 'Total Markets', icon: FaChartLine, value: markets.length, color: 'blue.400' },
                { label: 'Whitelisted Users', icon: FaUsers, value: whitelistedAddresses.length, color: 'green.400' },
                { label: 'Platform Fee', icon: FaCoins, value: `${config?.platform_fee/ 100}%`, color: 'yellow.400' },
                { label: 'Voting Time', icon: FaGavel, value: `${config?.voting_time / 3600}h`, color: 'purple.400' },
              ].map((stat, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "2xl" }}
                >
                  <Stat 
                    px={6} 
                    py={8} 
                    bg={cardBgColor}
                    borderRadius="2xl" 
                    boxShadow="xl"
                    border="1px solid"
                    borderColor={borderColor}
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      top="-20px"
                      left="-20px"
                      width="100px"
                      height="100px"
                      bg={`${stat.color}20`}
                      borderRadius="full"
                      filter="blur(20px)"
                    />
                    <StatLabel fontWeight="medium" color={textColor} fontSize="lg">
                      <HStack spacing={2}>
                        <Icon as={stat.icon} color={stat.color} boxSize={6} />
                        <Text>{stat.label}</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold" color={stat.color} mt={2}>
                      {stat.value}
                    </StatNumber>
                  </Stat>
                </MotionBox>
              ))}
            </Grid>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
                <TabList bg={cardBgColor} p={4} borderRadius="2xl" boxShadow="md">
                  <Tab fontSize="lg" fontWeight="medium" _selected={{ color: 'white', bg: accentColor }}>Market Management</Tab>
                  <Tab fontSize="lg" fontWeight="medium" _selected={{ color: 'white', bg: accentColor }}>Whitelist Management</Tab>
                  <Tab fontSize="lg" fontWeight="medium" _selected={{ color: 'white', bg: accentColor }}>Configuration</Tab>
                </TabList>

                <TabPanels mt={6}>
                  <TabPanel>
                    <Box bg={cardBgColor} p={6} borderRadius="2xl" boxShadow="xl">
                      <Heading size="lg" bgGradient={gradientColor} bgClip="text" mb={6}>Market Management</Heading>
                      <HStack mb={4}>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FaSearch} color="gray.300" />
                          </InputLeftElement>
                          <Input placeholder="Search markets" onChange={(e) => setFilter(e.target.value)} />
                        </InputGroup>
                        <Button onClick={() => setFilter('All')}>All</Button>
                        <Button onClick={() => setFilter('Active')}>Active</Button>
                        <Button onClick={() => setFilter('Paused')}>Paused</Button>
                        <Button onClick={() => setFilter('Closed')}>Closed</Button>
                      </HStack>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>ID</Th>
                            <Th>Question</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredMarkets.map((market) => (
                            <Tr key={market.id}>
                              <Td>{market.id}</Td>
                              <Td>{market.question}</Td>
                              <Td>
                                <Badge colorScheme={market.status === 'Active' ? 'green' : 'yellow'}>
                                  {market.status}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Tooltip label="Pause">
                                    <Button size="sm" colorScheme="yellow" onClick={() => handleMarketAction(market.id, 'pause')}>
                                      <Icon as={FaPause} />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip label="Close">
                                    <Button size="sm" colorScheme="red" onClick={() => handleMarketAction(market.id, 'close')}>
                                      <Icon as={FaTimes} />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip label="Cancel">
                                    <Button size="sm" colorScheme="purple" onClick={() => handleMarketAction(market.id, 'cancel')}>
                                      <Icon as={FaTimes} />
                                    </Button>
                                  </Tooltip>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box bg={cardBgColor} p={6} borderRadius="2xl" boxShadow="xl">
                      <Heading size="lg" bgGradient={gradientColor} bgClip="text" mb={6}>Whitelist Management</Heading>
                      <HStack mb={4}>
                        <Input placeholder="Enter address to whitelist" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                        <Button onClick={handleAddToWhitelist} colorScheme="blue">Add</Button>
                      </HStack>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Address</Th>
                            <Th>Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {whitelistedAddresses.map((address) => (
                            <Tr key={address}>
                              <Td>{address}</Td>
                              <Td>
                                <Button colorScheme="red" size="sm" onClick={() => handleRemoveFromWhitelist(address)}>
                                  Remove
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box bg={cardBgColor} p={6} borderRadius="2xl" boxShadow="xl">
                      <Heading size="lg" bgGradient={gradientColor} bgClip="text" mb={6}>Platform Configuration</Heading>
                      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Admin Address</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.admin}</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Coin Denomination</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.coin_denom}</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Platform Fee</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.platform_fee}%</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Treasury Account</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.protocol_treasury_account}</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Challenging Time</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.challenging_time / 3600} hours</StatNumber>
                          </Stat>
                        </GridItem>
                        <GridItem>
                          <Stat>
                            <StatLabel fontWeight="medium" color={textColor}>Voting Time</StatLabel>
                            <StatNumber fontSize="md" color={accentColor}>{config?.voting_time / 3600} hours</StatNumber>
                          </Stat>
                        </GridItem>
                      </Grid>
                      <Button 
                        mt={6} 
                        bgGradient={gradientColor} 
                        color="white" 
                        _hover={{
                          bgGradient: "linear(to-r, blue.500, purple.600)",
                        }}
                        onClick={() => toast({
                          title: "Feature not implemented",
                          description: "Editing configuration is not available in this demo.",
                          status: "info",
                          duration: 3000,
                          isClosable: true,
                        })}
                      >
                        Edit Configuration
                      </Button>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Box bg="red.50" borderRadius="2xl" boxShadow="xl" p={6}>
                <Heading size="lg" color="red.600" mb={4}>Emergency Controls</Heading>
                <HStack spacing={4}>
                  <Button
                    colorScheme="red"
                    leftIcon={<Icon as={FaExclamationTriangle} />}
                    onClick={() => toast({
                      title: "Emergency Shutdown",
                      description: "This action is not available in the demo.",
                      status: "warning",
                      duration: 3000,
                      isClosable: true,
                    })}
                  >
                    Emergency Shutdown
                  </Button>
                  <Button
                    colorScheme="yellow"
                    leftIcon={<Icon as={FaPause} />}
                    onClick={() => toast({
                      title: "Pause All Markets",
                      description: "This action is not available in the demo.",
                      status: "warning",
                      duration: 3000,
                      isClosable: true,
                    })}
                  >
                    Pause All Markets
                  </Button>
                  <Button
                    colorScheme="blue"
                    leftIcon={<Icon as={FaUsers} />}
                    onClick={() => toast({
                      title: "User Lockout",
                      description: "This action is not available in the demo.",
                      status: "warning",
                      duration: 3000,
                      isClosable: true,
                    })}
                  >
                    Temporary User Lockout
                  </Button>
                </HStack>
                <Text mt={4} fontSize="sm" color="red.600">
                  Warning: These controls should only be used in emergency situations. All actions are logged and require additional confirmation.
                </Text>
              </Box>
            </MotionBox>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default AdminDashboard;